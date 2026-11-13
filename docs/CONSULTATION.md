# Consultation requirements (client call, 12 Nov 2026)

Distilled requirements from the founder consultation, reconciled with `CLAUDE.md`.
The raw transcript is **not** stored here (it contains personal and financial
detail). Where this extends or changes the brief, it's marked.

## Vision (confirms CLAUDE.md)
- Faith-rooted (Christ at the foundation), raising people through **mindset +
  technical + financial** formation so they succeed and then raise others —
  breaking the poverty mindset across Africa. Christ is the origin, but purpose
  is to *do* something: show Christ in excellence, character, prosperity,
  influence and love.
- **Africa, Nigeria first** (regions where the founder has trusted relationships,
  as a proving ground), then expand.
- Members are people in the "lower gap" — without access to good information or
  schooling. Care as dignity, never charity.
- **Three brand words: Christ · Excellence · Impact.** Excellence is paramount —
  the founder's single biggest fear is work that is high-quality but doesn't
  *look* excellent enough to convey its quality. Design quality is a first-class
  requirement, not a finish.

## The product is an LMS (extends CLAUDE.md "web app")
A learning platform with **portals per party** (mentee, mentor, staff, admin).
People register → once approved they get a dashboard/portal → receive course
material and email updates. Lots of information shared between parties; that's
why it's an app, not a brochure site. **No mentor–mentee messaging** (confirms).

### Course & learning (extends Skills-tracking / Phase 6)
- **One flagship course, delivered monthly and sequentially** (not many courses).
  Each month is a module. Month 1 is heavy: spirituality + wholeness + financials.
- Each module contains: a **reading list**, **video lectures**, and **notes**.
- Assessment = **impromptu / randomly-timed tests** (e.g. end of month 1, then
  unpredictably after). Purpose: force learners to relearn and solidify concepts.
- **Uploaded videos are reviewed by QA staff before release** (mentor and mentee
  uploads). [confirms QA role]

### Mentee dashboard (new, specific)
- **No grades on the dashboard.**
- Shows rotating **encouragement**: KJV scriptures, motivational quotes, stories
  of people who rose "from nothing", imagery of people doing good work. (e.g. the
  Job 14:9 "scent of water" verse already on the site.) Plus access to the
  current module and schedule.

### Support (new)
- In-app support (not email), so a support/staff team handles it on login —
  minimal founder oversight.

## Roles & access (confirms + refines CLAUDE.md roles)
- Logins: **mentee, mentor, staff, admin** (admin sees every angle).
- **Staff have restrictions** — some staff review uploaded videos (QA) without
  broad access to mentor/mentee content. Role-scoped access, enforced by RLS.
- **Login is on the site but not on the homepage** — its own section/banner.

## Donations (extends CLAUDE.md; one stack addition needs approval)
- **No app access for donors.** Donations are private by default (no donor wall,
  no public amounts) — confirms CLAUDE.md.
- **Multiple payment options must be offered** (owner instruction, 13 Nov 2026) —
  the donate flow presents a **method selector**, not a single processor:
  - **Paystack** — Naira (cards, bank, USSD).
  - **PayPal** — USD / GBP for diaspora donors. (Approved stack addition vs the
    brief's Paystack/Flutterwave.)
  - **Direct bank transfer** — account details shown, good for anonymous / large gifts.
  - Built to be **extensible** so more methods (e.g. Flutterwave) can be added.
  Each option ends in the same private thank-you page + receipt.
- **No recurring debit** (explicitly rejected). Donor nurture is via **newsletter
  reminders**, not auto-charge.
- **Anonymous giving allowed**; name/email/registration **optional**.
- After payment: **redirect back to a thank-you page with a receipt**; if an email
  was given, also a thank-you email. Opt-in newsletter box at donate/registration.
- **Internal (private) donor recognition**: track each donor's total for the
  founder's own appreciation; **tiered yearly gifts** for donors over a threshold;
  a **yearly newsletter** with an **external audit** result for accountability.
  All private — never a public donor wall or public amounts (stays within
  CLAUDE.md's "no public acknowledgement").
- Currencies: Naira primary; USD/GBP supported. [resolves OPEN_ITEMS currency]

## Supporters / newsletter (confirms)
- First supporters: church and friends; then social media to reach donors.
- Explicit opt-in newsletter; one-click unsubscribe; private list. Newsletter is
  also how donors are shown where their money went (impact + audit).

## Data collected (refines CLAUDE.md)
- Mentors: name, age, certificates, phone, address, parental details, **religion**.
- Mentees: name, age, **parent details** (required for the younger group);
  **guardian** details where applicable (not compulsory for all).
- **Religion is a collected field** (new). Consent from **parent AND guardian**
  (confirms). All sensitive fields field-level encrypted (CLAUDE.md).

## Impact & trust (refines CLAUDE.md Impact)
- Don't over-"prove"; let excellence speak. But publish **one external-audit
  result** on the Impact page, and showcase **selected, consented** mentors/
  mentees' stories and photos under Impact. **No fabricated numbers** — none exist
  yet. [resolves OPEN_ITEMS aggregate-total: show audit-verified results + consented stories only]

## Content, phasing, ownership
- **No photos/videos/stories/impact numbers yet** — content creation is the next
  stage; go public only once there's quality content. Build structure first.
- **Phased build** (confirms PROMPTS.md). Modest budget; scope each phase tightly.
- **Founder** has final say and is the main contact; the dev team maintains the
  app after launch.

## Deltas vs CLAUDE.md — summary
- **Needs your approval:** add **PayPal** (USD/GBP) alongside Paystack.
- **Extends (no conflict):** LMS course model (monthly modules, reading lists,
  video lectures, notes, impromptu tests, QA video review); mentee motivational
  dashboard (no grades); donor thank-you-page+receipt flow with optional/anonymous
  details; private donor tiering + yearly external audit; `religion` field;
  in-app support; brand words Christ/Excellence/Impact; excellence as a hard goal.
- **Still open:** pass mark for tests (CLAUDE.md says 60% [VERIFY]; not settled on
  the call); exact age bands (CLAUDE.md 6–11 / 12–16 is authoritative; the call
  loosely said "9–12" — keeping the brief unless you say otherwise); planning doc
  with **logo + colours** (founder to send).
