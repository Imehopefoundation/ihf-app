import type { Metadata } from "next";
import { Section, Eyebrow, SectionTitle, Lead } from "@/components/site/primitives";

export const metadata: Metadata = {
  title: "Programmes",
  description:
    "Skills Development, Education & Scholarships, and Welfare & Support — IHF's three mission expressions.",
};

type Programme = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
};

const PROGRAMMES: Programme[] = [
  {
    id: "skills-development",
    eyebrow: "Our flagship programme",
    title: "Skills Development",
    body:
      "Faith-rooted masterclasses that turn potential into dignified, future-ready skill. For active mentees, IHF covers tools, materials, data and transport so that cost is never the reason a gift goes undeveloped.",
    points: ["AI", "Fashion Design", "Content Production"],
  },
  {
    id: "education",
    eyebrow: "Learning anchored in faith",
    title: "Education & Scholarships",
    body:
      "Opening doors to quality Christian education and walking alongside learners as they grow in knowledge and character.",
    points: ["School partnerships", "Scholarships", "Mentorship in learning"],
  },
  {
    id: "welfare-support",
    eyebrow: "Dignity, partnership and stewardship",
    title: "Welfare & Support",
    body:
      "Standing with members and communities in seasons of need, with respect and care. Help is given as dignity, never charity, and individual circumstances are never named publicly.",
    points: ["Practical support", "Referrals", "Walking alongside"],
  },
];

/** Mentor block — CLAUDE.md requires photo, name, skill area, short bio. All
 *  placeholder until vetted, consented and staff-published (see OPEN_ITEMS). */
function MentorBlock({ skillArea }: { skillArea: string }) {
  return (
    <div className="mt-6 flex items-center gap-4 rounded-[var(--radius-lg)] border border-cream-200 bg-cream-100/60 p-4">
      <div className="h-16 w-16 shrink-0 rounded-full border border-cream-200 bg-cream-200" aria-hidden="true" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">Mentor · {skillArea}</p>
        <p className="mt-1 text-sm font-medium text-forest">To be introduced</p>
        <p className="text-sm text-ink-soft">
          Mentor profiles appear here only once vetted and published with written consent.
        </p>
      </div>
    </div>
  );
}

export default function ProgrammesPage() {
  return (
    <>
      <Section tone="cream" className="pt-16">
        <Eyebrow>Programmes</Eyebrow>
        <SectionTitle>Three mission expressions</SectionTitle>
        <Lead>
          Every programme serves two age groups — 6–11 and 12–16 — with matching
          and waitlists kept separate for each, so that every member is walked
          with in a way that fits their stage.
        </Lead>
      </Section>

      {PROGRAMMES.map((p, i) => (
        <Section key={p.id} id={p.id} tone={i % 2 === 0 ? "white" : "cream"}>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Eyebrow>{p.eyebrow}</Eyebrow>
              <SectionTitle>{p.title}</SectionTitle>
              <div className="mt-5 flex flex-wrap gap-2">
                {p.points.map((pt) => (
                  <span
                    key={pt}
                    className="rounded-full border border-forest/20 bg-forest/5 px-3 py-1 text-sm font-medium text-forest"
                  >
                    {pt}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-lg text-ink">{p.body}</p>
              <MentorBlock skillArea={p.title} />
            </div>
          </div>
        </Section>
      ))}

      <Section tone="forest" className="text-center">
        <SectionTitle onDark>Ready to begin?</SectionTitle>
        <Lead onDark className="mx-auto">
          Applications open by a short intake form. Mentors join by invitation.
        </Lead>
        <div className="mt-8 flex justify-center gap-3">
          <a href="/join" className="rounded-[var(--radius)] bg-cream px-6 py-3 text-sm font-medium text-forest hover:bg-white">
            Join Us
          </a>
        </div>
      </Section>
    </>
  );
}
