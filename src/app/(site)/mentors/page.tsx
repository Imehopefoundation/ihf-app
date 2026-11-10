import type { Metadata } from "next";
import { Section, Eyebrow, SectionTitle, Lead } from "@/components/site/primitives";
import { EmptyState } from "@/components/ui/Table";

export const metadata: Metadata = {
  title: "Mentors",
  description: "IHF mentors serve by invitation, vetted and accountable. All contact goes through IHF.",
};

export default function MentorsPage() {
  return (
    <>
      <Section tone="cream" className="pt-16">
        <Eyebrow>Mentors</Eyebrow>
        <SectionTitle>Vetted, prepared and accountable.</SectionTitle>
        <Lead>
          Mentors join IHF by invitation, with profiling, vetting and reference
          checks, and they sign the Mentor Vows and Mentorship Agreement. A
          mentor appears here only after giving written consent and being
          published by our team — and contact details are never shown. All
          contact goes through IHF.
        </Lead>
      </Section>

      <Section tone="white">
        <EmptyState title="No mentor profiles are published yet.">
          Profiles — photograph, name, skill area and a short biography — will
          appear here once mentors are vetted, consented and published by staff.
        </EmptyState>
      </Section>
    </>
  );
}
