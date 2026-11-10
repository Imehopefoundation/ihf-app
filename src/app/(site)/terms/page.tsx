import type { Metadata } from "next";
import { Section, Eyebrow, SectionTitle, Lead } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms that govern use of the IHF website and services.",
};

export default function TermsPage() {
  return (
    <>
      <Section tone="cream" className="pt-16">
        <Eyebrow>Terms</Eyebrow>
        <SectionTitle>Terms of use.</SectionTitle>
        <Lead>
          By using this website you agree to use it lawfully and respectfully,
          and to the handling of your information described in our privacy notice.
        </Lead>
      </Section>

      <Section tone="white">
        <div className="max-w-2xl space-y-4 text-sm text-ink">
          <p>
            IME HOPE FOUNDATION provides this website for information and to
            support members, mentors, supporters and partners.
          </p>
          <p>
            The full terms of use are being prepared and will be published here
            once approved by IHF governance.
          </p>
        </div>
      </Section>
    </>
  );
}
