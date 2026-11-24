# Open Items — [CONFIRM] / [VERIFY] / Decisions

Tracks every unknown and every deliberate deviation from CLAUDE.md, per the
brief ("Mark unknowns [CONFIRM] or [VERIFY] … in docs/OPEN_ITEMS.md").

Last updated: 2026-11-09 (Phase 0).

## Approved deviations from CLAUDE.md
- **Brand palette & type follow the Lovable design, not CLAUDE.md's brand section.**
  Owner decision (2026-11-09, updated 2026-11-13): **black primary / warm cream /
  gold accent**, fonts **Sora** (headings) + **Plus Jakarta Sans** (body). The
  primary colour was changed from forest green to **black** at the owner's
  request (2026-11-13) — this moves the palette back toward the brief's
  monochrome-plus-one-accent intent (black + gold instead of bronze). The
  `forest`/`forest-deep`/`night` token names are retained (now holding black
  values) so components did not need to change. Fonts still differ from the
  brief's Galano/Figtree. Layout, structure and the corrected copy follow the
  brief. The brief's **logo** and **imagery**
  rules still apply (approved SVG logos only; consented photography only).

## Imagery placeholders — MUST swap before launch [CONFIRM]
- **`public/photos/our-story.webp`** (Our Story section, shown across the three
  cylindrical frames): owner-supplied **placeholder** (2026-11-13). This is a
  **stock photo of identifiable children**, which CLAUDE.md forbids for launch
  ("real African youth photography with documented consent only; no stock photos
  of identifiable children"). Used now only so the owner can see the layout.
  **Replace before go-live** with a consented IHF group photo (EXIF/GPS already
  stripped on import; do the same for the replacement). The `photoSrc` prop on
  `OurStory` makes the swap a one-line change.
- **`public/photos/hero-hope.webp`** (Hero, clipped into the Africa map):
  owner-supplied **placeholder** (2026-11-13) — a child with arms raised wearing
  an "I HAVE HOPE" shirt. Same caveat as above: **stock photo of an identifiable
  child**; replace before go-live with a consented portrait (EXIF/GPS stripped on
  import; do the same for the replacement). Swap via the `HeroHope` `photoSrc`
  prop. The floating "I have hope" tag now shows only for the silhouette
  placeholder (the real portrait carries the message on the shirt).

## Resolved by consultation (12 Nov 2026) — see docs/CONSULTATION.md
- **Payments**: owner confirmed **multiple options** via a method selector —
  **Paystack** (Naira), **PayPal** (USD/GBP), **direct bank transfer**, extensible
  (PayPal approved). **No recurring debit**; anonymous/optional donor details;
  thank-you **page + receipt** on redirect; newsletter nurture instead of auto-charge.
- **Aggregate impact total**: no fabricated numbers; publish an **external-audit
  result** plus **consented** mentor/mentee stories under Impact.
- **Product shape**: it's an **LMS** — monthly single-course modules (reading list +
  video lectures + notes), **impromptu/random tests**, QA review of uploaded video,
  mentee **motivational dashboard (no grades)**, in-app support, role-scoped logins.

## [CONFIRM] — need the client/owner to confirm
- **Logo + colours**: founder to send the planning document. (Current logos are PNG
  placeholders; CLAUDE.md requires SVG + an icon-only mark for favicon/app icon.)
- **Leadership**: names/photos/bios are placeholders until IHF admins supply approved ones.
- **Privacy notice**: draft for Nigerian counsel (Nigeria Data Protection Act).
  Never claim legal compliance until approved.
- **Public contact**: consultation puts *support* in-app; a public WhatsApp/phone on
  Contact is optional — confirm whether you want one shown.

## [VERIFY]
- **Skills pass mark** — CLAUDE.md says 60% [VERIFY]; not settled on the call.
- **Age bands** — CLAUDE.md 6–11 / 12–16 kept as authoritative (call loosely said
  "9–12"); confirm if different.
- Attendance / notice records rules (Phase 6) — verify with client.
- **Accent gold** exact value — currently `oklch(0.63 0.08 78)` approximating the
  Lovable gold; finalise against the planning doc's colours; check WCAG AA for text.
- **`religion` field** added to collected data (mentors/mentees) — confirm handling.

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

### Online applications — REMOVED (2026-11-23)
Owner decision: applications are **not** handled online. The whole apply-as-mentee
flow was removed — website Apply/Join CTAs, the LMS `/app/apply`, `/app/review`,
dual-consent and **IHF Letter PDF**, plus `src/lib/data/applications.ts`,
`content/programmes.ts`, `content/policy.ts`, `pdf/ihf-letter.ts`, and the
`pdf-lib` dependency. The tables `applications`, `consents`, `children`,
`guardians` (and their enums + `current_guardian_id()`/`has_child_access()`) are
dropped by migration `20261123120000_remove_applications.sql` — **apply this to
the live Supabase project** (irreversible: it deletes any rows in those tables).
This deviates from CLAUDE.md's data model (which lists those tables); flagged here
per the brief. The `app_role` enum (incl. parent_guardian, mentee) is kept.

## Invitation-only registration — hardening & setup
- **Website shows no auth** (no sign-in/sign-up links); registration is by signed,
  email-bound, expiring **invite link** (`/invite/[token]`), minted by admins at
  `/app/invitations`. Works now with no migration and no new secret (signing key
  derived from `FIELD_ENCRYPTION_KEY`).
- **First admin [ACTION]** — invite creation is admin-only, so seed the first
  admin role once in the Supabase SQL editor:
  `insert into public.user_roles (user_id, role) values ('<auth-user-uuid>', 'admin');`
- **Airtight invite-only [CONFIRM/needs service_role]** — to stop direct
  `auth.signUp` calls bypassing the UI: set `SUPABASE_SERVICE_ROLE_KEY`, disable
  "Allow new users to sign up" in Supabase Auth, and switch to
  `auth.admin.inviteUserByEmail`. (See docs/SECURITY.md "Residual risk".)
- **Email delivery** — invite links are copy-to-send today; wire **Resend** to
  email them automatically (needs Resend API key + SPF/DKIM/DMARC).
- **Role assignment** — invited users register as plain members; staff-role
  granting is a separate admin feature (needs a SECURITY DEFINER grant function
  or service_role), still to build.

## Supabase advisors
- **Performance advisors — fixed in SQL** (migration
  `20261124120000_advisor_fixes.sql`, validated: all 22 RLS tests pass against
  real Postgres): wrapped `auth.uid()`/role checks in sub-selects (Auth RLS Init
  Plan), merged the duplicate SELECT policies on `profiles`/`user_roles`
  (Multiple Permissive Policies), and indexed the unindexed FKs
  (`user_roles.granted_by`, `audit_log.actor_id`, `contact_messages.handled_by`).
  **Apply this migration to the live project** (SQL editor).
- **Security advisors — Auth DASHBOARD settings [ACTION, not SQL]:**
  - Enable **Leaked password protection** (Auth → Providers/Policies) —
    checks new passwords against HaveIBeenPwned.
  - Enable **MFA / TOTP** (Auth → Multi-Factor) — CLAUDE.md requires 2FA for
    all staff/admin roles (passkeys/TOTP, no SMS-only).
  - Review **OTP/email-link expiry** (keep ≤ 1 hour) if flagged.
- After applying, re-run the Security & Performance advisors and share anything
  that remains so it can be addressed.

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
