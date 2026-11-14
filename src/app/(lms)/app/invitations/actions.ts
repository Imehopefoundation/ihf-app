"use server";

import { headers } from "next/headers";
import { requireRole } from "@/lib/auth/session";
import { createInviteToken } from "@/lib/security/invite";
import { publicEnv } from "@/lib/env";
import { validate, z, email as emailSchema } from "@/lib/validation";
import { logger } from "@/lib/logging/logger";

export interface InviteState {
  status: "idle" | "error" | "ok";
  message?: string;
  link?: string;
  email?: string;
}

async function origin(): Promise<string> {
  const configured = publicEnv().NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

/** Admin-only: mint a signed, email-bound, expiring invite link to share. */
export async function generateInviteAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  await requireRole(["admin"]);

  const parsed = validate(z.object({ email: emailSchema }), { email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const token = createInviteToken(parsed.data.email);
  const link = `${await origin()}/invite/${encodeURIComponent(token)}`;
  logger.info("invite_created", {});
  return { status: "ok", email: parsed.data.email, link };
}
