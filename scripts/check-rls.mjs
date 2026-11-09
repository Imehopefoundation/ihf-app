#!/usr/bin/env node
/**
 * Forced-RLS guard.
 *
 * CLAUDE.md: "RLS enabled AND forced on every table, with no permissive 'true'
 * policies. A new table without RLS must fail CI."
 *
 * Scans supabase/migrations/*.sql across the whole migration history and fails
 * if any table created in the `public` schema is not, somewhere in the history:
 *   - ALTER TABLE ... ENABLE ROW LEVEL SECURITY, and
 *   - ALTER TABLE ... FORCE ROW LEVEL SECURITY.
 * It also flags obviously permissive `USING (true)` / `WITH CHECK (true)` policies.
 *
 * This is a static lint, not a substitute for the RLS tests in CI.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = "supabase/migrations";

if (!existsSync(MIGRATIONS_DIR)) {
  console.log(`check-rls: no ${MIGRATIONS_DIR} directory yet — nothing to check.`);
  process.exit(0);
}

const files = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort();

let sql = "";
for (const f of files) {
  sql += "\n" + readFileSync(join(MIGRATIONS_DIR, f), "utf8");
}

// Strip line and block comments so commented-out SQL is ignored.
const clean = sql
  .replace(/--[^\n]*/g, "")
  .replace(/\/\*[\s\S]*?\*\//g, "");

function normaliseTable(raw) {
  // drop quotes, optional schema prefix, lowercase
  let t = raw.replace(/"/g, "").trim().toLowerCase();
  if (t.startsWith("public.")) t = t.slice("public.".length);
  return t;
}

const created = new Set();
const createRe =
  /create\s+table\s+(?:if\s+not\s+exists\s+)?([a-zA-Z0-9_".]+)/gi;
for (const m of clean.matchAll(createRe)) {
  const t = normaliseTable(m[1]);
  // ignore non-public schemas (auth., storage., etc.) we do not own
  if (!m[1].includes(".") || m[1].toLowerCase().startsWith("public.")) {
    created.add(t);
  }
}

const enabled = new Set();
const forced = new Set();
const enableRe =
  /alter\s+table\s+(?:only\s+)?([a-zA-Z0-9_".]+)\s+enable\s+row\s+level\s+security/gi;
const forceRe =
  /alter\s+table\s+(?:only\s+)?([a-zA-Z0-9_".]+)\s+force\s+row\s+level\s+security/gi;
for (const m of clean.matchAll(enableRe)) enabled.add(normaliseTable(m[1]));
for (const m of clean.matchAll(forceRe)) forced.add(normaliseTable(m[1]));

const problems = [];
for (const t of created) {
  if (!enabled.has(t)) problems.push(`table "${t}" never has ENABLE ROW LEVEL SECURITY`);
  if (!forced.has(t)) problems.push(`table "${t}" never has FORCE ROW LEVEL SECURITY`);
}

// Permissive policy smell test.
const permissiveRe = /(using|with\s+check)\s*\(\s*true\s*\)/gi;
if (permissiveRe.test(clean)) {
  problems.push(`found a permissive policy clause ("USING (true)" / "WITH CHECK (true)")`);
}

if (problems.length) {
  console.error("check-rls: FAILED");
  for (const p of problems) console.error("  - " + p);
  console.error(
    `\nEvery public table must enable AND force RLS, with no "USING (true)" policies.`,
  );
  process.exit(1);
}

console.log(
  `check-rls: OK — ${created.size} table(s) checked, all have RLS enabled and forced.`,
);
process.exit(0);
