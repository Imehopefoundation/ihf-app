import type { Metadata } from "next";
import { Section, Eyebrow, SectionTitle, Lead } from "@/components/site/primitives";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send IHF a message, or read answers to common questions.",
};

const FAQ = [
  {
    q: "Who can apply to become a mentee?",
    a: "Young people aged 6–16. For ages 6–11 a parent or guardian applies and manages everything; for 12–16 a supervised teen account follows parental consent.",
  },
  {
    q: "How do mentors join IHF?",
    a: "Mentors join by invitation, after profiling, vetting and reference checks, and sign the Mentor Vows and Mentorship Agreement.",
  },
  {
    q: "Do I need to be a Christian to apply?",
    a: "IHF is a God-centred charity and our programmes are faith-rooted. We welcome a conversation about what that means for you.",
  },
  {
    q: "Is there a cost to join a programme?",
    a: "No. For active mentees in Skills Development, IHF covers tools, materials, data and transport so cost is never a barrier.",
  },
  {
    q: "How is my personal information protected?",
    a: "Records are private and visible only to authorised staff. We never publish identifying details of minors or welfare recipients, and we share stories only with documented consent.",
  },
  {
    q: "What does it mean to be called a member?",
    a: "Everyone we serve is a member — valued, accountable and called to multiply. Care is given as dignity, never charity.",
  },
];

export default function ContactPage() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_URL;

  return (
    <>
      <Section tone="cream" className="pt-16">
        <Eyebrow>Contact</Eyebrow>
        <SectionTitle>Send us a message.</SectionTitle>
        <Lead>
          Whether you want to apply, mentor, give or partner, we would love to
          hear from you.
        </Lead>
      </Section>

      <Section tone="white">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <ContactForm />
          <div className="space-y-6">
            <div className="rounded-[var(--radius-lg)] border border-cream-200 bg-cream-100 p-6">
              <h2 className="font-semibold text-forest">Other ways to reach us</h2>
              {whatsapp ? (
                <a
                  href={whatsapp}
                  className="mt-3 inline-block text-sm font-semibold text-forest hover:underline"
                >
                  Message us on WhatsApp →
                </a>
              ) : (
                <p className="mt-3 text-sm text-ink-soft">
                  A WhatsApp contact line is being set up and will appear here soon.
                </p>
              )}
              <p className="mt-3 text-sm text-ink-soft">
                For anything confidential, including a safeguarding concern,
                please say so in your message and mark it confidential.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="cream">
        <Eyebrow>Questions and answers</Eyebrow>
        <SectionTitle>Common questions.</SectionTitle>
        <div className="mt-8 divide-y divide-cream-200 border-y border-cream-200">
          {FAQ.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="cursor-pointer list-none font-medium text-ink marker:content-none">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span aria-hidden="true" className="text-gold transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-2 text-sm text-ink-soft">{item.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}
