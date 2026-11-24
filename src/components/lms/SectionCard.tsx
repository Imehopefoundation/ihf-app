import Link from "next/link";
import { Icon, type IconName } from "./icons";

/** A vibrant LMS section card. `ready` false → a muted "Soon" placeholder. */
export function SectionCard({
  href,
  label,
  blurb,
  icon,
  ready = true,
}: {
  href: string | null;
  label: string;
  blurb?: string;
  icon: IconName;
  ready?: boolean;
}) {
  if (ready && href) {
    return (
      <Link
        href={href}
        className="group relative flex items-start gap-4 rounded-[var(--radius-lg)] border border-cream-200 bg-white p-5 transition-all duration-200 hover:border-gold hover:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.18)] motion-safe:hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius)] bg-give-tint text-give transition-colors group-hover:bg-give group-hover:text-cream">
          <Icon name={icon} className="h-6 w-6" />
        </span>
        <div className="min-w-0 pr-5">
          <h2 className="font-semibold text-ink group-hover:text-forest">{label}</h2>
          {blurb && <p className="mt-1 text-sm text-ink-soft">{blurb}</p>}
        </div>
        <span
          aria-hidden="true"
          className="absolute right-4 top-5 text-ink-soft/40 transition-all group-hover:text-gold motion-safe:group-hover:translate-x-0.5"
        >
          →
        </span>
      </Link>
    );
  }
  return (
    <div className="relative flex items-start gap-4 rounded-[var(--radius-lg)] border border-dashed border-cream-200 bg-cream/40 p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius)] bg-cream-100 text-ink-soft/70">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <div className="min-w-0 pr-14">
        <h2 className="font-semibold text-ink-soft">{label}</h2>
        {blurb && <p className="mt-1 text-sm text-ink-soft">{blurb}</p>}
      </div>
      <span className="absolute right-4 top-5 rounded-full border border-cream-200 bg-white px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-soft">
        Soon
      </span>
    </div>
  );
}
