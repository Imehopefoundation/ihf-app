import { LmsHero } from "./LmsHero";
import { SectionCard } from "./SectionCard";
import type { IconName } from "./icons";

export interface HubSection {
  href: string | null;
  label: string;
  blurb: string;
  ready: boolean;
  icon: IconName;
}

/** A role landing page: an uplifting hero + a grid of section cards. */
export function LmsHub({
  eyebrow,
  title,
  intro,
  scripture,
  reference,
  sections,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  scripture?: string;
  reference?: string;
  sections: HubSection[];
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <LmsHero eyebrow={eyebrow} title={title} subtitle={intro} scripture={scripture} reference={reference} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <SectionCard key={s.label} {...s} />
        ))}
      </div>
    </div>
  );
}
