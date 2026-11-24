import type { AppRole } from "@/lib/auth/session";

export interface LmsNavItem {
  href: string;
  label: string;
  /** Visible to every signed-in user when omitted; otherwise only these roles (admin always). */
  roles?: readonly AppRole[];
  /** Short description for the dashboard cards. */
  blurb?: string;
}

/**
 * LMS navigation. Visibility here is convenience only — each page ALSO enforces
 * its own role check server-side (see requireRole), and the database enforces
 * access with RLS. Nothing here is a security boundary on its own.
 */
export const LMS_NAV: readonly LmsNavItem[] = [
  { href: "/app", label: "Dashboard", blurb: "Your overview and next steps." },
  {
    href: "/app/learning",
    label: "My learning",
    roles: ["mentee"],
    blurb: "Your sessions, assessments and Impact Journal.",
  },
  {
    href: "/app/mentoring",
    label: "Mentoring",
    roles: ["mentor"],
    blurb: "Your mentees, session records and assessments.",
  },
  {
    href: "/app/safeguarding",
    label: "Safeguarding",
    roles: ["safeguarding_officer"],
    blurb: "Confidential safeguarding reports and case notes.",
  },
  { href: "/app/account", label: "Account", blurb: "Your details, roles and sign-out." },
];
