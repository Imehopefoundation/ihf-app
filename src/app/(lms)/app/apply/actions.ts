"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validate, z, personName, boundedString } from "@/lib/validation";
import {
  createGuardian,
  addChild,
  getGuardian,
  createApplication,
  recordConsent,
  type ConsentType,
} from "@/lib/data/applications";
import { isProgramme } from "@/lib/content/programmes";
import { CURRENT_POLICY_VERSION } from "@/lib/content/policy";
import { logger } from "@/lib/logging/logger";

const uuid = z.string().uuid();

export interface FlowState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

const guardianSchema = z.object({
  fullName: personName,
  phone: boundedString(30).optional().or(z.literal("").transform(() => undefined)),
});

const AGE_GROUPS = ["6-11", "12-16"] as const;

function ageFrom(dobIso: string): number | null {
  const dob = new Date(dobIso);
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

const childSchema = z
  .object({
    fullName: personName,
    dob: z.string().refine((s) => ageFrom(s) !== null, "Enter a valid date"),
    ageGroup: z.enum(AGE_GROUPS),
    school: boundedString(160).optional().or(z.literal("").transform(() => undefined)),
    notes: boundedString(2000).optional().or(z.literal("").transform(() => undefined)),
  })
  .refine(
    (v) => {
      const age = ageFrom(v.dob);
      if (age == null) return false;
      return v.ageGroup === "6-11" ? age >= 6 && age <= 11 : age >= 12 && age <= 16;
    },
    { message: "The date of birth doesn't match the chosen age group (6–11 or 12–16).", path: ["dob"] },
  );

export async function registerGuardian(_prev: FlowState, formData: FormData): Promise<FlowState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in first." };

  const parsed = validate(guardianSchema, {
    fullName: formData.get("fullName"),
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors: parsed.errors };
  }

  try {
    await createGuardian(supabase, user.id, parsed.data);
    logger.info("guardian_registered", {});
  } catch (e) {
    logger.error("guardian_register_failed", { code: (e as { code?: string }).code });
    return { status: "error", message: "We couldn't save that. Please try again." };
  }
  revalidatePath("/app/apply");
  return { status: "success" };
}

export async function addChildAction(_prev: FlowState, formData: FormData): Promise<FlowState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in first." };

  const guardian = await getGuardian(supabase);
  if (!guardian) return { status: "error", message: "Please register as a guardian first." };

  const parsed = validate(childSchema, {
    fullName: formData.get("fullName"),
    dob: formData.get("dob"),
    ageGroup: formData.get("ageGroup"),
    school: formData.get("school") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors: parsed.errors };
  }

  try {
    await addChild(supabase, guardian.id, parsed.data);
    logger.info("child_added", { ageGroup: parsed.data.ageGroup });
  } catch (e) {
    logger.error("child_add_failed", { code: (e as { code?: string }).code });
    return { status: "error", message: "We couldn't save that. Please try again." };
  }
  revalidatePath("/app/apply");
  return { status: "success" };
}

/**
 * Submit an application for one of the guardian's children. RLS
 * (applications_insert_own) guarantees the child belongs to this guardian.
 */
export async function createApplicationAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const guardian = await getGuardian(supabase);
  if (!guardian) redirect("/app/apply");

  const childId = String(formData.get("childId") ?? "");
  const programme = String(formData.get("programme") ?? "");
  if (!uuid.safeParse(childId).success || !isProgramme(programme)) redirect("/app/apply");

  let id: string;
  try {
    id = await createApplication(supabase, childId, programme);
    logger.info("application_created", {});
  } catch (e) {
    logger.error("application_create_failed", { code: (e as { code?: string }).code });
    redirect("/app/apply");
  }
  redirect(`/app/apply/${id}`);
}

/**
 * Record one of the two required consents (biological / spiritual guardian)
 * against an application, with the current policy version and a timestamp.
 */
export async function recordConsentAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const guardian = await getGuardian(supabase);
  if (!guardian) redirect("/app/apply");

  const applicationId = String(formData.get("applicationId") ?? "");
  const consentType = String(formData.get("consentType") ?? "") as ConsentType;
  const agreed = formData.get("agree") === "on";
  const validType = consentType === "biological_parent" || consentType === "spiritual_parent";

  if (uuid.safeParse(applicationId).success && validType && agreed) {
    try {
      await recordConsent(supabase, applicationId, guardian.id, consentType, CURRENT_POLICY_VERSION);
      logger.info("consent_recorded", { type: consentType });
    } catch (e) {
      logger.error("consent_failed", { code: (e as { code?: string }).code });
    }
  }
  revalidatePath(`/app/apply/${applicationId}`);
}
