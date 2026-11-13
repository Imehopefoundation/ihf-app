import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { NIGERIA_PATH, NIGERIA_VIEWBOX } from "@/components/site/NigeriaMap";
import { Eyebrow } from "@/components/site/primitives";

/**
 * Landing hero: "Raising a generation that raises others" beside a young person
 * set WITHIN the map of Nigeria (photo clipped to the outline) with an "I have hope"
 * tag. `photoSrc` is a CONSENTED portrait — until it arrives a dignified
 * silhouette placeholder stands in. CLAUDE.md: consented photography only.
 */
export function HeroHope({ photoSrc }: { photoSrc?: string }) {
  return (
    <section className="bg-cream px-4 pt-14 pb-16 sm:pt-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Eyebrow>Faith · Financial Literacy · Community</Eyebrow>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
            Raising a generation that <span className="text-gold">raises others.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-ink-soft">
            A God-centred foundation equipping young people across Nigeria and
            Africa — through faith, skills and financial competence — so every
            life changed goes on to change another.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/join" className={buttonClasses("primary", "lg")}>
              Apply as a mentee
            </Link>
            <Link href="/give" className={buttonClasses("give", "lg")}>
              ♥ Give to the movement
            </Link>
          </div>
        </div>

        {/* Youth within the map of Nigeria */}
        <div className="relative mx-auto aspect-square w-full max-w-md">
          <div aria-hidden="true" className="absolute inset-6 rounded-full bg-gold/15 blur-3xl" />

          {/* Nigeria map: photo (clipped) or emerald fill */}
          <svg
            viewBox={NIGERIA_VIEWBOX}
            className="absolute inset-0 h-full w-full drop-shadow-sm"
            role="img"
            aria-label="A young person full of hope, within the map of Nigeria"
          >
            <defs>
              <clipPath id="nga-clip">
                <path d={NIGERIA_PATH} />
              </clipPath>
              <linearGradient id="nga-fill" x1="0" y1="0" x2="0.4" y2="1">
                <stop offset="0" stopColor="#12664E" />
                <stop offset="1" stopColor="#0A4536" />
              </linearGradient>
            </defs>
            <g clipPath="url(#nga-clip)">
              {photoSrc ? (
                <image href={photoSrc} x="0" y="54.9" width="600" height="490.3" preserveAspectRatio="xMidYMid slice" />
              ) : (
                <rect x="0" y="54.9" width="600" height="490.3" fill="url(#nga-fill)" />
              )}
            </g>
            <path d={NIGERIA_PATH} fill="none" stroke="var(--color-gold)" strokeWidth="2.5" opacity="0.5" />
          </svg>

          {/* Dignified silhouette placeholder (overlay) — hidden once a photo is set */}
          {!photoSrc && (
            <svg
              viewBox="0 -40 240 340"
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[62%] -translate-x-1/2 -translate-y-[54%]"
            >
              <g fill="var(--color-cream)">
                {/* arms raised */}
                <g>
                  <rect x="78" y="-20" width="34" height="150" rx="17" transform="rotate(-30 95 120)" />
                  <circle cx="95" cy="-20" r="19" transform="rotate(-30 95 120)" />
                </g>
                <g>
                  <rect x="128" y="-20" width="34" height="150" rx="17" transform="rotate(30 145 120)" />
                  <circle cx="145" cy="-20" r="19" transform="rotate(30 145 120)" />
                </g>
                {/* body (bell) */}
                <path d="M86,122 Q120,106 154,122 L170,250 Q170,272 120,272 Q70,272 70,250 Z" />
                {/* head */}
                <circle cx="120" cy="66" r="42" />
              </g>
            </svg>
          )}

          {/* Floating tag only for the placeholder; a real portrait carries its own "I have hope". */}
          {!photoSrc && (
            <span className="absolute left-1/2 top-[56%] -translate-x-1/2 rounded-full bg-give px-4 py-1.5 text-sm font-bold text-night shadow-md">
              I have hope
            </span>
          )}

          {!photoSrc && (
            <p className="absolute inset-x-0 -bottom-6 text-center text-xs text-ink-soft">
              Placeholder — your consented portrait is clipped into Nigeria here.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
