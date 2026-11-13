import type { Metadata } from "next";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Section, Eyebrow, SectionTitle, Lead, Scripture } from "@/components/site/primitives";
import { SupporterSignup } from "@/components/site/SupporterSignup";

export const metadata: Metadata = {
  title: "Give",
  description: "Giving as an act of stewardship — private by default, never used for public recognition.",
};

export default function GivePage() {
  return (
    <>
      <Section tone="cream" className="pt-16">
        <Eyebrow>Give</Eyebrow>
        <SectionTitle>Giving as an act of stewardship.</SectionTitle>
        <Lead>
          Your generosity helps members learn a skill, stay in school and stand
          firm in seasons of need. Gifts are recorded privately and are never
          used for public recognition.
        </Lead>
      </Section>

      <Section tone="white">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Scripture reference="2 Corinthians 9:7 (KJV)">
            Every man according as he purposeth in his heart, so let him give;
            not grudgingly, or of necessity: for God loveth a cheerful giver.
          </Scripture>
          <div className="rounded-[var(--radius-lg)] border border-cream-200 bg-cream-100 p-8">
            <h2 className="text-lg font-semibold text-forest">Online giving is being prepared</h2>
            <p className="mt-3 text-sm text-ink-soft">
              We are setting up secure online giving with private receipts. Until
              it opens, please contact us and our finance team will share the
              appropriate ways to give.
            </p>
            <Link href="/contact" className={`${buttonClasses("give", "md")} mt-6`}>
              Ask about giving
            </Link>
          </div>
        </div>
      </Section>

      <Section tone="cream">
        <div className="mx-auto max-w-xl">
          <SupporterSignup />
        </div>
      </Section>
    </>
  );
}
