/**
 * Video links (mentors post a link; mentees watch it embedded).
 *
 * SECURITY: we NEVER embed an arbitrary user-supplied URL. We parse the link,
 * accept ONLY YouTube or Vimeo, extract the opaque video id, and store just the
 * provider + id. The embed URL is then rebuilt from a fixed template, so the
 * iframe `src` is always one of our own allow-listed hosts — never attacker
 * input. The same host allow-list drives the CSP `frame-src`.
 *
 * Edge-safe (pure string/URL logic only).
 */
export type VideoProvider = "youtube" | "vimeo";

export interface ParsedVideo {
  provider: VideoProvider;
  ref: string;
}

const YT_ID = /^[A-Za-z0-9_-]{11}$/;

/** Parse + validate a YouTube/Vimeo link. Returns null for anything else. */
export function parseVideoUrl(input: string): ParsedVideo | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = url.searchParams.get("v");
    if (v && YT_ID.test(v)) return { provider: "youtube", ref: v };
    const m = url.pathname.match(/^\/embed\/([A-Za-z0-9_-]{11})$/);
    if (m) return { provider: "youtube", ref: m[1] };
    return null;
  }
  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    return YT_ID.test(id) ? { provider: "youtube", ref: id } : null;
  }
  if (host === "vimeo.com") {
    const m = url.pathname.match(/^\/(\d{6,12})(?:\/|$)/);
    return m ? { provider: "vimeo", ref: m[1] } : null;
  }
  if (host === "player.vimeo.com") {
    const m = url.pathname.match(/^\/video\/(\d{6,12})(?:\/|$)/);
    return m ? { provider: "vimeo", ref: m[1] } : null;
  }
  return null;
}

/** Build the (allow-listed) embed URL from a stored provider + id. */
export function embedUrl(provider: VideoProvider, ref: string): string {
  return provider === "youtube"
    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(ref)}`
    : `https://player.vimeo.com/video/${encodeURIComponent(ref)}`;
}

/** Hosts allowed in the CSP `frame-src` for the embedded players. */
export const VIDEO_FRAME_HOSTS = [
  "https://www.youtube-nocookie.com",
  "https://www.youtube.com",
  "https://player.vimeo.com",
] as const;
