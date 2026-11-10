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

## Supabase project — connected
Dev project `ihf-app 1` (ref `rfljuftmoqmxddyiordf`) is connected. Network hosts
allowed; `.env.local` holds URL + anon key + a generated `FIELD_ENCRYPTION_KEY`
(session-local, gitignored). Server `fetch` routes through the sandbox proxy via
`src/instrumentation.ts`. Connection verified (REST + Auth reachable, app
`/account` redirects correctly).

Email/password auth is built and infra-verified (sign up/in/out, `/account`,
email-confirm route, signup→profile trigger, non-enumerating errors, rate
limits). Still to do:
- Apply migrations **part 2** (`grants` + signup trigger) in the SQL Editor
  (part 1 already applied).
- Full signup→confirm→signin test (needs email confirmation on, or temporarily
  off in Supabase Auth settings for dev).
- **Mandatory 2FA for staff/admin** (passkeys/TOTP) — Supabase MFA enrolment.
- Password reset flow.
- Session refresh in `src/proxy.ts` (deferred; server client reads the cookie
  directly for now — fine for correctness, refresh keeps tokens fresh).
- `SUPABASE_SERVICE_ROLE_KEY` — only when admin-only server ops need it; will be
  collected via a secure card then. For production, `FIELD_ENCRYPTION_KEY` and
  the service_role must be set as real secrets (not the session-local file).

### Lesson captured in tests
Supabase does **not** auto-grant table privileges on SQL-created tables, so every
migration grants explicitly and the local RLS harness no longer masks this
(tests now fail if a grant is missing — matching production).

### Phase 3 (Applications) — built vs pending
Built & RLS-tested now: the data model (guardians, children, applications,
consents), field-level encryption (`crypto.ts`), and the IHF Letter PDF
generator — all tested against local Postgres / unit tests. Pending the live
project (auth-gated): guardian registration & add-child UI, the dual-consent
flow, the "paired with the right mentor" status flow with email/in-app
notifications, and wiring staff record-views to `log_record_view`.

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
