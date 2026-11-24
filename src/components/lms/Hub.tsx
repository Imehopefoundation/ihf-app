import Link from "next/link";

export interface HubSection {
  href: string | null;
  label: string;
  blurb: string;
  ready: boolean;
}

/** A role landing page: a grid of section cards (ready ones link, others show "Soon"). */
export function LmsHub({
  title,
  intro,
  sections,
}: {
  title: string;
  intro?: string;
  sections: HubSection[];
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      {intro && <p className="mt-2 max-w-2xl text-sm text-ink-soft">{intro}</p>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {sections.map((s) =>
          s.ready && s.href ? (
            <Link
              key={s.label}
              href={s.href}
              className="group rounded-[var(--radius-lg)] border border-cream-200 bg-white p-5 transition-colors hover:border-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
            >
              <h2 className="font-semibold text-ink group-hover:text-forest">{s.label}</h2>
              <p className="mt-1 text-sm text-ink-soft">{s.blurb}</p>
            </Link>
          ) : (
            <div
              key={s.label}
              className="rounded-[var(--radius-lg)] border border-dashed border-cream-200 bg-cream/40 p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-ink-soft">{s.label}</h2>
                <span className="rounded-full border border-cream-200 px-2 py-0.5 text-[11px] uppercase tracking-wide text-ink-soft">
                  Soon
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-soft">{s.blurb}</p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
