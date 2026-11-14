"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";
import { validate, z, email } from "@/lib/validation";
import { verifyInviteToken } from "@/lib/security/invite";
import { defaultRateLimiter, RATE_LIMITS } from "@/lib/security/rate-limit";
import { logger } from "@/lib/logging/logger";

export interface AuthState {
  status: "idle" | "error" | "check-email";
  message?: string;
}

const credsSchema = z.object({
  email,
  password: z.string().min(8, "Use at least 8 characters").max(200),
});

async function rateLimited(scope: string): Promise<boolean> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  return !defaultRateLimiter.check(`${scope}:${ip}`, RATE_LIMITS.auth).allowed;
}

// Generic message for every auth failure — never reveal whether an account
// exists (CLAUDE.md: no user enumeration).
const GENERIC = "Those details didn't match. Please check and try again.";

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (await rateLimited("signin")) {
    return { status: "error", message: "Too many attempts. Please wait a minute and try again." };
  }
  const parsed = validate(credsSchema, {
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { status: "error", message: GENERIC };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (error) {
      logger.warn("signin_failed", { code: error.status });
      return { status: "error", message: GENERIC };
    }
  } catch {
    return { status: "error", message: "Sign-in is temporarily unavailable. Please try again soon." };
  }
  logger.info("signin_ok", {});
  redirect(safeNext(formData.get("next")));
}

/** Only allow redirecting back into the LMS, never to an arbitrary URL. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next === "/app" || next.startsWith("/app/") ? next : "/app";
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (await rateLimited("signup")) {
    return { status: "error", message: "Too many attempts. Please wait a minute and try again." };
  }

  // Registration is BY INVITATION ONLY. A valid, unexpired, signed invite token
  // is required, and the account email is taken from the token — never from the
  // client — so an invite can only ever create the invited address.
  const token = typeof formData.get("token") === "string" ? String(formData.get("token")) : "";
  const invite = verifyInviteToken(token);
  if (!invite) {
    return {
      status: "error",
      message: "This invitation link is invalid or has expired. Please ask IHF for a new one.",
    };
  }

  const password = String(formData.get("password") ?? "");
  if (!z.string().min(8).max(200).safeParse(password).success) {
    return { status: "error", message: "Choose a password of at least 8 characters." };
  }

  let hasSession = false;
  try {
    const supabase = await createClient();
    const origin = publicEnv().NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const { data, error } = await supabase.auth.signUp({
      email: invite.email, // bound to the invited address
      password,
      options: { emailRedirectTo: `${origin}/confirm` },
    });
    if (error) {
      logger.warn("signup_failed", { code: error.status });
      // The invited email is already registered (invites are single-use), or
      // another error occurred. Point them to sign-in.
      return {
        status: "error",
        message: "That invitation has already been used. Try signing in instead.",
      };
    }
    hasSession = Boolean(data.session);
  } catch {
    return { status: "error", message: "Sign-up is temporarily unavailable. Please try again soon." };
  }
  logger.info("signup_ok", {});
  // Email confirmation disabled -> already signed in. Otherwise, confirm first.
  if (hasSession) redirect("/app");
  return { status: "check-email", message: "Check your email to confirm your account, then sign in." };
}

export async function signOut(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore — we redirect regardless
  }
  redirect("/sign-in");
}
