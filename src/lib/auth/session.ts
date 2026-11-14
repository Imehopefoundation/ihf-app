/**
 * Server-only auth/role helpers for the LMS. Every query runs under the
 * caller's RLS context (user-scoped client). Roles come from the `user_roles`
 * table — the authoritative source is RLS in the database; these helpers only
 * decide what to render and which routes to allow (defence in depth).
 */
import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type AppRole =
  | "visitor"
  | "supporter"
  | "parent_guardian"
  | "mentee"
  | "mentor"
  | "volunteer"
  | "programme_lead"
  | "quality_assurance"
  | "finance"
  | "communications"
  | "safeguarding_officer"
  | "admin";

export interface SessionUser {
  user: User;
  roles: AppRole[];
}

/** The signed-in user and their roles, or null if not authenticated. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("user_roles").select("role");
  const roles = (data ?? []).map((r) => r.role as AppRole);
  return { user, roles };
}

/** Require a signed-in user, else send to the sign-in gateway. */
export async function requireSessionUser(nextPath?: string): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) {
    redirect(nextPath ? `/sign-in?next=${encodeURIComponent(nextPath)}` : "/sign-in");
  }
  return session;
}

export function hasAnyRole(roles: AppRole[], allowed: readonly AppRole[]): boolean {
  return roles.some((r) => allowed.includes(r));
}

/**
 * Require that the user holds at least one of `allowed`; otherwise bounce to the
 * LMS dashboard. admin always passes. Enforced per-page, never UI-only.
 */
export async function requireRole(allowed: readonly AppRole[]): Promise<SessionUser> {
  const session = await requireSessionUser();
  if (!hasAnyRole(session.roles, [...allowed, "admin"])) {
    redirect("/app");
  }
  return session;
}
