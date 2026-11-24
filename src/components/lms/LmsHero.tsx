import type { ReactNode } from "react";

/** Warm, uplifting banner at the top of LMS pages. Dark with gold glow. */
export function LmsHero({
  eyebrow,
  title,
  subtitle,
  scripture,
  reference,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  scripture?: string;
  reference?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-night px-6 py-8 text-cream sm:px-9 sm:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-gold/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-give/15 blur-3xl" />
      <div className="relative">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-soft">{eyebrow}</p>
        )}
        <h1 className="mt-2 text-balance text-2xl font-semibold leading-tight text-cream sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-xl text-sm text-cream/80 sm:text-base">{subtitle}</p>}
        {scripture && (
          <p className="mt-5 max-w-xl border-l-2 border-gold/60 pl-4 text-sm italic text-cream/85">
            “{scripture}”
            {reference && <span className="ml-1 not-italic text-gold-soft">— {reference}</span>}
          </p>
        )}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
