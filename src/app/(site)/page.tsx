import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import {
  Section,
  Eyebrow,
  SectionTitle,
  Lead,
  Scripture,
  ImagePlaceholder,
} from "@/components/site/primitives";
import { PillarsInteractive } from "@/components/site/PillarsInteractive";

const PROGRAMMES = [
  {
    eyebrow: "Our flagship programme",
    title: "Skills Development",
    body:
      "Faith-rooted masterclasses in AI, Fashion Design and Content Production that turn potential into dignified, future-ready skill. IHF covers tools, materials, data and transport for active mentees.",
  },
  {
    eyebrow: "Learning anchored in faith",
    title: "Education & Scholarships",
    body:
      "Opening doors to quality Christian education and walking alongside learners as they grow in knowledge and character.",
  },
  {
    eyebrow: "Dignity, partnership and stewardship",
    title: "Welfare & Support",
    body:
      "Standing with members and communities in seasons of need, with respect and care, so that help is given as dignity, never charity.",
  },
];

const CYCLE = [
  { n: "01", title: "Apply", body: "Begin with a short intake form so we can understand your story and your hopes." },
  { n: "02", title: "Be mentored", body: "You are paired with the right mentor and walk together in faith, accountability and care." },
  { n: "03", title: "Grow in skill and character", body: "Train in a real skill, keep an Impact Journal and discover your purpose." },
  { n: "04", title: "Serve others", body: "Put your gifts to work in your family, church and community." },
  { n: "05", title: "Raise the next generation", body: "Become a mentor and multiply what you have received.", highlight: true },
];

const INVITATIONS = [
  { title: "Mentees", body: "Grow in faith, skill and purpose.", cta: "Apply", href: "/join" },
  { title: "Mentors", body: "Serve by invitation and multiply your gifts.", cta: "Mentor pathway", href: "/join" },
  { title: "Supporters", body: "Give quietly, as an act of stewardship.", cta: "Give", href: "/give" },
  { title: "Partners", body: "Churches, schools and organisations.", cta: "Start a conversation", href: "/contact" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <Section tone="cream" className="pt-16 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Eyebrow>Financial competence · Faith · Technical competence</Eyebrow>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Raising a generation that{" "}
              <span className="italic text-gold">raises others.</span>
            </h1>
            <Lead>
              IME HOPE FOUNDATION brings together Christian faith, practical
              skills, financial competence, education and welfare support — so
              that every member grows, and then equips someone else to grow too.
            </Lead>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/join" className={buttonClasses("primary", "lg")}>
                Apply as a mentee
              </Link>
              <Link href="/programmes" className={buttonClasses("secondary", "lg")}>
                Explore our programmes
              </Link>
              <Link href="/give" className={buttonClasses("give", "lg")}>
                Give
              </Link>
            </div>
          </div>
          <ImagePlaceholder
            label="Skills Development"
            caption="Masterclasses in AI, Fashion Design and Content Production, taught with patience and purpose."
          />
        </div>
      </Section>

      {/* Our calling */}
      <Section tone="forest">
        <Eyebrow onDark>Our calling</Eyebrow>
        <SectionTitle onDark className="max-w-4xl">
          To awaken potential and break the chains of mental and financial
          poverty across Africa.
        </SectionTitle>
        <div className="mt-10 grid gap-8 border-t border-white/15 pt-8 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gold-soft">Mission</h3>
            <p className="mt-2 text-cream/85">
              To raise empowered individuals who in turn raise others, through
              faith-rooted mentorship, skills development, education and welfare
              support.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gold-soft">Approach</h3>
            <p className="mt-2 text-cream/85">
              Three connected parts — financial competence, faith and technical
              competence — where spiritual growth and practical skill reinforce
              one another.
            </p>
          </div>
        </div>
      </Section>

      {/* Programmes preview */}
      <Section tone="cream">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Our programmes</Eyebrow>
            <SectionTitle>Three mission expressions</SectionTitle>
          </div>
          <Link href="/programmes" className="text-sm font-semibold text-forest hover:underline">
            All programmes →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PROGRAMMES.map((p) => (
            <article key={p.title} className="rounded-[var(--radius-lg)] border border-cream-200 bg-white p-6">
              <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-gold">{p.eyebrow}</p>
              <h3 className="mt-2 text-xl font-semibold text-forest">{p.title}</h3>
              <p className="mt-3 text-sm text-ink-soft">{p.body}</p>
            </article>
          ))}
        </div>
      </Section>

      {/* Five pillars — interactive selector (tap a pillar to see its scripture) */}
      <Section tone="white">
        <PillarsInteractive />
      </Section>

      {/* Multiplying cycle */}
      <Section tone="cream">
        <Eyebrow>The multiplying cycle</Eyebrow>
        <SectionTitle>What you receive, you pass on.</SectionTitle>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CYCLE.map((step) => (
            <div
              key={step.n}
              className={
                step.highlight
                  ? "rounded-[var(--radius-lg)] bg-forest p-5 text-cream"
                  : "rounded-[var(--radius-lg)] border border-cream-200 bg-white p-5"
              }
            >
              <span className={step.highlight ? "text-xs font-semibold text-gold-soft" : "text-xs font-semibold text-gold"}>
                {step.n}
              </span>
              <h3 className={step.highlight ? "mt-2 font-semibold text-cream" : "mt-2 font-semibold text-forest"}>
                {step.title}
              </h3>
              <p className={step.highlight ? "mt-2 text-sm text-cream/80" : "mt-2 text-sm text-ink-soft"}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Impact teaser */}
      <Section tone="night">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow onDark>Our impact</Eyebrow>
            <SectionTitle onDark>Fruit we can account for.</SectionTitle>
          </div>
          <Link href="/impact" className="text-sm font-semibold text-gold-soft hover:underline">
            See the impact dashboard →
          </Link>
        </div>
        <p className="mt-6 max-w-2xl rounded-[var(--radius-lg)] border border-white/15 p-5 text-cream/80">
          Verified figures are on their way. We only publish impact numbers once
          they have been checked and approved by our leadership — real,
          aggregated results, never estimates or targets presented as
          achievements, and never any individual&apos;s record.
        </p>
      </Section>

      {/* Invitation */}
      <Section tone="white">
        <Eyebrow>An invitation</Eyebrow>
        <SectionTitle>There is a place for you.</SectionTitle>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {INVITATIONS.map((inv) => (
            <div key={inv.title} className="flex flex-col rounded-[var(--radius-lg)] border border-cream-200 p-6">
              <h3 className="font-semibold text-forest">{inv.title}</h3>
              <p className="mt-2 flex-1 text-sm text-ink-soft">{inv.body}</p>
              <Link href={inv.href} className="mt-4 text-sm font-semibold text-forest hover:underline">
                {inv.cta} →
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* Scripture / reflection */}
      <Section tone="cream" className="text-center">
        <Eyebrow>Scripture and reflection</Eyebrow>
        <div className="mx-auto mt-6 max-w-3xl">
          <Scripture reference="2 Timothy 2:2 (KJV)">
            And the things that thou hast heard of me among many witnesses, the
            same commit thou to faithful men, who shall be able to teach others
            also.
          </Scripture>
        </div>
      </Section>

      {/* Closing band */}
      <Section tone="forest" className="text-center">
        <p className="mx-auto max-w-3xl font-display text-2xl leading-relaxed text-cream sm:text-3xl">
          “Yet at the scent of water it will bud and put forth shoots like a plant.”
        </p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-gold-soft">Job 14:9</p>
      </Section>
    </>
  );
}
