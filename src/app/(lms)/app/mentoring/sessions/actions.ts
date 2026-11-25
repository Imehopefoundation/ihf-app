"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { createSession, deleteSession } from "@/lib/data/sessions";
import { z } from "@/lib/validation";
import { logger } from "@/lib/logging/logger";

export interface SessionFormState {
  status: "idle" | "error" | "success";
  message?: string;
}

const uuid = z.string().uuid();
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function recordSessionAction(
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const { user } = await requireRole(["mentor"]);
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "");
  const devotion = formData.get("devotion") === "on";
  const coc = formData.get("coc") === "on";
  const notes = String(formData.get("notes") ?? "").trim();

  if (title.length < 1 || title.length > 160) {
    return { status: "error", message: "Enter a title (1–160 characters)." };
  }
  if (!DATE_RE.test(date)) {
    return { status: "error", message: "Choose a date." };
  }
  if (notes.length > 2000) {
    return { status: "error", message: "Those notes are too long." };
  }

  try {
    await createSession(supabase, user.id, {
      title,
      date,
      devotionDone: devotion,
      codeOfConductRead: coc,
      notes: notes || null,
    });
    logger.info("session_recorded", {});
  } catch (e) {
    logger.error("session_record_failed", { code: (e as { code?: string }).code });
    return { status: "error", message: "We couldn't save that. Please try again." };
  }
  revalidatePath("/app/mentoring/sessions");
  return { status: "success" };
}

export async function deleteSessionAction(formData: FormData): Promise<void> {
  await requireRole(["mentor"]);
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (uuid.safeParse(id).success) {
    try {
      await deleteSession(supabase, id);
    } catch (e) {
      logger.error("session_delete_failed", { code: (e as { code?: string }).code });
    }
  }
  revalidatePath("/app/mentoring/sessions");
}
