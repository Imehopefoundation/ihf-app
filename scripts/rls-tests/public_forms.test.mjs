import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { setupDatabase, asUser, seed } from "./helpers.mjs";

const ADMIN = "33333333-3333-3333-3333-333333333333";
const COMMS = "44444444-4444-4444-4444-444444444444";

let db;

before(async () => {
  db = await setupDatabase("ihf_rls_forms");
  await seed(
    db,
    `insert into auth.users (id, email) values ($1,'admin@example.com'),($2,'comms@example.com')`,
    [ADMIN, COMMS],
  );
  await seed(db, `insert into public.user_roles (user_id, role) values ($1,'admin'),($2,'communications')`, [
    ADMIN,
    COMMS,
  ]);
  // A committed supporter so the staff-read test has a row to see (asUser rolls back).
  await seed(db, `insert into public.supporters (email, name, opt_in) values ('seed@example.com','Seed', true)`);
});

after(async () => {
  if (db) await db.end();
});

describe("contact_messages", () => {
  test("an anonymous visitor can submit a valid message", async () => {
    // No RETURNING: the public can submit but cannot read messages back (the
    // SELECT policy is staff-only), so INSERT...RETURNING would be denied.
    const r = await asUser(db, { sub: null, role: "anon" }, (c) =>
      c.query(
        `insert into public.contact_messages (name, email, topic, message)
         values ('Ada','ada@example.com','General','Hello there')`,
      ),
    );
    assert.equal(r.rowCount, 1);
  });

  test("the public cannot read back a message it inserted (no RETURNING)", async () => {
    // anon has INSERT but not SELECT, so RETURNING is denied.
    await assert.rejects(
      () =>
        asUser(db, { sub: null, role: "anon" }, (c) =>
          c.query(
            `insert into public.contact_messages (name, email, topic, message)
             values ('Ada','ada@example.com','General','Hello there') returning id`,
          ),
        ),
      /permission denied|row-level security/i,
    );
  });

  test("an over-long message is rejected at the database", async () => {
    await assert.rejects(
      () =>
        asUser(db, { sub: null, role: "anon" }, (c) =>
          c.query(
            `insert into public.contact_messages (name, email, topic, message)
             values ('Ada','ada@example.com','General',$1)`,
            ["x".repeat(5001)],
          ),
        ),
      /check constraint|row-level|violates/i,
    );
  });

  test("the public cannot read submitted messages", async () => {
    await assert.rejects(
      () =>
        asUser(db, { sub: null, role: "anon" }, (c) =>
          c.query("select * from public.contact_messages"),
        ),
      /permission denied/i,
    );
  });

  test("communications staff can read messages", async () => {
    await seed(
      db,
      `insert into public.contact_messages (name,email,topic,message) values ('Seed','s@example.com','General','hi')`,
    );
    const r = await asUser(db, { sub: COMMS }, (c) =>
      c.query("select id from public.contact_messages"),
    );
    assert.ok(r.rowCount >= 1);
  });

  test("a non-staff authenticated user cannot read messages", async () => {
    const r = await asUser(db, { sub: ADMIN.replace(/3/g, "9") }, (c) =>
      c.query("select id from public.contact_messages"),
    );
    assert.equal(r.rowCount, 0);
  });
});

describe("supporters", () => {
  test("opt-in is required: a non-opted-in row is rejected", async () => {
    await assert.rejects(
      () =>
        asUser(db, { sub: null, role: "anon" }, (c) =>
          c.query(
            `insert into public.supporters (email, opt_in) values ('x@example.com', false)`,
          ),
        ),
      /row-level|check|violates/i,
    );
  });

  test("an opted-in supporter can be stored by the public form", async () => {
    const r = await asUser(db, { sub: null, role: "anon" }, (c) =>
      c.query(
        `insert into public.supporters (email, name, opt_in) values ('friend@example.com','Friend', true)`,
      ),
    );
    assert.equal(r.rowCount, 1);
  });

  test("the supporter list is private to staff", async () => {
    // anon has no SELECT grant at all; staff (admin) can read.
    await assert.rejects(
      () =>
        asUser(db, { sub: null, role: "anon" }, (c) =>
          c.query("select email from public.supporters"),
        ),
      /permission denied/i,
    );
    const admin = await asUser(db, { sub: ADMIN }, (c) =>
      c.query("select email from public.supporters"),
    );
    assert.ok(admin.rowCount >= 1);
  });
});
