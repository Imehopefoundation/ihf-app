import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { listVideos } from "@/lib/data/videos";
import { VideoEmbed } from "@/components/lms/VideoEmbed";
import { EmptyState } from "@/components/ui/Table";

export const metadata: Metadata = { title: "Videos" };

export default async function MenteeVideosPage() {
  await requireRole(["mentee"]);
  const supabase = await createClient();
  const videos = await listVideos(supabase);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/app/learning" className="text-sm text-ink-soft hover:text-ink">
        ← My learning
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-ink">Videos</h1>
      <p className="mt-1 text-sm text-ink-soft">Watch the videos your mentors have posted.</p>

      {videos.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No videos yet.">
            Your mentors haven&apos;t posted any videos yet. Check back soon.
          </EmptyState>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          {videos.map((v) => (
            <div key={v.id}>
              <VideoEmbed provider={v.provider} videoRef={v.ref} title={v.title} />
              <p className="mt-2 font-medium text-ink">{v.title}</p>
              {v.description && <p className="mt-1 text-sm text-ink-soft">{v.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
