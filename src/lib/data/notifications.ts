import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export const CLASS_REMINDER = "class_reminder";

export interface QueuedRow {
  userId: string;
  kind: string;
  refId: string;
  subject: string;
}

export interface PendingNotification {
  id: string;
  userId: string;
  refId: string | null;
}

/** All user_ids currently holding the mentee role. */
export async function listMenteeUserIds(admin: SupabaseClient): Promise<string[]> {
  const { data, error } = await admin.from("user_roles").select("user_id").eq("role", "mentee");
  if (error) throw error;
  return Array.from(new Set((data ?? []).map((r) => r.user_id as string)));
}

/** Keys `${userId}:${refId}` that already have a notification of this kind. */
export async function existingKeys(
  admin: SupabaseClient,
  kind: string,
  refIds: string[],
): Promise<Set<string>> {
  if (refIds.length === 0) return new Set();
  const { data, error } = await admin
    .from("notifications")
    .select("user_id, ref_id")
    .eq("kind", kind)
    .in("ref_id", refIds);
  if (error) throw error;
  return new Set((data ?? []).map((r) => `${r.user_id}:${r.ref_id}`));
}

/** Insert queued rows; tolerates the unique-index conflict from a racing run. */
export async function insertQueued(admin: SupabaseClient, rows: QueuedRow[]): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await admin.from("notifications").insert(
    rows.map((r) => ({
      user_id: r.userId,
      kind: r.kind,
      ref_id: r.refId,
      channel: "email",
      subject: r.subject,
      status: "queued",
    })),
  );
  // 23505 = unique_violation: another run already queued it. Not an error.
  if (error && (error as { code?: string }).code !== "23505") throw error;
}

/** Notifications still awaiting delivery for the given related entities. */
export async function pendingForRefs(
  admin: SupabaseClient,
  kind: string,
  refIds: string[],
): Promise<PendingNotification[]> {
  if (refIds.length === 0) return [];
  const { data, error } = await admin
    .from("notifications")
    .select("id, user_id, ref_id")
    .eq("kind", kind)
    .in("ref_id", refIds)
    .in("status", ["queued", "failed"]);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    userId: r.user_id as string,
    refId: (r.ref_id as string | null) ?? null,
  }));
}

export async function markStatus(
  admin: SupabaseClient,
  id: string,
  status: "sent" | "failed",
): Promise<void> {
  const patch: Record<string, unknown> = { status };
  if (status === "sent") patch.sent_at = new Date().toISOString();
  const { error } = await admin.from("notifications").update(patch).eq("id", id);
  if (error) throw error;
}

/** Resolve a user's email via the auth admin API (service_role only). */
export async function emailForUser(admin: SupabaseClient, userId: string): Promise<string | null> {
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error) return null;
  return data.user?.email ?? null;
}
