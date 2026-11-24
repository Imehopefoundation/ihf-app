"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";
import { setProfileName } from "@/lib/data/profile";
import { validate, z, personName } from "@/lib/validation";
import { logger } from "@/lib/logging/logger";

export interface OnboardState {
  status: "idle" | "error";
  message?: string;
}

/** First-run: capture the member's name, then send them into the LMS. */
export async function completeOnboardingAction(
  _prev: OnboardState,
  formData: FormData,
): Promise<OnboardState> {
  const { user } = await requireSessionUser("/app");
  const supabase = await createClient();

  const parsed = validate(z.object({ name: personName }), { name: formData.get("name") });
  if (!parsed.success) {
    return { status: "error", message: "Please enter your name (2–80 characters)." };
  }

  try {
    await setProfileName(supabase, user.id, parsed.data.name);
    logger.info("onboarding_name_set", {});
  } catch (e) {
    logger.error("onboarding_failed", { code: (e as { code?: string }).code });
    return { status: "error", message: "Something went wrong. Please try again." };
  }
  redirect("/app");
}
