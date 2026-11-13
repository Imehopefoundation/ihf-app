import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { NigeriaMap } from "@/components/site/NigeriaMap";
import { Eyebrow } from "@/components/site/primitives";

/**
 * Landing hero: the statement "We rise by raising others" beside a young
 * person, arms raised, set within the map of Nigeria, wearing an "I have hope"
 * tag. The figure is a dignified silhouette PLACEHOLDER — CLAUDE.md permits only
 * consented photography of real youth, so a real (consented) portrait clipped
 * to the Nigeria shape replaces this later.
 */
export function HeroHope() {
  return (
    <section className="bg-cream px-4 pt-14 pb-16 sm:pt-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Eyebrow>Faith · Financial Literacy · Community</Eyebrow>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
            We rise by <span className="text-gold">raising others.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">
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
          {/* warm glow */}
          <div
            aria-hidden="true"
            className="absolute inset-6 rounded-full bg-gold/15 blur-3xl"
          />
          {/* Nigeria map */}
          <NigeriaMap className="absolute inset-0 h-full w-full fill-forest drop-shadow-sm" />

          {/* Figure: arms raised (silhouette placeholder) */}
          <svg
            viewBox="0 0 300 380"
            aria-hidden="true"
            className="absolute inset-x-0 bottom-[8%] mx-auto h-[74%]"
          >
            <g
              fill="none"
              stroke="var(--color-cream)"
              strokeWidth="30"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* arms raised in a V */}
              <path d="M126,150 L74,54" />
              <path d="M174,150 L226,54" />
              {/* legs */}
              <path d="M138,238 L128,350" />
              <path d="M162,238 L172,350" />
            </g>
            {/* torso */}
            <path
              d="M118,150 Q150,138 182,150 L176,236 Q150,246 124,236 Z"
              fill="var(--color-cream)"
            />
            {/* head */}
            <circle cx="150" cy="78" r="36" fill="var(--color-cream)" />
            {/* hands */}
            <circle cx="72" cy="50" r="15" fill="var(--color-cream)" />
            <circle cx="228" cy="50" r="15" fill="var(--color-cream)" />
          </svg>

          {/* "I have hope" tag across the chest */}
          <span className="absolute left-1/2 top-[52%] -translate-x-1/2 rounded-full bg-give px-4 py-1.5 text-sm font-bold text-night shadow-md">
            I have hope
          </span>

          <p className="absolute inset-x-0 -bottom-6 text-center text-xs text-ink-soft">
            Placeholder — a consented portrait set in the map of Nigeria goes here.
          </p>
        </div>
      </div>
    </section>
  );
}
