import { embedUrl, type VideoProvider } from "@/lib/video";

/** Embeds a YouTube/Vimeo player from a stored provider + id (allow-listed). */
export function VideoEmbed({
  provider,
  videoRef,
  title,
}: {
  provider: VideoProvider;
  videoRef: string;
  title: string;
}) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-[var(--radius)] border border-cream-200 bg-black">
      <iframe
        src={embedUrl(provider, videoRef)}
        title={title}
        className="h-full w-full"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
