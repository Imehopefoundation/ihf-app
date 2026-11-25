import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { setupDatabase, asUser, seed } from "./helpers.mjs";

const MENTOR = "11111111-0000-0000-0000-000000000001";
const MENTOR2 = "22222222-0000-0000-0000-000000000002";
const MENTEE = "33333333-0000-0000-0000-000000000003";
const STRANGER = "44444444-0000-0000-0000-000000000004";

let db;
let sess;

before(async () => {
  db = await setupDatabase("ihf_rls_sessions");
  await seed(db, `insert into auth.users (id,email) values ($1,'m@x'),($2,'m2@x'),($3,'e@x'),($4,'s@x')`, [
    MENTOR, MENTOR2, MENTEE, STRANGER,
  ]);
  await seed(
    db,
    `insert into public.user_roles (user_id, role) values ($1,'mentor'),($2,'mentor'),($3,'mentee')`,
    [MENTOR, MENTOR2, MENTEE],
  );
  sess = (
    await seed(
      db,
      `insert into public.sessions (created_by, title, session_date, devotion_done, code_of_conduct_read)
       values ($1,'Week 1','2026-12-01',true,true) returning id`,
      [MENTOR],
    )
  ).rows[0].id;
});

after(async () => {
  if (db) await db.end();
});

describe("sessions RLS", () => {
  test("a mentor records their own session", async () => {
    const r = await asUser(db, { sub: MENTOR }, (c) =>
      c.query(
        `insert into public.sessions (created_by, title, session_date)
         values ($1,'Week 2','2026-12-08') returning id`,
        [MENTOR],
      ),
    );
    assert.equal(r.rowCount, 1);
  });

  test("a mentor cannot record as another user", async () => {
    await assert.rejects(
      () =>
        asUser(db, { sub: MENTOR }, (c) =>
          c.query(
            `insert into public.sessions (created_by, title, session_date)
             values ($1,'X','2026-12-09')`,
            [MENTOR2],
          ),
        ),
      /row-level security/i,
    );
  });

  test("a mentee cannot record a session", async () => {
    await assert.rejects(
      () =>
        asUser(db, { sub: MENTEE }, (c) =>
          c.query(
            `insert into public.sessions (created_by, title, session_date)
             values ($1,'X','2026-12-09')`,
            [MENTEE],
          ),
        ),
      /row-level security/i,
    );
  });

  test("a mentor can view sessions", async () => {
    const r = await asUser(db, { sub: MENTOR }, (c) => c.query("select id from public.sessions"));
    assert.ok(r.rowCount >= 1);
  });

  test("a mentee can view the session record", async () => {
    const r = await asUser(db, { sub: MENTEE }, (c) => c.query("select id from public.sessions"));
    assert.ok(r.rowCount >= 1);
  });

  test("a user with no role sees nothing", async () => {
    const r = await asUser(db, { sub: STRANGER }, (c) => c.query("select id from public.sessions"));
    assert.equal(r.rowCount, 0);
  });

  test("a mentor cannot delete another mentor's session", async () => {
    const r = await asUser(db, { sub: MENTOR2 }, (c) =>
      c.query("delete from public.sessions where id=$1", [sess]),
    );
    assert.equal(r.rowCount, 0);
  });

  test("a mentor can delete their own session", async () => {
    const r = await asUser(db, { sub: MENTOR }, (c) =>
      c.query("delete from public.sessions where id=$1", [sess]),
    );
    assert.equal(r.rowCount, 1);
  });
});
