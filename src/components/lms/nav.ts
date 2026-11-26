import type { LmsArea } from "@/lib/auth/area";
import type { IconName } from "./icons";

export interface LmsNavItem {
  href: string;
  label: string;
  icon: IconName;
}

/**
 * Navigation is scoped to a single area. A mentee sees only mentee items, a
 * mentor only mentor items, an admin only admin items — they never share a
 * sidebar. Visibility here is convenience only: every page ALSO enforces its
 * own role check server-side (requireRole) and the database enforces RLS.
 */
const ACCOUNT: LmsNavItem = { href: "/app/account", label: "Account", icon: "account" };

const MENTEE_NAV: readonly LmsNavItem[] = [
  { href: "/app/learning", label: "Dashboard", icon: "spark" },
  { href: "/app/learning/videos", label: "Videos", icon: "video" },
  { href: "/app/learning/calendar", label: "Calendar", icon: "calendar" },
  { href: "/app/learning/sessions", label: "Sessions", icon: "sessions" },
  ACCOUNT,
];

const MENTOR_NAV: readonly LmsNavItem[] = [
  { href: "/app/mentoring", label: "Dashboard", icon: "spark" },
  { href: "/app/mentoring/videos", label: "Videos", icon: "video" },
  { href: "/app/mentoring/calendar", label: "Calendar", icon: "calendar" },
  { href: "/app/mentoring/sessions", label: "Sessions", icon: "sessions" },
  ACCOUNT,
];

const ADMIN_NAV: readonly LmsNavItem[] = [
  { href: "/app/admin", label: "Dashboard", icon: "spark" },
  ACCOUNT,
];

const SAFEGUARDING_NAV: readonly LmsNavItem[] = [
  { href: "/app/safeguarding", label: "Safeguarding", icon: "shield" },
  ACCOUNT,
];

const NONE_NAV: readonly LmsNavItem[] = [ACCOUNT];

/** The navigation for a given area. */
export function navForArea(area: LmsArea): readonly LmsNavItem[] {
  switch (area) {
    case "admin":
      return ADMIN_NAV;
    case "safeguarding":
      return SAFEGUARDING_NAV;
    case "mentor":
      return MENTOR_NAV;
    case "mentee":
      return MENTEE_NAV;
    default:
      return NONE_NAV;
  }
}
