import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { LmsHub, type HubSection } from "@/components/lms/Hub";

export const metadata: Metadata = { title: "Mentoring" };

const SECTIONS: HubSection[] = [
  { href: "/app/mentoring/videos", label: "Videos", blurb: "Post YouTube/Vimeo links for your mentees.", ready: true },
  { href: null, label: "Calendar", blurb: "Your course schedule — dates and times.", ready: false },
  { href: null, label: "My mentees", blurb: "The mentees paired to you (via IHF).", ready: false },
  { href: null, label: "Sessions", blurb: "Record devotion, code-of-conduct, attendance.", ready: false },
  { href: null, label: "Assessments", blurb: "Design assessments (QA-reviewed) and score work.", ready: false },
];

export default async function MentoringHub() {
  await requireRole(["mentor"]);
  return (
    <LmsHub
      title="Mentoring"
      intro="Everything for mentoring — post videos, manage your schedule and mentees, record sessions and run assessments. No private messaging; all contact goes via IHF."
      sections={SECTIONS}
    />
  );
}
