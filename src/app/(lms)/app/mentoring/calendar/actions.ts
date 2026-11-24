"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { createEvent, updateEvent, deleteEvent, type EventType } from "@/lib/data/calendar";
import { z } from "@/lib/validation";
import { logger } from "@/lib/logging/logger";

export interface EventFormState {
  status: "idle" | "error";
  message?: string;
}

const uuid = z.string().uuid();
const TYPES: EventType[] = ["class", "assessment", "submission", "other"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export async function saveEventAction(
  _prev: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const { user } = await requireRole(["mentor"]);
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "class");
  const date = String(formData.get("date") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const description = String(formData.get("description") ?? "").trim();

  if (title.length < 1 || title.length > 160) {
    return { status: "error", message: "Enter a title (1–160 characters)." };
  }
  if (!(TYPES as string[]).includes(type)) {
    return { status: "error", message: "Choose a valid type." };
  }
  if (!DATE_RE.test(date)) {
    return { status: "error", message: "Choose a date." };
  }
  if (startTime && !TIME_RE.test(startTime)) {
    return { status: "error", message: "Enter a valid start time." };
  }
  if (endTime && !TIME_RE.test(endTime)) {
    return { status: "error", message: "Enter a valid end time." };
  }
  if (description.length > 2000) {
    return { status: "error", message: "That description is too long." };
  }

  const input = {
    title,
    type: type as EventType,
    date,
    startTime: startTime || null,
    endTime: endTime || null,
    description: description || null,
  };

  try {
    if (id && uuid.safeParse(id).success) {
      await updateEvent(supabase, id, input);
    } else {
      await createEvent(supabase, user.id, input);
    }
    logger.info("event_saved", { type: input.type });
  } catch (e) {
    logger.error("event_save_failed", { code: (e as { code?: string }).code });
    return { status: "error", message: "We couldn't save that. Please try again." };
  }
  redirect(`/app/mentoring/calendar?m=${date.slice(0, 7)}`);
}

export async function deleteEventAction(formData: FormData): Promise<void> {
  await requireRole(["mentor"]);
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const m = String(formData.get("m") ?? "");
  if (uuid.safeParse(id).success) {
    try {
      await deleteEvent(supabase, id);
    } catch (e) {
      logger.error("event_delete_failed", { code: (e as { code?: string }).code });
    }
  }
  redirect(m ? `/app/mentoring/calendar?m=${m}` : "/app/mentoring/calendar");
}
