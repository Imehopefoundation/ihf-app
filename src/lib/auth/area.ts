import type { AppRole } from "./session";

/**
 * Each person belongs to ONE primary area of the LMS, which decides the
 * dashboard they land on and the navigation they see. Mentees, mentors and
 * admins each get a distinct, self-contained area — they never share a screen
 * (CLAUDE.md). A user with several roles resolves to the highest-priority one.
 */
export type LmsArea = "admin" | "safeguarding" | "mentor" | "mentee" | "none";

// Highest priority first.
const AREA_PRIORITY: { role: AppRole; area: LmsArea }[] = [
  { role: "admin", area: "admin" },
  { role: "safeguarding_officer", area: "safeguarding" },
  { role: "mentor", area: "mentor" },
  { role: "mentee", area: "mentee" },
];

/** The person's primary area, derived from their roles. */
export function primaryArea(roles: AppRole[]): LmsArea {
  for (const { role, area } of AREA_PRIORITY) {
    if (roles.includes(role)) return area;
  }
  return "none";
}

/** The dashboard home path for an area. */
export function areaHome(area: LmsArea): string {
  switch (area) {
    case "admin":
      return "/app/admin";
    case "safeguarding":
      return "/app/safeguarding";
    case "mentor":
      return "/app/mentoring";
    case "mentee":
      return "/app/learning";
    default:
      return "/app/account";
  }
}

/** Where a person lands when they open the LMS. */
export function homeForRoles(roles: AppRole[]): string {
  return areaHome(primaryArea(roles));
}
