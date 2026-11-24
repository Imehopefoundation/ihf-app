"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";
import { setProfileName } from "@/lib/data/profile";
import { validate, z, personName } from "@/lib/validation";
import { logger } from "@/lib/logging/logger";

export interface NameState {
  status: "idle" | "error" | "success";
  message?: string;
}

export async function saveNameAction(_prev: NameState, formData: FormData): Promise<NameState> {
  const { user } = await requireSessionUser("/app/account");
  const supabase = await createClient();

  const parsed = validate(z.object({ name: personName }), { name: formData.get("name") });
  if (!parsed.success) {
    return { status: "error", message: "Enter your name (2–80 characters)." };
  }

  try {
    await setProfileName(supabase, user.id, parsed.data.name);
    logger.info("profile_name_set", {});
  } catch (e) {
    logger.error("profile_name_failed", { code: (e as { code?: string }).code });
    return { status: "error", message: "We couldn't save that. Please try again." };
  }
  revalidatePath("/app");
  revalidatePath("/app/account");
  return { status: "success" };
}
