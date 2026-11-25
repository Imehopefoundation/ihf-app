import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { LmsHub, type HubSection } from "@/components/lms/Hub";

export const metadata: Metadata = { title: "Mentoring" };

const SECTIONS: HubSection[] = [
  { href: "/app/mentoring/videos", label: "Videos", blurb: "Post YouTube/Vimeo links for your mentees.", ready: true, icon: "video" },
  { href: "/app/mentoring/calendar", label: "Calendar", blurb: "Your course schedule — dates and times.", ready: true, icon: "calendar" },
  { href: null, label: "My mentees", blurb: "The mentees paired to you (via IHF).", ready: false, icon: "mentees" },
  { href: "/app/mentoring/sessions", label: "Sessions", blurb: "Record devotion, code-of-conduct, attendance.", ready: true, icon: "sessions" },
  { href: null, label: "Assessments", blurb: "Design assessments (QA-reviewed) and score work.", ready: false, icon: "assessment" },
];

export default async function MentoringHub() {
  await requireRole(["mentor"]);
  return (
    <LmsHub
      eyebrow="Raising the next generation"
      title="Pour into those you lead"
      scripture="The same commit thou to faithful men, who shall be able to teach others also."
      reference="2 Timothy 2:2 (KJV)"
      sections={SECTIONS}
    />
  );
}
