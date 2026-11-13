import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

const FRAME_W = 104;
const GAP = 14;
const FRAME_H = 300;
const COMPOSITE_W = FRAME_W * 3 + GAP * 2;
const FRAMES = [0, 1, 2].map((i) => i * (FRAME_W + GAP));

/**
 * "Our Story" — a story quote beside ONE photograph shown through three rounded
 * windows (not three photos). `photoSrc` is a CONSENTED group photo of IHF
 * members; until it arrives a warm placeholder makes the single-image effect
 * visible. CLAUDE.md: consented photography only.
 */
export function OurStory({ photoSrc }: { photoSrc?: string }) {
  return (
    <section className="bg-white px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="inline-block text-2xl font-semibold text-forest sm:text-3xl">Our Story</h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-gold" />
        </div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <blockquote className="text-xl leading-relaxed text-ink sm:text-2xl">
              “IME HOPE FOUNDATION exists to raise a generation that rises by
              raising others — equipping young people across Nigeria and Africa
              through faith, skills and financial competence, and walking with
              each member in dignity. What they receive, they pass on.”
            </blockquote>
            <Link href="/about" className={`${buttonClasses("primary", "md")} mt-8`}>
              Discover our story
            </Link>
          </div>

          {/* one photograph shown through three rounded windows */}
          <div className="mx-auto w-full max-w-[360px]">
            <svg
              viewBox={`0 0 ${COMPOSITE_W} ${FRAME_H}`}
              className="h-auto w-full"
              role="img"
              aria-label="IHF members — a single consented photograph shown across three frames"
            >
              <defs>
                <mask id="story-frames">
                  <rect width={COMPOSITE_W} height={FRAME_H} fill="black" />
                  {FRAMES.map((x) => (
                    <rect key={x} x={x} y="0" width={FRAME_W} height={FRAME_H} rx="30" fill="white" />
                  ))}
                </mask>
                <linearGradient id="story-fill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#12664E" />
                  <stop offset="1" stopColor="#C2912F" />
                </linearGradient>
              </defs>

              {photoSrc ? (
                <image
                  href={photoSrc}
                  x="0"
                  y="0"
                  width={COMPOSITE_W}
                  height={FRAME_H}
                  preserveAspectRatio="xMidYMid slice"
                  mask="url(#story-frames)"
                />
              ) : (
                <rect width={COMPOSITE_W} height={FRAME_H} fill="url(#story-fill)" mask="url(#story-frames)" />
              )}

              {/* frame outlines */}
              {FRAMES.map((x) => (
                <rect
                  key={x}
                  x={x + 0.75}
                  y="0.75"
                  width={FRAME_W - 1.5}
                  height={FRAME_H - 1.5}
                  rx="30"
                  fill="none"
                  stroke="var(--color-cream-200)"
                  strokeWidth="1.5"
                />
              ))}
            </svg>
            {!photoSrc && (
              <p className="mt-2 text-center text-[11px] uppercase tracking-widest text-ink-soft/70">
                One group photo (consented) — shown across all three frames
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
