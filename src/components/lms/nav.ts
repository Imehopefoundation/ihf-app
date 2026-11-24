import type { AppRole } from "@/lib/auth/session";
import type { IconName } from "./icons";

export interface LmsNavItem {
  href: string;
  label: string;
  /** Visible to every signed-in user when omitted; otherwise only these roles (admin always). */
  roles?: readonly AppRole[];
  /** Short description for the dashboard cards. */
  blurb?: string;
  icon: IconName;
}

/**
 * LMS navigation. Visibility here is convenience only — each page ALSO enforces
 * its own role check server-side (see requireRole), and the database enforces
 * access with RLS. Nothing here is a security boundary on its own.
 */
export const LMS_NAV: readonly LmsNavItem[] = [
  { href: "/app", label: "Dashboard", blurb: "Your overview and next steps.", icon: "spark" },
  {
    href: "/app/learning",
    label: "My learning",
    roles: ["mentee"],
    blurb: "Videos, sessions, assessments and your Impact Journal.",
    icon: "sessions",
  },
  {
    href: "/app/mentoring",
    label: "Mentoring",
    roles: ["mentor"],
    blurb: "Post videos, record sessions and run assessments.",
    icon: "mentees",
  },
  {
    href: "/app/safeguarding",
    label: "Safeguarding",
    roles: ["safeguarding_officer"],
    blurb: "Confidential safeguarding reports and case notes.",
    icon: "shield",
  },
  { href: "/app/account", label: "Account", blurb: "Your details, roles and sign-out.", icon: "account" },
];
