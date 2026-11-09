# IHF Web — Security

Living security document (CLAUDE.md requires it to be kept current). Standard:
**defence in depth, default deny, fail closed, assume every input is hostile.**
No app is "unhackable"; every rule below is enforced by tests/CI and reviewed
before launch.

Last updated: 2026-11-09 (Phase 0 — security baseline).

---

## 1. Threat model

### Assets (what we protect)
- **Child data** — names, DOB, school, health/welfare notes, guardian contacts.
  Highest sensitivity. Belongs to minors (ages 6–16).
- **Donor/finance data** — supporter identities, donation records, processor refs.
- **Staff/admin accounts** — privileged access to the above.
- **Safeguarding reports** — confidential, restricted to the safeguarding officer.
- **Integrity of published content** — no defacement, no injected script.

### Attackers (who we defend against)
- **External anonymous attacker** — scans, injection, brute force, scraping.
- **Malicious member** — a logged-in user trying to read others' records / escalate.
- **Curious insider** — staff viewing records they have no need to see.
- **Compromised dependency** — malicious or vulnerable npm package / CI supply chain.

### Primary attack surfaces
Public forms (Contact, later supporter sign-up, safeguarding report), auth
endpoints, Route Handlers / Server Actions, the database (RLS), file uploads
(later), payment webhooks (later), generated PDFs (later), the optional chatbot.

---

## 2. Controls implemented in Phase 0

| Control | Where | Enforced by |
| --- | --- | --- |
| Strict nonce CSP (`strict-dynamic`, no `unsafe-inline`/`unsafe-eval` in prod) | `src/lib/security/headers.ts`, `src/proxy.ts` | `headers.test.ts` |
| Full security header set (HSTS+preload, nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors none, COOP/CORP, X-Frame-Options) | same | `headers.test.ts` |
| `X-Powered-By` removed; React strict mode | `next.config.ts` | — |
| Server-side input validation helpers (Zod, bounded by default) | `src/lib/validation/` | `index.test.ts` |
| Rate limiter (auth + public-form presets) | `src/lib/security/rate-limit.ts` | `rate-limit.test.ts` |
| PII-scrubbing structured logger (no PII/tokens/child data in logs) | `src/lib/logging/logger.ts` | `logger.test.ts` |
| Forced-RLS guard — fails CI if any `public` table lacks ENABLE+FORCE RLS or has `USING(true)` | `scripts/check-rls.mjs` | CI `check:rls` |
| Secret scanning — pre-commit + CI | `.githooks/pre-commit`, `.gitleaks.toml`, CI | CI `gitleaks` |
| SAST | CI `semgrep` | CI |
| Dependency audit (high+ blocks) | CI `dependency-audit` | CI |
| No secrets in repo; `.env*` gitignored (template only) | `.gitignore`, `.env.example` | gitleaks |

### CSP / rendering note
A per-request nonce requires per-request rendering. Two consequences, both
deliberate and verified at runtime (scripts carry the request's nonce, matching
the CSP):
- Next's `cacheComponents`/`partialPrefetching` are **off** (`next.config.ts`).
- The root layout reads `headers()`, opting all routes into dynamic rendering so
  Next applies the nonce to its `<script>` tags; a statically prerendered page
  would otherwise ship no-nonce scripts the CSP blocks.
Reintroducing static caching for truly-public pages (while keeping strict CSP)
is a tracked follow-up (docs/OPEN_ITEMS.md).

### Dependency-audit policy
`npm audit --audit-level=high` **blocks** merges. A separate non-blocking full
audit surfaces moderate/low advisories for tracking. Current known moderates:
the `typescript-eslint` chain pulled in transitively by `eslint-config-next`
(dev-only tooling, not shipped to users). Tracked; revisit on upstream release.

---

## 3. Dependencies (justification)
Runtime deps are kept minimal and pinned (exact versions + committed lockfile).

| Package | Why |
| --- | --- |
| `next`, `react`, `react-dom` | Framework (mandated by CLAUDE.md). |
| `zod` | Server-side input validation (mandated). |
| `vitest` (dev) | Test runner (mandated). |
| `tailwindcss`, `eslint`, `typescript`, `@types/*` (dev) | Build/lint/types. |

No packages with unreviewed install scripts are added knowingly; `curl | bash`
is never used. New deps are justified here as phases add them.

## 4. SECURITY DEFINER functions
None yet. Every such function must set `search_path` explicitly, validate the
caller's role, and be listed here when added (Phase 1+).

## 5. Known risks / follow-ups
- Rate limiter is in-memory (per instance). Must be backed by a shared store
  (e.g. Upstash/Redis) before production multi-instance deploy. — OPEN_ITEMS.
- `ignore-scripts` is **not** globally enabled (would break the toolchain);
  supply-chain risk mitigated via pinned lockfile + audit + gitleaks + review.
- Field-level encryption of sensitive child data: designed/implemented in the
  phase that introduces `children`/`welfare` tables (Phase 3), keys held outside
  the DB.
- Backups / PITR and a documented restore test: to be added before launch.
- Incident response plan (who is called, key rotation, family notification):
  to be written before launch.

## 6. Pre-launch
Run the adversarial final security review in `PROMPTS.md` before any launch.
Do not mark it complete while any critical or high issue remains.
