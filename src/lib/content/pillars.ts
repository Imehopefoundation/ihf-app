/** The five core pillars (KJV only). Shared by the interactive home selector
 *  and the /pillars reference page so the content never drifts. */
export interface Pillar {
  n: string;
  name: string;
  reference: string;
  verse: string;
  meaning: string; // shown as "What it means"
  reflect: string;
  apply: string; // shown as "In daily life"
}

export const PILLARS: Pillar[] = [
  {
    n: "01",
    name: "Kingdom-mindedness",
    reference: "Matthew 6:33 (KJV)",
    verse:
      "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
    meaning: "Putting God's purposes first in every ambition, decision and relationship.",
    reflect: "What would change this week if God's kingdom came first in my plans?",
    apply: "Begin each project by asking how it serves God and others, not only yourself.",
  },
  {
    n: "02",
    name: "Diligence",
    reference: "Proverbs 13:4 (KJV)",
    verse:
      "The soul of the sluggard desireth, and hath nothing: but the soul of the diligent shall be made fat.",
    meaning: "Faithful, consistent effort that turns gifts into fruitful skill.",
    reflect: "Where am I wishing for results without committing to the work?",
    apply: "Keep a weekly practice log for your skill and review it with your mentor.",
  },
  {
    n: "03",
    name: "Integrity",
    reference: "Proverbs 11:3 (KJV)",
    verse:
      "The integrity of the upright shall guide them: but the perverseness of transgressors shall destroy them.",
    meaning: "Being the same person in private as in public, in small matters and large.",
    reflect: "Is there an area where my words and actions do not yet agree?",
    apply: "Keep honest records of money, time and materials entrusted to you.",
  },
  {
    n: "04",
    name: "Respect and Honour",
    reference: "Romans 12:10 (KJV)",
    verse:
      "Be kindly affectioned one to another with brotherly love; in honour preferring one another;",
    meaning: "Treating every person with dignity and celebrating the good in others.",
    reflect: "Whom can I honour this week in word or deed?",
    apply: "Listen first, speak kindly, and give credit generously within your team.",
  },
  {
    n: "05",
    name: "Accountability",
    reference: "Luke 16:10 (KJV)",
    verse:
      "He that is faithful in that which is least is faithful also in much: and he that is unjust in the least is unjust also in much.",
    meaning: "Welcoming oversight and owning both our commitments and our mistakes.",
    reflect: "What small responsibility am I being invited to steward well?",
    apply: "Report progress honestly to your mentor, including what did not go to plan.",
  },
];
