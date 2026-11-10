"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";
import { validate, z, email } from "@/lib/validation";
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
  redirect("/account");
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (await rateLimited("signup")) {
    return { status: "error", message: "Too many attempts. Please wait a minute and try again." };
  }
  const parsed = validate(credsSchema, {
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Enter a valid email and a password of at least 8 characters." };
  }

  try {
    const supabase = await createClient();
    const origin = publicEnv().NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { emailRedirectTo: `${origin}/auth/confirm` },
    });
    if (error) {
      logger.warn("signup_failed", { code: error.status });
      // Still generic to avoid revealing whether the email is registered.
      return { status: "check-email", message: "Check your email to confirm your account." };
    }
  } catch {
    return { status: "error", message: "Sign-up is temporarily unavailable. Please try again soon." };
  }
  logger.info("signup_ok", {});
  return { status: "check-email", message: "Check your email to confirm your account." };
}

export async function signOut(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore — we redirect regardless
  }
  redirect("/auth");
}
