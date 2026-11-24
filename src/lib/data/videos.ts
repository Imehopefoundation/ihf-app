/**
 * Server-only data access for LMS videos. Every call uses the request-scoped
 * (user) Supabase client, so RLS decides what each role can see or change.
 */
import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { VideoProvider } from "@/lib/video";

export interface Video {
  id: string;
  postedBy: string;
  title: string;
  description: string | null;
  provider: VideoProvider;
  ref: string;
  createdAt: string;
}

function mapVideo(r: Record<string, unknown>): Video {
  return {
    id: r.id as string,
    postedBy: r.posted_by as string,
    title: r.title as string,
    description: (r.description as string | null) ?? null,
    provider: r.provider as VideoProvider,
    ref: r.video_ref as string,
    createdAt: r.created_at as string,
  };
}

const COLS = "id, posted_by, title, description, provider, video_ref, created_at";

/** The whole library (mentees watch; RLS allows mentor/mentee/admin). */
export async function listVideos(supabase: SupabaseClient): Promise<Video[]> {
  const { data, error } = await supabase
    .from("videos")
    .select(COLS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapVideo);
}

/** Only the videos this mentor posted. */
export async function listMyVideos(supabase: SupabaseClient, userId: string): Promise<Video[]> {
  const { data, error } = await supabase
    .from("videos")
    .select(COLS)
    .eq("posted_by", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapVideo);
}

export async function createVideo(
  supabase: SupabaseClient,
  userId: string,
  input: { title: string; description?: string; provider: VideoProvider; ref: string },
): Promise<void> {
  const { error } = await supabase.from("videos").insert({
    posted_by: userId,
    title: input.title,
    description: input.description?.trim() ? input.description : null,
    provider: input.provider,
    video_ref: input.ref,
  });
  if (error) throw error;
}

/** Delete a video (RLS ensures only the owner or an admin succeeds). */
export async function deleteVideo(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) throw error;
}
