# IHF Web

Web app for **IME HOPE FOUNDATION (IHF)** — a mobile-first, installable PWA with
a thin public layer and role-based dashboards. It holds children's data, so the
privacy, safeguarding and security rules in [`CLAUDE.md`](./CLAUDE.md) are hard
requirements. Build order is defined in [`PROMPTS.md`](./PROMPTS.md).

> Status: **Phase 0 — security baseline** complete. Public pages and the app are
> built in later phases.

## Stack
Next.js 16 (TypeScript, App Router) · Tailwind CSS v4 · Zod · Vitest.
Supabase (Auth/Postgres/Storage/RLS), Paystack/Flutterwave, and Resend are
introduced in later phases.

## Getting started
```bash
npm ci
cp .env.example .env.local   # fill in once Supabase etc. are set up (never commit)
npm run dev                  # http://localhost:3000
```

## Scripts
| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` / `npm run test:run` | Vitest (watch / once) |
| `npm run check:rls` | Fail if any DB table lacks forced RLS |
| `npm run verify` | lint + typecheck + tests + RLS check |

A `prepare` script points git at `.githooks/` so the pre-commit secret scan runs
locally (install [gitleaks](https://github.com/gitleaks/gitleaks) to enable it).

## Security
See [`docs/SECURITY.md`](./docs/SECURITY.md) for the threat model and controls,
and [`docs/OPEN_ITEMS.md`](./docs/OPEN_ITEMS.md) for open questions and the one
approved deviation from the brief (visual brand follows the Lovable design).

## Environment variables
See [`.env.example`](./.env.example). Only `NEXT_PUBLIC_*` values reach the
browser. The Supabase **service_role** key is server-only — never `NEXT_PUBLIC_`,
never logged. Use a **development** Supabase project in development.
