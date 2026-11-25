import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { setupDatabase, asUser, seed } from "./helpers.mjs";

const USER = "11111111-0000-0000-0000-000000000001";
const OTHER = "22222222-0000-0000-0000-000000000002";
const ADMIN = "33333333-0000-0000-0000-000000000003";

let db;

before(async () => {
  db = await setupDatabase("ihf_rls_notifications");
  await seed(db, `insert into auth.users (id,email) values ($1,'u@x'),($2,'o@x'),($3,'a@x')`, [
    USER, OTHER, ADMIN,
  ]);
  await seed(db, `insert into public.user_roles (user_id, role) values ($1,'mentee'),($2,'mentee'),($3,'admin')`, [
    USER, OTHER, ADMIN,
  ]);
  await seed(
    db,
    `insert into public.notifications (user_id, kind, ref_id, subject)
     values ($1,'class_reminder','aaaaaaaa-0000-0000-0000-000000000001','Upcoming class'),
            ($2,'class_reminder','aaaaaaaa-0000-0000-0000-000000000001','Upcoming class')`,
    [USER, OTHER],
  );
});

after(async () => {
  if (db) await db.end();
});

describe("notifications RLS", () => {
  test("a user sees only their own notification", async () => {
    const r = await asUser(db, { sub: USER }, (c) =>
      c.query("select user_id from public.notifications"),
    );
    assert.equal(r.rowCount, 1);
    assert.equal(r.rows[0].user_id, USER);
  });

  test("a user cannot see another user's notification", async () => {
    const r = await asUser(db, { sub: USER }, (c) =>
      c.query("select id from public.notifications where user_id=$1", [OTHER]),
    );
    assert.equal(r.rowCount, 0);
  });

  test("an admin sees all notifications", async () => {
    const r = await asUser(db, { sub: ADMIN }, (c) =>
      c.query("select id from public.notifications"),
    );
    assert.ok(r.rowCount >= 2);
  });

  test("an authenticated user cannot insert a notification", async () => {
    await assert.rejects(
      () =>
        asUser(db, { sub: USER }, (c) =>
          c.query(
            `insert into public.notifications (user_id, kind, ref_id)
             values ($1,'class_reminder','bbbbbbbb-0000-0000-0000-000000000001')`,
            [USER],
          ),
        ),
      /permission denied|row-level security/i,
    );
  });

  test("an authenticated user cannot update a notification", async () => {
    await assert.rejects(
      () =>
        asUser(db, { sub: USER }, (c) =>
          c.query("update public.notifications set status='sent' where user_id=$1", [USER]),
        ),
      /permission denied/i,
    );
  });

  test("an authenticated user cannot delete a notification", async () => {
    await assert.rejects(
      () =>
        asUser(db, { sub: USER }, (c) =>
          c.query("delete from public.notifications where user_id=$1", [USER]),
        ),
      /permission denied/i,
    );
  });

  test("the unique index blocks a duplicate (user, kind, ref)", async () => {
    await assert.rejects(
      () =>
        seed(
          db,
          `insert into public.notifications (user_id, kind, ref_id)
           values ($1,'class_reminder','aaaaaaaa-0000-0000-0000-000000000001')`,
          [USER],
        ),
      /duplicate key|unique/i,
    );
  });
});
