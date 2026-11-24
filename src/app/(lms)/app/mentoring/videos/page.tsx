import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { listMyVideos } from "@/lib/data/videos";
import { VideoEmbed } from "@/components/lms/VideoEmbed";
import { EmptyState } from "@/components/ui/Table";
import { VideoForm } from "./VideoForm";
import { deleteVideoAction } from "./actions";

export const metadata: Metadata = { title: "Post videos" };

export default async function MentorVideosPage() {
  const { user } = await requireRole(["mentor"]);
  const supabase = await createClient();
  const videos = await listMyVideos(supabase, user.id);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/mentoring" className="text-sm text-ink-soft hover:text-ink">
        ← Mentoring
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-ink">Videos</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Post a YouTube or Vimeo link. Your mentees watch it in their “My learning” area.
      </p>

      <div className="mt-6 rounded-[var(--radius-lg)] border border-cream-200 bg-white p-6">
        <VideoForm />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-forest">Your posted videos</h2>
      <div className="mt-4 space-y-6">
        {videos.length === 0 ? (
          <EmptyState title="No videos yet.">Post your first video above.</EmptyState>
        ) : (
          videos.map((v) => (
            <div key={v.id} className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink">{v.title}</p>
                  {v.description && <p className="mt-1 text-sm text-ink-soft">{v.description}</p>}
                </div>
                <form action={deleteVideoAction}>
                  <input type="hidden" name="id" value={v.id} />
                  <button
                    type="submit"
                    className="shrink-0 rounded-[var(--radius)] border border-cream-200 px-3 py-1.5 text-sm font-medium text-ink hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-forest"
                  >
                    Delete
                  </button>
                </form>
              </div>
              <div className="mt-3">
                <VideoEmbed provider={v.provider} videoRef={v.ref} title={v.title} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
