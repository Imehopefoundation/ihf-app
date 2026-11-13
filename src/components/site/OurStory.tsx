import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

/** "Our Story" — a story quote beside a cluster of rounded photo placeholders.
 *  Images are consented photography only (CLAUDE.md); shown as placeholders. */
export function OurStory() {
  return (
    <section className="bg-white px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="inline-block text-2xl font-semibold text-forest sm:text-3xl">
            Our Story
          </h2>
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

          {/* staggered rounded photo placeholders */}
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {[
              { h: "h-48 sm:h-60", mt: "" },
              { h: "h-56 sm:h-72", mt: "mt-8" },
              { h: "h-44 sm:h-56", mt: "mt-4" },
            ].map((img, i) => (
              <div
                key={i}
                className={`${img.mt} flex ${img.h} w-24 items-end justify-center overflow-hidden rounded-[2.5rem] border border-cream-200 bg-cream-100 sm:w-28`}
                role="img"
                aria-label="Consented photography to come"
              >
                <span className="pb-3 text-[10px] uppercase tracking-widest text-ink-soft/60">
                  Photo
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
