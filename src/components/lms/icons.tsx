import type { SVGProps } from "react";
import type { ReactNode } from "react";

export type IconName =
  | "video"
  | "calendar"
  | "sessions"
  | "assessment"
  | "journal"
  | "mentees"
  | "account"
  | "shield"
  | "spark";

const PATHS: Record<IconName, ReactNode> = {
  shield: (
    <>
      <path d="M12 3 5 5.8v5.2c0 4.3 2.9 7.3 7 8.7 4.1-1.4 7-4.4 7-8.7V5.8Z" />
      <path d="m9.3 11.8 1.9 1.9 3.5-3.7" />
    </>
  ),
  video: (
    <>
      <rect x="2.5" y="6" width="12" height="12" rx="2.5" />
      <path d="m14.5 10 5-2.5v9L14.5 14" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
      <path d="M8 14h3" />
    </>
  ),
  sessions: (
    <>
      <path d="M12 7c-2.2-1.4-5-1.4-8 0v11c3-1.4 5.8-1.4 8 0 2.2-1.4 5-1.4 8 0V7c-3-1.4-5.8-1.4-8 0Z" />
      <path d="M12 7v11" />
    </>
  ),
  assessment: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2.5" />
      <path d="M9 4h6v3H9z" />
      <path d="m8.5 13 2 2 4-4" />
    </>
  ),
  journal: (
    <>
      <path d="M12 20.5h8.5" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7.5 18.5l-4 1 1-4Z" />
    </>
  ),
  mentees: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6" />
      <path d="M20.5 19.5a5.5 5.5 0 0 0-4-5.3" />
    </>
  ),
  account: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3.5 13.6 9l5.4 1.6-5.4 1.6L12 17.5l-1.6-5.3L5 10.6 10.4 9Z" />
    </>
  ),
};

/** Lightweight inline line-icons for the LMS (no dependency). */
export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {PATHS[name]}
    </svg>
  );
}
