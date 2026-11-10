import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { setupDatabase, asUser, seed } from "./helpers.mjs";

const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";
const ADMIN = "33333333-3333-3333-3333-333333333333";

let db;

before(async () => {
  db = await setupDatabase("ihf_rls_foundation");
  // Seed as superuser (bypasses RLS).
  await seed(
    db,
    `insert into auth.users (id, email) values
      ($1,'a@example.com'),($2,'b@example.com'),($3,'admin@example.com')`,
    [A, B, ADMIN],
  );
  await seed(db, `insert into public.profiles (id) values ($1),($2),($3)`, [A, B, ADMIN]);
  await seed(
    db,
    `insert into public.user_roles (user_id, role) values ($1,'admin')`,
    [ADMIN],
  );
});

after(async () => {
  if (db) await db.end();
});

describe("profiles RLS", () => {
  test("a user can read their own profile", async () => {
    const r = await asUser(db, { sub: A }, (c) =>
      c.query("select id from public.profiles where id = $1", [A]),
    );
    assert.equal(r.rowCount, 1);
  });

  test("a user cannot read another user's profile (IDOR blocked)", async () => {
    const r = await asUser(db, { sub: A }, (c) =>
      c.query("select id from public.profiles where id = $1", [B]),
    );
    assert.equal(r.rowCount, 0);
  });

  test("an unfiltered select returns only the caller's own row", async () => {
    const r = await asUser(db, { sub: A }, (c) => c.query("select id from public.profiles"));
    assert.equal(r.rowCount, 1);
    assert.equal(r.rows[0].id, A);
  });

  test("an admin can read all profiles", async () => {
    const r = await asUser(db, { sub: ADMIN }, (c) => c.query("select id from public.profiles"));
    assert.equal(r.rowCount, 3);
  });

  test("the anon role sees no profiles", async () => {
    const r = await asUser(db, { sub: null, role: "anon" }, (c) =>
      c.query("select id from public.profiles"),
    );
    assert.equal(r.rowCount, 0);
  });
});

describe("user_roles RLS", () => {
  test("a user sees only their own roles, never another's", async () => {
    const r = await asUser(db, { sub: A }, (c) => c.query("select role from public.user_roles"));
    assert.equal(r.rowCount, 0); // A has no roles and cannot see ADMIN's
  });

  test("a non-admin cannot grant themselves a role", async () => {
    await assert.rejects(
      () =>
        asUser(db, { sub: A }, (c) =>
          c.query("insert into public.user_roles (user_id, role) values ($1,'admin')", [A]),
        ),
      /row-level security|violates row-level/i,
    );
  });

  test("an admin can grant a role", async () => {
    const r = await asUser(db, { sub: ADMIN }, (c) =>
      c.query(
        "insert into public.user_roles (user_id, role) values ($1,'mentor') returning id",
        [B],
      ),
    );
    assert.equal(r.rowCount, 1);
  });
});

describe("audit_log is append-only and admin-read-only", () => {
  test("a non-admin cannot read the audit log", async () => {
    const r = await asUser(db, { sub: A }, (c) => c.query("select * from public.audit_log"));
    assert.equal(r.rowCount, 0);
  });

  test("no app role may UPDATE the audit log", async () => {
    await assert.rejects(
      () =>
        asUser(db, { sub: ADMIN }, (c) =>
          c.query("update public.audit_log set action = 'tamper'"),
        ),
      /permission denied/i,
    );
  });

  test("no app role may DELETE from the audit log", async () => {
    await assert.rejects(
      () => asUser(db, { sub: ADMIN }, (c) => c.query("delete from public.audit_log")),
      /permission denied/i,
    );
  });

  test("log_record_view records the caller as actor; admins can read it", async () => {
    await db.query("begin");
    try {
      await db.query("set local role authenticated");
      // Act as A: log a view of B's profile row.
      await db.query("select set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: A, role: "authenticated" }),
      ]);
      await db.query("select public.log_record_view('profiles', $1)", [B]);
      // Switch to admin context (same DB role) and read it back.
      await db.query("select set_config('request.jwt.claims', $1, true)", [
        JSON.stringify({ sub: ADMIN, role: "authenticated" }),
      ]);
      const r = await db.query(
        "select actor_id, action, target_table, target_id from public.audit_log",
      );
      assert.equal(r.rowCount, 1);
      assert.equal(r.rows[0].actor_id, A);
      assert.equal(r.rows[0].action, "record_view");
      assert.equal(r.rows[0].target_table, "profiles");
      assert.equal(r.rows[0].target_id, B);
    } finally {
      await db.query("rollback");
    }
  });
});

describe("RLS is enabled AND forced on every table", () => {
  test("relrowsecurity and relforcerowsecurity are set for all public tables", async () => {
    const r = await db.query(
      `select relname, relrowsecurity, relforcerowsecurity
         from pg_class
        where relnamespace = 'public'::regnamespace and relkind = 'r'`,
    );
    assert.ok(r.rowCount >= 3);
    for (const row of r.rows) {
      assert.equal(row.relrowsecurity, true, `${row.relname} must have RLS enabled`);
      assert.equal(row.relforcerowsecurity, true, `${row.relname} must have RLS forced`);
    }
  });
});
