import "server-only";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { cronSecret, siteUrl } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMailer } from "@/lib/email/mailer";
import { classReminder } from "@/lib/email/templates";
import {
  CLASS_REMINDER,
  listMenteeUserIds,
  existingKeys,
  insertQueued,
  pendingForRefs,
  markStatus,
  emailForUser,
  type QueuedRow,
} from "@/lib/data/notifications";
import { logger } from "@/lib/logging/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: Request): boolean {
  const secret = cronSecret();
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Date string (UTC) for `days` from now, as YYYY-MM-DD. */
function dateOffset(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const admin = createAdminClient();
  const mailer = getMailer();
  const target = dateOffset(1); // remind one day before

  // Upcoming classes on the target date.
  const { data: events, error } = await admin
    .from("calendar_events")
    .select("id, title, event_date, created_by")
    .eq("event_type", "class")
    .eq("event_date", target);
  if (error) {
    logger.error("reminders_query_failed", { code: (error as { code?: string }).code });
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const classes = events ?? [];
  if (classes.length === 0) {
    return NextResponse.json({ ok: true, classes: 0, queued: 0, sent: 0 });
  }

  const eventMap = new Map(classes.map((e) => [e.id as string, e]));
  const eventIds = classes.map((e) => e.id as string);
  const mentees = await listMenteeUserIds(admin);

  // Desired (user, event) pairs: every mentee + the class's mentor.
  const desired: QueuedRow[] = [];
  const seen = new Set<string>();
  for (const e of classes) {
    const recipients = new Set<string>([...mentees, e.created_by as string]);
    for (const userId of recipients) {
      const key = `${userId}:${e.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      desired.push({ userId, kind: CLASS_REMINDER, refId: e.id as string, subject: "Upcoming class" });
    }
  }

  // Queue only the ones not already recorded (idempotent across runs).
  const already = await existingKeys(admin, CLASS_REMINDER, eventIds);
  const toQueue = desired.filter((r) => !already.has(`${r.userId}:${r.refId}`));
  await insertQueued(admin, toQueue);

  // Deliver everything still pending for these events.
  const pending = await pendingForRefs(admin, CLASS_REMINDER, eventIds);
  let sent = 0;
  let failed = 0;
  const loginUrl = `${siteUrl()}/app`;

  for (const n of pending) {
    const ev = n.refId ? eventMap.get(n.refId) : undefined;
    if (!ev) continue;
    try {
      const email = await emailForUser(admin, n.userId);
      if (!email) {
        await markStatus(admin, n.id, "failed");
        failed++;
        continue;
      }
      if (!mailer.live) continue; // email not configured: leave queued for later
      const tmpl = classReminder({
        title: ev.title as string,
        date: ev.event_date as string,
        loginUrl,
      });
      await mailer.send({ to: email, ...tmpl });
      await markStatus(admin, n.id, "sent");
      sent++;
    } catch {
      await markStatus(admin, n.id, "failed");
      failed++;
    }
  }

  logger.info("reminders_run", {
    classes: classes.length,
    queued: toQueue.length,
    sent,
    failed,
    live: mailer.live,
  });
  return NextResponse.json({
    ok: true,
    classes: classes.length,
    queued: toQueue.length,
    sent,
    failed,
  });
}
