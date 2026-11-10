"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { validate, z, email, personName, messageBody, boundedString } from "@/lib/validation";
import { defaultRateLimiter, RATE_LIMITS } from "@/lib/security/rate-limit";
import { logger } from "@/lib/logging/logger";

export interface FormState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

const CONTACT_TOPICS = ["General", "Mentee application", "Mentor enquiry", "Giving", "Safeguarding", "Partnership"] as const;

const contactSchema = z.object({
  name: personName,
  email,
  topic: z.enum(CONTACT_TOPICS),
  message: messageBody,
});

const supporterSchema = z.object({
  name: boundedString(120).optional().or(z.literal("").transform(() => undefined)),
  email,
});

/** Per-request guards shared by both public forms. Returns an error string or null. */
async function guard(scope: string): Promise<string | null> {
  const h = await headers();
  // CSRF defence in depth (Next also checks this for Server Actions).
  const origin = h.get("origin");
  const host = h.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) return "Request blocked. Please reload and try again.";
    } catch {
      return "Request blocked. Please reload and try again.";
    }
  }
  // Per-IP rate limit.
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const rl = defaultRateLimiter.check(`${scope}:${ip}`, RATE_LIMITS.publicForm);
  if (!rl.allowed) return "Too many attempts. Please wait a minute and try again.";
  return null;
}

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const blocked = await guard("contact");
  if (blocked) return { status: "error", message: blocked };

  const parsed = validate(contactSchema, {
    name: formData.get("name"),
    email: formData.get("email"),
    topic: formData.get("topic"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors: parsed.errors };
  }

  try {
    const supabase = await createClient();
    // No .select(): the public may submit but not read messages back.
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      topic: parsed.data.topic,
      message: parsed.data.message,
    });
    if (error) {
      logger.error("contact_submit_failed", { code: error.code });
      return { status: "error", message: "Something went wrong sending your message. Please try again." };
    }
    logger.info("contact_submitted", { topic: parsed.data.topic });
    return { status: "success", message: "Thank you — your message has been received. We'll be in touch." };
  } catch {
    // Env not configured yet (no Supabase project): fail honestly, don't pretend.
    logger.error("contact_submit_unavailable", {});
    return { status: "error", message: "Messages aren't available just yet. Please try again soon." };
  }
}

export async function subscribeSupporter(_prev: FormState, formData: FormData): Promise<FormState> {
  const blocked = await guard("supporter");
  if (blocked) return { status: "error", message: blocked };

  // Explicit opt-in is required (also enforced by the DB policy).
  if (formData.get("optIn") !== "on") {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: { optIn: ["Please tick the box to confirm you'd like to receive updates."] },
    };
  }

  const parsed = validate(supporterSchema, {
    name: formData.get("name") ?? "",
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors: parsed.errors };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("supporters").insert({
      email: parsed.data.email,
      name: parsed.data.name ?? null,
      opt_in: true,
    });
    // 23505 = unique violation: already subscribed. Treat as success (no enumeration).
    if (error && error.code !== "23505") {
      logger.error("supporter_subscribe_failed", { code: error.code });
      return { status: "error", message: "Something went wrong. Please try again." };
    }
    logger.info("supporter_subscribed", {});
    return { status: "success", message: "Thank you — please watch your inbox to confirm." };
  } catch {
    logger.error("supporter_subscribe_unavailable", {});
    return { status: "error", message: "Sign-up isn't available just yet. Please try again soon." };
  }
}

export { CONTACT_TOPICS };
