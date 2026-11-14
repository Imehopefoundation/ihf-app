/**
 * The current Organisational Policy & Code of Conduct version. It is recorded
 * (with a timestamp) against every consent, so a consent can always be tied to
 * the exact policy text in force when it was given.
 *
 * [CONFIRM] the versioning scheme and the first published version with the
 * client (tracked in docs/OPEN_ITEMS.md). When a new policy version is
 * published, active members must re-acknowledge it (future phase).
 */
export const CURRENT_POLICY_VERSION = "2026.1-draft";

/** Human-readable consent kinds (CLAUDE.md: biological AND spiritual guardian). */
export const CONSENT_LABELS = {
  biological_parent: "Biological parent or guardian",
  spiritual_parent: "Spiritual parent or guardian",
} as const;
