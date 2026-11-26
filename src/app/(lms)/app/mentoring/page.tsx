import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getProfileName } from "@/lib/data/profile";
import { verseOfTheDay } from "@/lib/content/verses";
import { LmsHub, type HubSection } from "@/components/lms/Hub";

export const metadata: Metadata = { title: "Mentoring" };

const SECTIONS: HubSection[] = [
  { href: "/app/mentoring/videos", label: "Videos", blurb: "Post YouTube/Vimeo links for your mentees.", ready: true, icon: "video" },
  { href: "/app/mentoring/calendar", label: "Calendar", blurb: "Your course schedule — dates and times.", ready: true, icon: "calendar" },
  { href: "/app/mentoring/sessions", label: "Sessions", blurb: "Record devotion, code-of-conduct, attendance.", ready: true, icon: "sessions" },
  { href: null, label: "My mentees", blurb: "The mentees paired to you (via IHF).", ready: false, icon: "mentees" },
  { href: null, label: "Assessments", blurb: "Design assessments (QA-reviewed) and score work.", ready: false, icon: "assessment" },
];

export default async function MentoringHub() {
  const { user } = await requireRole(["mentor"]);
  const supabase = await createClient();
  const name = await getProfileName(supabase, user.id);
  const verse = verseOfTheDay();

  return (
    <LmsHub
      eyebrow="Verse of the day"
      title={name ? `Welcome, ${name}` : "Welcome back"}
      intro="Pour into those you lead."
      scripture={verse.text}
      reference={verse.reference}
      sections={SECTIONS}
    />
  );
}
