import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { setupDatabase, asUser, seed } from "./helpers.mjs";

const MENTOR = "11111111-0000-0000-0000-000000000001";
const MENTOR2 = "22222222-0000-0000-0000-000000000002";
const MENTEE = "33333333-0000-0000-0000-000000000003";
const STRANGER = "44444444-0000-0000-0000-000000000004";

let db;
let ev;

before(async () => {
  db = await setupDatabase("ihf_rls_calendar");
  await seed(db, `insert into auth.users (id,email) values ($1,'m@x'),($2,'m2@x'),($3,'e@x'),($4,'s@x')`, [
    MENTOR, MENTOR2, MENTEE, STRANGER,
  ]);
  await seed(
    db,
    `insert into public.user_roles (user_id, role) values ($1,'mentor'),($2,'mentor'),($3,'mentee')`,
    [MENTOR, MENTOR2, MENTEE],
  );
  ev = (
    await seed(
      db,
      `insert into public.calendar_events (created_by, title, event_type, event_date)
       values ($1,'Class A','class','2026-12-01') returning id`,
      [MENTOR],
    )
  ).rows[0].id;
});

after(async () => {
  if (db) await db.end();
});

describe("calendar_events RLS", () => {
  test("a mentor creates their own event", async () => {
    const r = await asUser(db, { sub: MENTOR }, (c) =>
      c.query(
        `insert into public.calendar_events (created_by, title, event_type, event_date)
         values ($1,'B','assessment','2026-12-05') returning id`,
        [MENTOR],
      ),
    );
    assert.equal(r.rowCount, 1);
  });

  test("a mentor cannot create as another user", async () => {
    await assert.rejects(
      () =>
        asUser(db, { sub: MENTOR }, (c) =>
          c.query(
            `insert into public.calendar_events (created_by, title, event_type, event_date)
             values ($1,'X','class','2026-12-06')`,
            [MENTOR2],
          ),
        ),
      /row-level security/i,
    );
  });

  test("a mentee cannot create an event", async () => {
    await assert.rejects(
      () =>
        asUser(db, { sub: MENTEE }, (c) =>
          c.query(
            `insert into public.calendar_events (created_by, title, event_type, event_date)
             values ($1,'X','class','2026-12-06')`,
            [MENTEE],
          ),
        ),
      /row-level security/i,
    );
  });

  test("a mentee can view the calendar", async () => {
    const r = await asUser(db, { sub: MENTEE }, (c) => c.query("select id from public.calendar_events"));
    assert.ok(r.rowCount >= 1);
  });

  test("a user with no role sees nothing", async () => {
    const r = await asUser(db, { sub: STRANGER }, (c) =>
      c.query("select id from public.calendar_events"),
    );
    assert.equal(r.rowCount, 0);
  });

  test("a mentor cannot edit another mentor's event", async () => {
    const r = await asUser(db, { sub: MENTOR2 }, (c) =>
      c.query("update public.calendar_events set title='hacked' where id=$1", [ev]),
    );
    assert.equal(r.rowCount, 0);
  });

  test("a mentor cannot delete another mentor's event", async () => {
    const r = await asUser(db, { sub: MENTOR2 }, (c) =>
      c.query("delete from public.calendar_events where id=$1", [ev]),
    );
    assert.equal(r.rowCount, 0);
  });

  test("a mentor can delete their own event", async () => {
    const r = await asUser(db, { sub: MENTOR }, (c) =>
      c.query("delete from public.calendar_events where id=$1", [ev]),
    );
    assert.equal(r.rowCount, 1);
  });
});
