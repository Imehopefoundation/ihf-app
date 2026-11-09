import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";

/**
 * Temporary holding page rendered inside the real site shell. The full landing
 * page (matching the Lovable design with the corrected CLAUDE.md copy) is built
 * in Phase 2.
 */
export default function Home() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="eyebrow">Financial competence · Faith · Technical competence</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        Raising a generation that raises others.
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">
        IME HOPE FOUNDATION raises empowered individuals who in turn raise
        others — through faith-rooted mentorship, skills development, education
        and welfare support across Africa.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/join" className={buttonClasses("primary", "lg")}>
          Join Us
        </Link>
        <Link href="/programmes" className={buttonClasses("secondary", "lg")}>
          Explore our programmes
        </Link>
      </div>
      <p className="mt-12 text-xs uppercase tracking-widest text-ink-soft">
        Full site in development
      </p>
    </section>
  );
}
