import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

// Three staggered cylindrical (pill) frames — windows into ONE image.
const PILLS = [
  { x: 0, y: 22, w: 100, h: 236 },
  { x: 122, y: 0, w: 100, h: 300 },
  { x: 244, y: 40, w: 100, h: 216 },
];
const VB_W = 344;
const VB_H = 300;

/**
 * "Our Story" — story quote beside ONE photograph shown through three
 * cylindrical (pill) frames. `photoSrc` is a CONSENTED group photo of IHF
 * members; until it arrives a warm placeholder shows the single-image effect.
 * CLAUDE.md: consented photography only (no stock/identifiable child photos).
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

          {/* one photograph shown through three cylindrical frames */}
          <div className="mx-auto w-full max-w-[380px]">
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              className="h-auto w-full"
              role="img"
              aria-label="IHF members — a single consented photograph shown across three frames"
            >
              <defs>
                <mask id="story-pills">
                  <rect width={VB_W} height={VB_H} fill="black" />
                  {PILLS.map((p, i) => (
                    <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.w / 2} fill="white" />
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
                  width={VB_W}
                  height={VB_H}
                  preserveAspectRatio="xMidYMid slice"
                  mask="url(#story-pills)"
                />
              ) : (
                <rect width={VB_W} height={VB_H} fill="url(#story-fill)" mask="url(#story-pills)" />
              )}

              {PILLS.map((p, i) => (
                <rect
                  key={i}
                  x={p.x + 0.75}
                  y={p.y + 0.75}
                  width={p.w - 1.5}
                  height={p.h - 1.5}
                  rx={p.w / 2}
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
