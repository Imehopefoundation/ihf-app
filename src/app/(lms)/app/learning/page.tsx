import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getProfileName } from "@/lib/data/profile";
import { verseOfTheDay } from "@/lib/content/verses";
import { LmsHub, type HubSection } from "@/components/lms/Hub";

export const metadata: Metadata = { title: "My learning" };

const SECTIONS: HubSection[] = [
  { href: "/app/learning/videos", label: "Videos", blurb: "Watch videos your mentors have posted.", ready: true, icon: "video" },
  { href: "/app/learning/calendar", label: "Calendar", blurb: "When your courses are, and what time.", ready: true, icon: "calendar" },
  { href: "/app/learning/sessions", label: "Sessions", blurb: "Your devotion & code-of-conduct records.", ready: true, icon: "sessions" },
  { href: null, label: "Assessments", blurb: "Take and submit your monthly project.", ready: false, icon: "assessment" },
  { href: null, label: "Impact Journal", blurb: "Write and revisit your reflections.", ready: false, icon: "journal" },
];

export default async function LearningHub() {
  const { user } = await requireRole(["mentee"]);
  const supabase = await createClient();
  const name = await getProfileName(supabase, user.id);
  const verse = verseOfTheDay();

  return (
    <LmsHub
      eyebrow="Verse of the day"
      title={name ? `Welcome, ${name}` : "Welcome back"}
      intro="Keep growing, keep rising."
      scripture={verse.text}
      reference={verse.reference}
      sections={SECTIONS}
    />
  );
}
