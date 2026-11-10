import type { Metadata } from "next";
import { Section, Eyebrow, SectionTitle, Lead, Scripture } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Core Pillars",
  description: "Five biblical principles (KJV) that guide everyday decisions at IHF.",
};

const PILLARS = [
  {
    n: "01",
    name: "Kingdom-mindedness",
    ref: "Matthew 6:33 (KJV)",
    verse:
      "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
    meaning: "Putting God's purposes first in every ambition, decision and relationship.",
    reflect: "What would change this week if God's kingdom came first in my plans?",
    apply: "Begin each project by asking how it serves God and others, not only yourself.",
  },
  {
    n: "02",
    name: "Diligence",
    ref: "Proverbs 13:4 (KJV)",
    verse:
      "The soul of the sluggard desireth, and hath nothing: but the soul of the diligent shall be made fat.",
    meaning: "Faithful, consistent effort that turns gifts into fruitful skill.",
    reflect: "Where am I wishing for results without committing to the work?",
    apply: "Keep a weekly practice log for your skill and review it with your mentor.",
  },
  {
    n: "03",
    name: "Integrity",
    ref: "Proverbs 11:3 (KJV)",
    verse:
      "The integrity of the upright shall guide them: but the perverseness of transgressors shall destroy them.",
    meaning: "Being the same person in private as in public, in small matters and large.",
    reflect: "Is there an area where my words and actions do not yet agree?",
    apply: "Keep honest records of money, time and materials entrusted to you.",
  },
  {
    n: "04",
    name: "Respect and Honour",
    ref: "Romans 12:10 (KJV)",
    verse:
      "Be kindly affectioned one to another with brotherly love; in honour preferring one another;",
    meaning: "Treating every person with dignity and celebrating the good in others.",
    reflect: "Whom can I honour this week in word or deed?",
    apply: "Listen first, speak kindly, and give credit generously within your team.",
  },
  {
    n: "05",
    name: "Accountability",
    ref: "Luke 16:10 (KJV)",
    verse:
      "He that is faithful in that which is least is faithful also in much: and he that is unjust in the least is unjust also in much.",
    meaning: "Welcoming oversight and owning both our commitments and our mistakes.",
    reflect: "What small responsibility am I being invited to steward well?",
    apply: "Report progress honestly to your mentor, including what did not go to plan.",
  },
];

export default function PillarsPage() {
  return (
    <>
      <Section tone="cream" className="pt-16">
        <Eyebrow>Core pillars</Eyebrow>
        <SectionTitle>Five principles. One way of life.</SectionTitle>
        <Lead>
          Each pillar is grounded in scripture (King James Version) and lived out
          in practical, everyday choices.
        </Lead>
      </Section>

      {PILLARS.map((p, i) => (
        <Section key={p.n} tone={i % 2 === 0 ? "white" : "cream"}>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="text-sm font-semibold text-gold">{p.n}</span>
              <h2 className="mt-1 text-2xl font-semibold text-forest sm:text-3xl">{p.name}</h2>
              <div className="mt-6">
                <Scripture reference={p.ref}>{p.verse}</Scripture>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {([
                ["Meaning", p.meaning],
                ["Reflect", p.reflect],
                ["Apply", p.apply],
              ] as const).map(([h, body]) => (
                <div key={h}>
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-ink-soft">{h}</h3>
                  <p className="mt-2 text-sm text-ink">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      ))}
    </>
  );
}
