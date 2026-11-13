import type { Metadata } from "next";
import { Section, Eyebrow, SectionTitle, Lead, Scripture } from "@/components/site/primitives";
import { PILLARS } from "@/lib/content/pillars";

export const metadata: Metadata = {
  title: "Core Pillars",
  description: "Five biblical principles (KJV) that guide everyday decisions at IHF.",
};

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
                <Scripture reference={p.reference}>{p.verse}</Scripture>
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
