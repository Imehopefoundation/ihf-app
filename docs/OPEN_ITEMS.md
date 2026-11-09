# Open Items — [CONFIRM] / [VERIFY] / Decisions

Tracks every unknown and every deliberate deviation from CLAUDE.md, per the
brief ("Mark unknowns [CONFIRM] or [VERIFY] … in docs/OPEN_ITEMS.md").

Last updated: 2026-11-09 (Phase 0).

## Approved deviations from CLAUDE.md
- **Brand palette & type follow the Lovable design, not CLAUDE.md's brand section.**
  Owner decision (2026-11-09): keep Lovable's look — forest green / warm cream /
  gold accent, fonts **Sora** (headings) + **Plus Jakarta Sans** (body) — instead
  of the brief's monochrome + bronze / Galano-Figtree. Layout, structure and the
  corrected copy still follow the brief. The brief's **logo** and **imagery**
  rules still apply (approved SVG logos only; consented photography only).

## [CONFIRM] — need the client/owner to confirm
- **Logo files**: supplied as PNG; CLAUDE.md requires **SVG** in `public/brand/`
  (`logo-black.svg`, `logo-white.svg`, `icon-black.svg`, `icon-white.svg`).
  Currently using `logo-black.png` / `logo-white.png` as placeholders. Need: SVG
  versions, and the **icon-only** mark (no wordmark) for favicon / app icon.
- **Aggregate impact total**: may a single aggregated total be shown publicly, or
  nothing until leadership approves each figure? (CLAUDE.md §Impact.)
- **Donation currencies** and one-time vs recurring (Phase 8).
- **Contact details**: public email, phone, and **WhatsApp** number for Contact page.
- **Leadership**: names/photos/bios are placeholders until IHF admins supply approved ones.
- **Privacy notice**: draft for Nigerian counsel (Nigeria Data Protection Act).
  Never claim legal compliance until approved.

## [VERIFY]
- **Skills pass mark 60%** (CLAUDE.md §Product rules / Phase 6) — confirm value & rules.
- Attendance / notice records rules (Phase 6) — verify with client.
- **Accent gold** exact value — currently `oklch(0.63 0.08 78)` approximating the
  Lovable gold; tune against the design and check WCAG AA where used for text.

## Pending a dev Supabase project (hard dependency)
The DB layer (migrations + RLS) is built and tested against a local Postgres,
but these need a real **development** Supabase project to configure and verify
end-to-end (no production credentials, ever):
- Supabase Auth: email verification, password reset, invitation-only sign-up,
  and **mandatory 2FA for staff/admin** (passkeys/TOTP). Client modules exist
  (`src/lib/supabase/*`), env is validated (`src/lib/env.ts`); live flows + the
  server actions land once the project + keys are provided.
- Applying migrations to the project (`supabase db push`) and wiring session
  refresh into `src/proxy.ts`.
When ready: create the project, then the keys will be collected securely
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the
server-only `SUPABASE_SERVICE_ROLE_KEY`).

## Technical follow-ups (see docs/SECURITY.md)
- Static caching for public pages: all routes are currently dynamically rendered
  so the strict nonce CSP applies. Reintroduce static/edge caching for public
  pages (keeping strict CSP) once public and authenticated areas are separated.
- Rate limiter: move from in-memory to a shared store before production.
- Backups/PITR + restore test; incident response plan — before launch.
- Field-level encryption for child/welfare data — Phase 3.

## Stack note
- Using **Next.js 16.4.5** (latest stable) per "default to latest"; CLAUDE.md
  says "Next.js" without a version. Flag if a pin to 15.x is preferred.
