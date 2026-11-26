import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getProfileName } from "@/lib/data/profile";
import { verseOfTheDay } from "@/lib/content/verses";
import { LmsHero } from "@/components/lms/LmsHero";
import { SectionCard } from "@/components/lms/SectionCard";
import type { IconName } from "@/components/lms/icons";

export const metadata: Metadata = { title: "Admin" };

interface Card {
  href: string | null;
  label: string;
  blurb: string;
  ready: boolean;
  icon: IconName;
}

// Admin's OWN tools — a distinct dashboard, not the mentor/mentee screens.
// Most are built in the admin phase (after mentees and mentors).
const ADMIN_TOOLS: Card[] = [
  { href: null, label: "Members & roles", blurb: "Invite staff, assign and revoke roles.", ready: false, icon: "mentees" },
  { href: null, label: "Applications", blurb: "Review and move applications through their statuses.", ready: false, icon: "journal" },
  { href: null, label: "Assessments (QA)", blurb: "Review assessments before release.", ready: false, icon: "assessment" },
  { href: null, label: "Communications", blurb: "Approve public communication before it goes out.", ready: false, icon: "spark" },
  { href: null, label: "Policies", blurb: "Versioned policy & re-acknowledgements.", ready: false, icon: "journal" },
  { href: null, label: "Audit log", blurb: "Every staff view of a child record.", ready: false, icon: "shield" },
];

// Oversight: an admin may look into the member-facing areas. Kept separate and
// clearly labelled so admin's own dashboard stays distinct.
const OVERSIGHT: Card[] = [
  { href: "/app/learning", label: "Mentee view", blurb: "Preview the mentee dashboard.", ready: true, icon: "sessions" },
  { href: "/app/mentoring", label: "Mentor view", blurb: "Preview the mentor dashboard.", ready: true, icon: "mentees" },
];

export default async function AdminDashboard() {
  const { user } = await requireRole(["admin"]);
  const supabase = await createClient();
  const name = await getProfileName(supabase, user.id);
  const verse = verseOfTheDay();

  return (
    <div className="mx-auto max-w-4xl">
      <LmsHero
        eyebrow="Verse of the day"
        title={name ? `Welcome, ${name}` : "Welcome, admin"}
        subtitle="Oversight of the foundation — handled with care and accountability."
        scripture={verse.text}
        reference={verse.reference}
      />

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-widest text-ink-soft">
        Administration
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {ADMIN_TOOLS.map((c) => (
          <SectionCard key={c.label} {...c} />
        ))}
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-widest text-ink-soft">
        Oversight
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Look into the member-facing areas. These are their dashboards, not yours.
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {OVERSIGHT.map((c) => (
          <SectionCard key={c.label} {...c} />
        ))}
      </div>
    </div>
  );
}
