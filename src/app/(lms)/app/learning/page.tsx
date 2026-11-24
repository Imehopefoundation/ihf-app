import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { LmsHub, type HubSection } from "@/components/lms/Hub";

export const metadata: Metadata = { title: "My learning" };

const SECTIONS: HubSection[] = [
  { href: "/app/learning/videos", label: "Videos", blurb: "Watch videos your mentors have posted.", ready: true, icon: "video" },
  { href: "/app/learning/calendar", label: "Calendar", blurb: "When your courses are, and what time.", ready: true, icon: "calendar" },
  { href: null, label: "Sessions", blurb: "Your devotion & code-of-conduct records.", ready: false, icon: "sessions" },
  { href: null, label: "Assessments", blurb: "Take and submit your monthly project.", ready: false, icon: "assessment" },
  { href: null, label: "Impact Journal", blurb: "Write and revisit your reflections.", ready: false, icon: "journal" },
];

export default async function LearningHub() {
  await requireRole(["mentee"]);
  return (
    <LmsHub
      eyebrow="Your journey"
      title="Keep growing, keep rising"
      intro="Everything for your journey as a mentee — videos, your schedule, sessions, assessments and your Impact Journal."
      scripture="I can do all things through Christ which strengtheneth me."
      reference="Philippians 4:13 (KJV)"
      sections={SECTIONS}
    />
  );
}
