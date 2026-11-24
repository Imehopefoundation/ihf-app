import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { LmsHub, type HubSection } from "@/components/lms/Hub";

export const metadata: Metadata = { title: "My learning" };

const SECTIONS: HubSection[] = [
  { href: "/app/learning/videos", label: "Videos", blurb: "Watch videos your mentors have posted.", ready: true },
  { href: null, label: "Calendar", blurb: "When your courses are, and what time.", ready: false },
  { href: null, label: "Sessions", blurb: "Your devotion & code-of-conduct records.", ready: false },
  { href: null, label: "Assessments", blurb: "Take and submit your monthly project.", ready: false },
  { href: null, label: "Impact Journal", blurb: "Write and revisit your reflections.", ready: false },
];

export default async function LearningHub() {
  await requireRole(["mentee"]);
  return (
    <LmsHub
      title="My learning"
      intro="Everything for your journey as a mentee — videos, your schedule, sessions, assessments and your Impact Journal."
      sections={SECTIONS}
    />
  );
}
