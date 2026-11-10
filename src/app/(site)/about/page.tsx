import type { Metadata } from "next";
import { Section, Eyebrow, SectionTitle, Lead } from "@/components/site/primitives";
import { EmptyState } from "@/components/ui/Table";

export const metadata: Metadata = {
  title: "About IHF",
  description:
    "IME HOPE FOUNDATION is a God-centred charity raising people who raise others across Africa.",
};

const VALUES_SUMMARY = [
  "Every person is treated with dignity.",
  "Giving is stewardship, never public recognition.",
  "Spiritual growth and practical skill reinforce each other.",
  "Mentorship promotes accountability, healthy boundaries and multiplication.",
  "All storytelling respects consent and protects the vulnerable.",
];

const LEADERSHIP = ["Founder / Executive Director", "Deputy Director", "Board of Advisors"];

export default function AboutPage() {
  return (
    <>
      <Section tone="cream" className="pt-16">
        <Eyebrow>About IHF</Eyebrow>
        <SectionTitle className="max-w-3xl">
          A God-centred charity raising people who raise others.
        </SectionTitle>
        <Lead>
          IME HOPE FOUNDATION equips individuals across Africa through
          faith-rooted mentorship, skills development, education and welfare
          support. Everyone we serve is a member — valued, accountable and
          called to multiply.
        </Lead>
      </Section>

      <Section tone="white">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gold">Vision</h2>
            <p className="mt-3 text-lg text-ink">
              A God-centred charity empowering the less privileged through
              Christian-based knowledge, skills and support — creating a
              multiplying cycle of transformation that breaks the chains of
              mental and financial poverty across Africa.
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gold">Mission</h2>
            <p className="mt-3 text-lg text-ink">
              To raise empowered individuals who in turn raise others, through
              faith-rooted mentorship, skills development, education and welfare
              support.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="cream">
        <Eyebrow>The meaning of our logo</Eyebrow>
        <SectionTitle>A sieve and an academy.</SectionTitle>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-6">
            <h3 className="font-semibold text-forest">The sieve</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Life-changing filtration — keeping what is good, true and fruitful,
              and letting go of what holds people back.
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-6">
            <h3 className="font-semibold text-forest">The academy</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Training and formation — a place where character and competence are
              built with intention.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="white">
        <Eyebrow>What we hold to</Eyebrow>
        <SectionTitle>Dignity, stewardship and multiplication.</SectionTitle>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {VALUES_SUMMARY.map((v) => (
            <li key={v} className="flex gap-3 rounded-[var(--radius)] border border-cream-200 p-4 text-sm text-ink">
              <span aria-hidden="true" className="text-gold">◆</span>
              {v}
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="cream">
        <Eyebrow>Leadership</Eyebrow>
        <SectionTitle>Those who serve as stewards.</SectionTitle>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {LEADERSHIP.map((role) => (
            <div key={role} className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-6">
              <div className="mb-4 aspect-square w-full rounded-[var(--radius)] border border-cream-200 bg-cream-100" aria-hidden="true" />
              <h3 className="font-semibold text-forest">{role}</h3>
              <p className="mt-1 text-sm text-ink-soft">
                Approved photograph and biography to be added by IHF administrators.
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <EmptyState title="Leadership profiles are not yet published.">
            Names, photographs and biographies will appear here once approved by IHF governance.
          </EmptyState>
        </div>
      </Section>
    </>
  );
}
