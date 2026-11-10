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

function testUrl(dbName) {
  const u = new URL(ADMIN_URL);
  u.pathname = "/" + dbName;
  return u.toString();
}

/**
 * Drop & recreate a fresh test DB, then apply the auth stub and every migration.
 * Each test file passes a unique dbName so files can run in parallel.
 */
export async function setupDatabase(dbName = process.env.TEST_DB_NAME ?? "ihf_rls_test") {
  if (!/^[a-z_][a-z0-9_]*$/.test(dbName)) throw new Error("invalid test db name");
  const admin = new Client({ connectionString: ADMIN_URL });
  await admin.connect();
  await admin.query(`drop database if exists ${dbName} with (force)`);
  await admin.query(`create database ${dbName}`);
  await admin.end();

  const url = testUrl(dbName);
  const db = new Client({ connectionString: url });
  await db.connect();
  // Expose the connection string so asUser can open isolated connections
  // (the test runner may interleave tests; a shared connection + transactions
  // would collide).
  db._testUrl = url;

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
  if (!/^[a-z_]+$/.test(role)) throw new Error("invalid role");
  const claims = JSON.stringify({ sub: ctx.sub ?? null, role });

  // Own connection per call, so concurrently-scheduled tests never share a
  // transaction or RLS context.
  const conn = new Client({ connectionString: db._testUrl });
  await conn.connect();
  try {
    await conn.query("begin");
    await conn.query(`set local role ${role}`);
    await conn.query("select set_config('request.jwt.claims', $1, true)", [claims]);
    const result = await fn(conn);
    await conn.query("rollback");
    return result;
  } finally {
    await conn.end();
  }
}

/** Seed helper run as the superuser (bypasses RLS). */
export async function seed(db, sql, params) {
  return db.query(sql, params);
}
