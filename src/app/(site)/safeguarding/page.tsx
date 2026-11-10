import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow, SectionTitle, Lead } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Safeguarding & Policies",
  description:
    "How IHF protects children and members: consent, supervision, confidentiality and accountability.",
};

const COMMITMENTS = [
  {
    title: "Children come first",
    body:
      "For ages 6–11 the parent or guardian does everything; there is no child login. For 12–16, a limited, supervised account follows parental consent.",
  },
  {
    title: "Dual consent",
    body:
      "Participation requires consent from both the biological and the spiritual parent or guardian, recorded with the policy version in force.",
  },
  {
    title: "No unsupervised contact",
    body:
      "There is no private mentor–mentee messaging. Mentoring happens within supervised, accountable settings, and all contact goes through IHF.",
  },
  {
    title: "Confidentiality",
    body:
      "Members' records are private and visible only to authorised staff. We never publish identifying details of minors or welfare recipients.",
  },
  {
    title: "Vetted mentors",
    body:
      "Mentors are invited, profiled, vetted and reference-checked, and are paired only within the age range they are approved for.",
  },
  {
    title: "Accountability",
    body:
      "Staff access to a child's record is logged, and all public communication passes a Communications approval workflow.",
  },
];

export default function SafeguardingPage() {
  return (
    <>
      <Section tone="cream" className="pt-16">
        <Eyebrow>Safeguarding &amp; policies</Eyebrow>
        <SectionTitle>Protecting the people we serve.</SectionTitle>
        <Lead>
          Safeguarding is built into how IHF works, not added on afterwards.
          These commitments guide every programme, pairing and conversation.
        </Lead>
      </Section>

      <Section tone="white">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COMMITMENTS.map((c) => (
            <div key={c.title} className="rounded-[var(--radius-lg)] border border-cream-200 p-6">
              <h3 className="font-semibold text-forest">{c.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{c.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="cream">
        <div className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-8">
          <h2 className="text-lg font-semibold text-forest">Raising a concern</h2>
          <p className="mt-2 text-sm text-ink-soft">
            If you have a safeguarding concern, a confidential reporting channel
            that reaches our safeguarding officer directly is being prepared. In
            the meantime, please{" "}
            <Link href="/contact" className="font-semibold text-forest hover:underline">
              contact us
            </Link>{" "}
            and mark your message as confidential.
          </p>
          <p className="mt-4 text-sm text-ink-soft">
            Our versioned Organisational Policy &amp; Code of Conduct, and the
            privacy notice, are published as they are approved by IHF governance.
          </p>
        </div>
      </Section>
    </>
  );
}
