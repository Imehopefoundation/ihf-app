import type { Metadata } from "next";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { Section, Eyebrow, SectionTitle, Lead } from "@/components/site/primitives";
import { MentorInviteForm } from "./MentorInviteForm";

export const metadata: Metadata = {
  title: "Join Us",
  description: "Two pathways into one family — be mentored, or serve as a mentor by invitation.",
};

const MENTEE_STEPS = [
  { n: "01", title: "Create your account", body: "Sign up with your email so you can save progress and return at any time." },
  { n: "02", title: "Intake form", body: "Tell us about yourself, your background and what you hope to grow in." },
  { n: "03", title: "Choose the age group", body: "6–11 (a parent or guardian applies and manages everything) or 12–16 (a supervised teen account with parental consent)." },
  { n: "04", title: "Consent", body: "Consent is given by both the biological and the spiritual parent or guardian, and recorded with the policy version." },
  { n: "05", title: "Agreement", body: "Read and acknowledge the Code of Conduct and the mentee agreement." },
  { n: "06", title: "Review and pairing", body: "Our team reviews the application and, when accepted, pairs the mentee with the right mentor — you are notified by email and in-app when a slot opens." },
];

const MENTOR_STEPS = [
  "Enter a valid invitation code",
  "Create your account and profile",
  "Share your skill area and years of experience",
  "Provide a statement of faith commitment",
  "Give two references",
  "Review the Mentor Vows and sign the Mentorship Agreement",
];

export default function JoinPage() {
  return (
    <>
      <Section tone="cream" className="pt-16">
        <Eyebrow>Join us</Eyebrow>
        <SectionTitle>Two pathways into one family.</SectionTitle>
        <Lead>
          Whether you are ready to be mentored or invited to mentor others, every
          journey begins with clear, caring steps.
        </Lead>
      </Section>

      <Section tone="white">
        <Eyebrow>For mentees</Eyebrow>
        <SectionTitle>Apply to be mentored.</SectionTitle>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MENTEE_STEPS.map((s) => (
            <li key={s.n} className="rounded-[var(--radius-lg)] border border-cream-200 p-5">
              <span className="text-xs font-semibold text-gold">{s.n}</span>
              <h3 className="mt-2 font-semibold text-forest">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-ink-soft">
          The learning dashboard opens once approvals and policy acknowledgements
          are complete.
        </p>
      </Section>

      <Section tone="cream">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Eyebrow>For mentors</Eyebrow>
            <SectionTitle>Serve by invitation.</SectionTitle>
            <Lead>
              Mentors join IHF by invitation so that every member is walked with
              by someone vetted, prepared and accountable.
            </Lead>
            <ul className="mt-6 space-y-2">
              {MENTOR_STEPS.map((step) => (
                <li key={step} className="flex gap-3 text-sm text-ink">
                  <span aria-hidden="true" className="text-gold">◆</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
          <MentorInviteForm />
        </div>
      </Section>

      <Section tone="forest" className="text-center">
        <SectionTitle onDark>Questions before you begin?</SectionTitle>
        <div className="mt-6 flex justify-center">
          <Link href="/contact" className={buttonClasses("gold", "lg")}>
            Contact us
          </Link>
        </div>
      </Section>
    </>
  );
}
