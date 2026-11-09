// RLS test harness: build a fresh test database, apply the local Supabase stub
// + all migrations, and provide an `asUser` helper that runs a query with the
// RLS context of a given user/role (the technique Supabase itself documents).
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Admin connection string (superuser). Defaults to the local dev cluster.
const ADMIN_URL =
  process.env.DATABASE_ADMIN_URL ??
  "postgres://postgres@127.0.0.1:54329/postgres";
const TEST_DB = process.env.TEST_DB_NAME ?? "ihf_rls_test";

function testUrl() {
  const u = new URL(ADMIN_URL);
  u.pathname = "/" + TEST_DB;
  return u.toString();
}

/** Drop & recreate the test DB, then apply the auth stub and every migration. */
export async function setupDatabase() {
  const admin = new Client({ connectionString: ADMIN_URL });
  await admin.connect();
  await admin.query(`drop database if exists ${TEST_DB} with (force)`);
  await admin.query(`create database ${TEST_DB}`);
  await admin.end();

  const db = new Client({ connectionString: testUrl() });
  await db.connect();

  // 1. Supabase auth stub (test-only).
  const stub = readFileSync(
    join(ROOT, "supabase", "tests", "setup", "local_supabase.sql"),
    "utf8",
  );
  await db.query(stub);

  // 2. Migrations, in filename order.
  const migDir = join(ROOT, "supabase", "migrations");
  const files = readdirSync(migDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const f of files) {
    await db.query(readFileSync(join(migDir, f), "utf8"));
  }
  return db;
}

/**
 * Run `fn(client)` inside a transaction with the RLS context of a user.
 * Always rolls back, so tests are isolated and order-independent.
 *
 * @param {pg.Client} db
 * @param {{ sub?: string|null, role?: string }} ctx
 * @param {(c: pg.Client) => Promise<any>} fn
 */
export async function asUser(db, ctx, fn) {
  const role = ctx.role ?? "authenticated";
  const claims = JSON.stringify({
    sub: ctx.sub ?? null,
    role,
  });
  await db.query("begin");
  try {
    await db.query(`set local role ${role}`);
    // set_config(local=true) is scoped to this transaction.
    await db.query("select set_config('request.jwt.claims', $1, true)", [claims]);
    return await fn(db);
  } finally {
    await db.query("rollback");
  }
}

/** Seed helper run as the superuser (bypasses RLS). */
export async function seed(db, sql, params) {
  return db.query(sql, params);
}
