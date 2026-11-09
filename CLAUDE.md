# IHF Web App: Project Brief

IME HOPE FOUNDATION (IHF) is a faith-based charity for AFRICA. This is a WEB APP (not a brochure site): a mobile-first installable PWA with a thin public layer and role-based dashboards. It holds children's data, so the privacy, safeguarding and security rules below are hard requirements.

## Stack
Next.js (TypeScript, App Router), Supabase (Postgres, Auth, Storage, RLS), Tailwind, Zod, Vitest, Paystack/Flutterwave for payments (Stripe only if needed), Resend for email, server-side PDF generation. Change only with a stated reason and my approval.

## Never invent
No fabricated facts, statistics, testimonials, names or donor information. Use clearly marked placeholders. Mark unknowns [CONFIRM] or [VERIFY] in code comments AND in docs/OPEN_ITEMS.md.

## Organisation
- Vision: a God-centred charity empowering the less privileged through Christian-based knowledge, skills and support, creating a multiplying cycle of transformation that breaks the chains of mental and financial poverty across Africa.
- Mission: to raise empowered individuals who in turn raise others, through faith-rooted mentorship, skills development, education and welfare support.
- Core message: "What you receive, you pass on."
- Approach (organising framework, shown as three connected parts): Financial competence, Faith, Technical competence.
- Values (KJV only): Kingdom-mindedness (Matthew 6:33), Diligence (Proverbs 13:4), Integrity (Proverbs 11:3), Respect & Honour (Romans 12:10), Accountability (Luke 16:10).
- Africa is the priority in all copy, imagery and features.
- Tone: dignified, warm, plain English. People are "members", never "beneficiaries". Care is given as dignity, not charity. No pity-based copy.
- Use the name "IME HOPE FOUNDATION" (never "Foundations").

## Programmes
1. Skills Development (flagship): masterclasses in AI, Fashion Design and Content Production. NEVER write "vocational", "tailoring", "carpentry" or "agriculture". IHF covers tools, materials, data and transport for active mentees.
2. Education & Scholarships.
3. Welfare & Support. Never write "discretion". Never name recipients or describe individual cases publicly.
Age groups: 6-11 and 12-16. Matching and waitlists are separate per group.
Each programme page has a mentor block: photo, name, skill area, short bio.

## Roles (enforce with Postgres RLS, never UI-only)
visitor, supporter, parent_guardian, mentee (12-16 only, supervised), mentor, volunteer, programme_lead (Skills, Education, Welfare), quality_assurance, finance, communications, safeguarding_officer, admin.

## Product rules
- 6-11: the parent/guardian does everything; no child login. 12-16: parent consent plus a limited, supervised teen account.
- Consent from the biological AND spiritual parent/guardian, stored with timestamp and policy version.
- NO "Kingdom Purpose Assessment". Applicants are "paired with the right mentor" and notified by email and in-app when a slot opens with that mentor.
- Application statuses: submitted, under review, vetted, paired, waitlisted, accepted, declined.
- Applications generate a downloadable PDF "IHF Letter" addressed to the public school and the parent. Staff can regenerate it.
- Mentors: invitation-only, with profiling, vetting and reference checks. They e-sign the Mentor Vows and Mentor Mentorship Agreement (versioned). Public listing requires BOTH a written-consent flag and a publish flag, set by staff. Never show mentor contact details; all contact goes via IHF. Mentors are paired only within the age range they are vetted for.
- No private mentor-mentee messaging in v1 (the policy bans unsupervised private sessions).
- Skills tracking: sessions (record that devotion and code-of-conduct reading occurred), monthly project-based assessments designed by the mentor with a scoring standard and reviewed by QA before release, post-assessment survey, Impact Journal, attendance records. Pass mark 60% [VERIFY].
- Donations: private by default. No donor wall, ticker, leaderboard, public amounts or peer-to-peer fundraising pages. Do not publicly acknowledge any donation (Matthew 6:3). Thank-you emails never state the amount. Store processor references only, never card data. Aggregate total shown only if the client approves [CONFIRM].
- Safeguarding reports route ONLY to the safeguarding_officer role. Every staff view of a child record is written to audit_log.
- Supporter emails: explicit opt-in, one-click unsubscribe, privacy notice, private list.
- Policy: versioned Organisational Policy & Code of Conduct; active members must re-acknowledge after each amendment.
- All public communication passes a Communications approval workflow.
- Privacy notice is a DRAFT for counsel (Nigeria Data Protection Act). Never claim legal compliance.

## Brand (follow strictly)
- Logos: ONLY the SVGs in public/brand/ (logo-black.svg, logo-white.svg, icon-black.svg, icon-white.svg). Never redraw, recolor, stretch, shadow, stroke, make translucent or alter. Black logo on white/light backgrounds; white logo on dark and colored backgrounds (including brand colors). Outline icon for patterns only. App icon/favicon: the icon in a black rounded square. Tab title "IHF".
- Colors: Full White #FFFFFF, Taupe Gray #878787, Jet #343434, Rich Black #000000. Taupe Gray fails contrast at body size (about 3.6:1), so use it only for large text, dividers and decoration. Body text is Jet on white.
- Accent for primary actions only: bronze, approximately #8B6B3E [CONFIRM exact value; verify WCAG AA 4.5:1 before use].
- Font: Galano Grotesque if licensed, otherwise Figtree [CONFIRM]. Uppercase headings with generous letter-spacing; light body weight, 16px minimum.
- Imagery: real African youth and community photography with documented consent only. No stock photos of identifiable children. Neutral placeholders until assets arrive.
- Style: clean, modern, youthful, monochrome with one accent. Dashboards calm and dense: clear tables, status chips, empty states, plain-language labels.
- Keep all design tokens in one place (Tailwind config or CSS variables).

## Quality bar
- WCAG 2.2 AA: keyboard navigation, visible focus, semantic HTML, labelled forms with clear errors, reduced-motion support.
- Mobile-first, installable PWA, offline-tolerant forms where feasible, Lighthouse performance 90+, lazy-loaded optimised images, minimal JavaScript, works on slow 3G.
- Privacy-friendly analytics only.

---

## SECURITY CONSTRAINTS (non-negotiable; never weaken without my written approval)

No app is "unhackable". The standard here is defence in depth, with every rule enforced by tests and independently reviewed before launch.

### Principles
- Default deny. Least privilege. Defence in depth. Fail closed. Assume every input is hostile.
- Security rules outrank feature requests, deadlines and convenience. If a feature cannot be built securely, stop and tell me.

### Database and access control
- RLS enabled AND forced on every table, with no permissive "true" policies. A new table without RLS must fail CI.
- The Supabase service_role key is server-only: never in client bundles, never in NEXT_PUBLIC_ vars, never logged. Prefer user-scoped clients; use service_role only in a small, reviewed server module.
- SECURITY DEFINER functions must set search_path explicitly, validate the caller's role, and be listed in docs/SECURITY.md.
- audit_log is append-only: revoke UPDATE/DELETE from every role, including app roles.
- Sensitive child data (names, DOB, school, health or welfare notes, guardian contacts) uses field-level encryption with keys held outside the database. Never store plaintext copies.
- Prevent IDOR: every query is scoped by the authenticated user or role. UUIDs are not authorisation.
- Write RLS tests for every table and role: allowed reads pass; cross-user and cross-role reads fail. CI blocks merges if they fail.

### Authentication and sessions
- Managed auth only. No custom password handling or homemade tokens.
- Mandatory 2FA for every staff and admin role (passkeys/WebAuthn preferred, TOTP accepted, no SMS-only).
- Cookies: HttpOnly, Secure, SameSite Lax or Strict. Short session lifetimes, idle timeout, rotation on privilege change.
- Re-authentication for sensitive actions: data export, role changes, deletions, viewing safeguarding cases.
- Rate limit and lock out login, reset, invite and OTP endpoints. Generic error messages (no user enumeration).
- No shared accounts. Invitations are single-use and expiring.

### Input, output and web security
- Validate every input server-side with Zod: types, lengths, enums, file metadata. Never trust client validation.
- Parameterised queries only. No string-built SQL.
- Escape output by default. No dangerouslySetInnerHTML except on sanitised, allow-listed content.
- Security headers on every response: strict CSP with nonces (no unsafe-inline or unsafe-eval), HSTS with preload, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy denying camera, microphone and geolocation by default, frame-ancestors 'none', COOP/CORP.
- CSRF protection on all state-changing requests; check Origin on API routes.
- Bot and abuse protection on public forms (privacy-friendly, e.g. Cloudflare Turnstile) plus per-IP and per-account rate limits.
- Prevent SSRF: no server fetches of user-supplied URLs. No open redirects: allow-list redirect targets.
- Generated PDFs (IHF Letter): escape and length-limit all inserted data; no HTML-to-PDF with unsanitised input.

### Files and uploads
- Private buckets only. Access via short-lived signed URLs (max 5 minutes) after an authorisation check.
- Allow-list file types, enforce size limits, verify magic bytes, rename to random ids, scan for malware before making available.
- Strip EXIF and location metadata from every uploaded image. Mandatory for any photo of a child.
- Never serve user uploads from the app's own origin.

### Payments and webhooks
- Verify webhook signatures, reject replays, make handlers idempotent, and confirm every transaction server-side with the processor before marking it paid.
- Never trust amounts or currencies sent by the client. Never store card data.

### Email
- Configure SPF, DKIM and DMARC (p=reject once verified). Sanitise anything placed in headers or subjects.
- No sensitive data in email bodies; use links that require login.

### Secrets and supply chain
- No secrets in the repo, client code, logs or error messages. .env* is gitignored. gitleaks as a pre-commit hook and in CI.
- Commit the lockfile, pin versions, run npm audit and Dependabot, and justify every new dependency in docs/SECURITY.md. No unmaintained or obscure packages for auth, crypto or parsing.
- Never use packages with unreviewed install scripts. Never curl | bash.
- CI runs lint, typecheck, tests, gitleaks, Semgrep and dependency audit. Merges blocked on failure.

### Logging, monitoring and privacy
- Structured logs with NO PII, tokens or child data. Error pages never expose stack traces.
- Log auth events, role changes, exports, failed access attempts and every staff view of a child's record. Alert on anomalies.
- No third-party trackers, session replay or ad pixels anywhere.
- Data minimisation, with retention periods defined per table and a tested deletion process.

### Resilience
- Encrypted backups with point-in-time recovery, and a documented restore test in docs/SECURITY.md.
- Document an incident response plan: who is called, how keys are rotated, how affected families are notified.

### Chatbot (if built, last)
- Treat all user messages as untrusted (prompt injection). Read-only access to approved public content only: no database access, no write tools, no access to user records.
- Never collects personal data from minors, never counsels, hands off safeguarding, crisis and welfare topics to a human.

### How YOU (Claude Code) must behave
- Use a development Supabase project only. Never ask for or use production credentials.
- Never read, print or commit .env files or keys. Never run destructive commands (rm -rf, dropping databases, force pushes) without my explicit approval.
- Never disable a check, lint rule, RLS policy or test to make something pass. Fix the cause.
- When you find a security weakness, even outside the current task, stop and report it in docs/SECURITY.md.
- Keep docs/SECURITY.md updated: threat model, SECURITY DEFINER functions, dependencies, known risks.

---

## Data model (outline; refine as needed)
profiles, roles, guardians, children, applications, consents, mentors, mentor_agreements, pairings, slots, waitlist, sessions, assessments, submissions, surveys, impact_journals, scholarships, welfare_requests, safeguarding_reports, supporters, donations, newsletters, policy_versions, policy_acknowledgements, notifications, audit_log.

## Working method
- Build ONE phase at a time (see PROMPTS.md). Before coding a phase, state a short plan. After it, run lint, typecheck and tests, then summarise what changed and what remains.
- Migrations live in supabase/migrations. Never edit an applied migration; add a new one.
- Keep docs/OPEN_ITEMS.md updated with every [CONFIRM]/[VERIFY].
- Ask me before: adding a paid service, changing the stack, or weakening any rule above.
