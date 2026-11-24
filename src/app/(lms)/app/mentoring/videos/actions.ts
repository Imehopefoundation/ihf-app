"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { createVideo, deleteVideo } from "@/lib/data/videos";
import { parseVideoUrl } from "@/lib/video";
import { z } from "@/lib/validation";
import { logger } from "@/lib/logging/logger";

export interface VideoFormState {
  status: "idle" | "error" | "success";
  message?: string;
}

const uuid = z.string().uuid();

export async function postVideoAction(
  _prev: VideoFormState,
  formData: FormData,
): Promise<VideoFormState> {
  const { user } = await requireRole(["mentor"]);
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (title.length < 1 || title.length > 160) {
    return { status: "error", message: "Enter a title (1–160 characters)." };
  }
  if (description.length > 2000) {
    return { status: "error", message: "That description is too long (max 2000 characters)." };
  }
  const parsed = parseVideoUrl(url);
  if (!parsed) {
    return { status: "error", message: "Enter a valid YouTube or Vimeo link." };
  }

  try {
    await createVideo(supabase, user.id, {
      title,
      description,
      provider: parsed.provider,
      ref: parsed.ref,
    });
    logger.info("video_posted", { provider: parsed.provider });
  } catch (e) {
    logger.error("video_post_failed", { code: (e as { code?: string }).code });
    return { status: "error", message: "We couldn't post that. Please try again." };
  }
  revalidatePath("/app/mentoring/videos");
  return { status: "success" };
}

export async function deleteVideoAction(formData: FormData): Promise<void> {
  await requireRole(["mentor"]);
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (uuid.safeParse(id).success) {
    try {
      await deleteVideo(supabase, id);
    } catch (e) {
      logger.error("video_delete_failed", { code: (e as { code?: string }).code });
    }
  }
  revalidatePath("/app/mentoring/videos");
}
