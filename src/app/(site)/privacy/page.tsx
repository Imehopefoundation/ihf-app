import type { Metadata } from "next";
import { Section, Eyebrow, SectionTitle, Lead } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How IHF holds and protects personal information.",
};

export default function PrivacyPage() {
  return (
    <>
      <Section tone="cream" className="pt-16">
        <Eyebrow>Privacy</Eyebrow>
        <SectionTitle>Your information, held with care.</SectionTitle>
        <Lead>
          Member records are private and visible only to authorised staff. We
          never publish identifying details of minors or welfare recipients, and
          stories are shared only with documented consent.
        </Lead>
      </Section>

      <Section tone="white">
        <div className="max-w-2xl space-y-4 text-sm text-ink">
          <p>
            We collect only what we need to serve our members well, keep it for
            no longer than necessary, and protect it with appropriate technical
            and organisational measures.
          </p>
          <p>
            The full privacy notice — being prepared as a draft for legal counsel
            under the Nigeria Data Protection Act — will be published here once
            approved by IHF governance. Until then, this page is a summary of our
            intentions and does not constitute a statement of legal compliance.
          </p>
        </div>
      </Section>
    </>
  );
}
