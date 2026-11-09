# IHF: Claude Code Phase Prompts

Run ONE phase per session. Use plan mode (Shift+Tab) so you approve the plan before code is written. Commit after every phase. Run `/clear` between phases: CLAUDE.md carries the rules.

---

## Phase 0: Security baseline (run first)

```
Phase 0 (security baseline). Read CLAUDE.md fully. Before any feature work:
1. Set up CI with lint, typecheck, tests, gitleaks, Semgrep and dependency audit, plus a pre-commit gitleaks hook.
2. Implement security headers and a nonce-based CSP in middleware, with tests that assert every header.
3. Add a CI check that fails if any table lacks RLS enabled and forced.
4. Create docs/SECURITY.md with an initial threat model (assets: child data, donor data, staff accounts; attackers: external, malicious member, curious insider, compromised dependency).
5. Set up Zod validation helpers, a rate limiter, and a structured logger that scrubs PII.
Plan first, then build. Stop and summarise.
```

## Phase 1: Foundation

```
Read CLAUDE.md fully. Do Phase 1 only:
1. Scaffold Next.js + TypeScript + Supabase with Tailwind, ESLint and Vitest.
2. Build the design system: tokens from the Brand section, base components (Button, Input, Select, Checkbox, Card, StatusChip, Table, Dialog, Toast), a Logo component that picks the black or white SVG by background, and a mobile-first app shell. Use only the SVGs in public/brand/.
3. Set up Supabase Auth with email verification, password reset, and invitation-only flows for mentors and staff. 2FA required for staff and admin.
4. First migration: profiles, roles, audit_log (append-only), with RLS on every table and a helper that logs record views.
5. Write tests proving cross-user and cross-role reads are blocked.
6. Create README.md (setup, env vars) and keep docs/OPEN_ITEMS.md current.
Show your plan first, then proceed. Stop after Phase 1 and summarise.
```

## Phase 2: Public layer

```
Phase 2: public layer. Landing (Africa-first hero, the three-part approach Financial / Faith / Technical, "What you receive, you pass on", programme previews, calls to action), About (vision, mission, five values with KJV scripture, leadership), Programmes (Skills Development: AI, Fashion Design, Content Production masterclasses; Education & Scholarships; Welfare & Support) each with a mentor block, Mentor directory (empty state until consented and published mentors exist), Give (private by default, no donor wall), Supporter sign-up (explicit opt-in, one-click unsubscribe), Safeguarding & Policies, Contact (with WhatsApp). Follow CLAUDE.md. Plan first.
```

## Phase 3: Applications

```
Phase 3: parent/guardian registration, add child, age-group choice (6-11 or 12-16), dual consent (biological AND spiritual parent/guardian) with timestamp and policy version, application statuses, "paired with the right mentor" flow (no Kingdom Purpose Assessment), and the downloadable IHF Letter PDF addressed to the public school and parent. Encrypt sensitive child fields. Plan first, then build with tests.
```

## Phase 4: Mentors

```
Phase 4: invitation-only mentor onboarding, profiling / vetting / reference-check statuses, e-signed Mentor Vows and Mentor Mentorship Agreement (versioned), profiles (photo, bio, skill area) with consent flag AND publish flag set by staff, public directory showing no contact details. Mentors vetted per age range. Strip EXIF from photos.
```

## Phase 5: Pairing and waitlist

```
Phase 5: slots per mentor per age group, programme-lead pairing approval, waitlist with automatic email and in-app notification when a slot opens with that mentor. Separate per age group.
```

## Phase 6: Skills Development tracking

```
Phase 6: sessions (record devotion and code-of-conduct reading), monthly project-based assessments designed by the mentor with a scoring standard and QA review before release, submissions and scoring (pass mark 60% [VERIFY]), post-assessment survey, Impact Journal, attendance and notice records [VERIFY rules with client].
```

## Phase 7: Safeguarding

```
Phase 7: confidential safeguarding report form (public and logged-in) routing ONLY to the safeguarding_officer role, case status tracking, restricted access with re-authentication, full audit trail. No private mentor-mentee messaging.
```

## Phase 8: Donations and finance

```
Phase 8: private-by-default donations via Paystack/Flutterwave (Stripe only if needed), verified webhooks, idempotent handlers, server-side confirmation, processor references only. Thank-you email without the amount. Finance dashboard: donations, expenditure approvals, mentor payment records, mentee allowances. Currencies and one-time vs recurring: [CONFIRM].
```

## Phase 9: Policy versioning

```
Phase 9: versioned Organisational Policy & Code of Conduct, re-acknowledgement required from active members after each amendment, tracking of who has and has not acknowledged.
```

## Phase 10: Communications

```
Phase 10: supporter newsletter drafts with an approval workflow (nothing public without Communications approval), transactional emails, SPF/DKIM/DMARC checklist.
```

## Phase 11: Education and Welfare

```
Phase 11: scholarships (applications, term progress reports, withdrawal records) and welfare requests and referrals. Highly restricted; recipients never named publicly.
```

## Phase 12: Chatbot (optional), then hardening

```
Phase 12: chatbot answering ONLY from approved public content, no database or write access, never collects minors' data, never counsels, escalates safeguarding, crisis and welfare topics to a human. Then run an accessibility pass (WCAG 2.2 AA) and a Lighthouse pass on slow 3G.
```

---

## Final security review (run before launch)

```
Final security review. Act as an adversarial reviewer, not the author. Audit the whole codebase against CLAUDE.md, the OWASP Top 10 and ASVS. Specifically try to: read another user's child record, escalate a role, bypass RLS via a SECURITY DEFINER function, access a private file without a signed URL, forge a payment webhook, inject script via any stored field or PDF, enumerate users, brute-force login, and abuse the chatbot. For each finding give severity, proof and a fix. Fix critical and high issues, add regression tests, and report anything left open. Do not mark the review complete if any critical or high issue remains.
```
