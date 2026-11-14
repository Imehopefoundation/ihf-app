/** The three programmes a child can be applied to (CLAUDE.md wording). */
export const PROGRAMMES = [
  "Skills Development",
  "Education & Scholarships",
  "Welfare & Support",
] as const;

export type Programme = (typeof PROGRAMMES)[number];

export function isProgramme(value: string): value is Programme {
  return (PROGRAMMES as readonly string[]).includes(value);
}
