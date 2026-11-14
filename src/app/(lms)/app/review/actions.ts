"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { setApplicationStatus, type ApplicationStatus } from "@/lib/data/applications";
import { z } from "@/lib/validation";
import { logger } from "@/lib/logging/logger";

const STATUSES: readonly ApplicationStatus[] = [
  "submitted",
  "under_review",
  "vetted",
  "paired",
  "waitlisted",
  "accepted",
  "declined",
];
const uuid = z.string().uuid();

/** Staff-only: move an application through the review lifecycle. */
export async function setStatusAction(formData: FormData): Promise<void> {
  // Role enforced server-side (admin always allowed); RLS also restricts the UPDATE.
  const { user } = await requireRole(["programme_lead", "quality_assurance"]);
  const supabase = await createClient();

  const id = String(formData.get("applicationId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (uuid.safeParse(id).success && (STATUSES as readonly string[]).includes(status)) {
    try {
      await setApplicationStatus(supabase, id, status as ApplicationStatus, user.id);
      logger.info("application_status_set", { status });
    } catch (e) {
      logger.error("application_status_failed", { code: (e as { code?: string }).code });
    }
  }
  revalidatePath("/app/review");
}
