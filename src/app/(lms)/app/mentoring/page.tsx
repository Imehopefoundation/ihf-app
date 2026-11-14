import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { ComingSoon } from "@/components/lms/ComingSoon";

export const metadata: Metadata = { title: "Mentoring" };

export default async function MentoringPage() {
  await requireRole(["mentor"]);
  return (
    <ComingSoon
      title="Mentoring"
      blurb="Your paired mentees (within your vetted age range), session records, monthly assessments and QA review status. No private mentee messaging — all contact goes via IHF."
    />
  );
}
