import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { setupDatabase, asUser, seed } from "./helpers.mjs";

const MENTOR = "11111111-0000-0000-0000-000000000001";
const MENTOR2 = "22222222-0000-0000-0000-000000000002";
const MENTEE = "33333333-0000-0000-0000-000000000003";
const STRANGER = "44444444-0000-0000-0000-000000000004";

let db;
let vid;

before(async () => {
  db = await setupDatabase("ihf_rls_videos");
  await seed(db, `insert into auth.users (id,email) values ($1,'m@x'),($2,'m2@x'),($3,'e@x'),($4,'s@x')`, [
    MENTOR, MENTOR2, MENTEE, STRANGER,
  ]);
  await seed(
    db,
    `insert into public.user_roles (user_id, role) values ($1,'mentor'),($2,'mentor'),($3,'mentee')`,
    [MENTOR, MENTOR2, MENTEE],
  );
  vid = (
    await seed(
      db,
      `insert into public.videos (posted_by, title, provider, video_ref)
       values ($1,'Intro','youtube','dQw4w9WgXcQ') returning id`,
      [MENTOR],
    )
  ).rows[0].id;
});

after(async () => {
  if (db) await db.end();
});

describe("videos RLS", () => {
  test("a mentor posts a video as themselves", async () => {
    const r = await asUser(db, { sub: MENTOR }, (c) =>
      c.query(
        `insert into public.videos (posted_by, title, provider, video_ref)
         values ($1,'Second','vimeo','123456789') returning id`,
        [MENTOR],
      ),
    );
    assert.equal(r.rowCount, 1);
  });

  test("a mentor cannot post as another user", async () => {
    await assert.rejects(
      () =>
        asUser(db, { sub: MENTOR }, (c) =>
          c.query(
            `insert into public.videos (posted_by, title, provider, video_ref)
             values ($1,'x','youtube','dQw4w9WgXcQ')`,
            [MENTOR2],
          ),
        ),
      /row-level security/i,
    );
  });

  test("a mentee cannot post a video", async () => {
    await assert.rejects(
      () =>
        asUser(db, { sub: MENTEE }, (c) =>
          c.query(
            `insert into public.videos (posted_by, title, provider, video_ref)
             values ($1,'x','youtube','dQw4w9WgXcQ')`,
            [MENTEE],
          ),
        ),
      /row-level security/i,
    );
  });

  test("a mentee can watch (select) videos", async () => {
    const r = await asUser(db, { sub: MENTEE }, (c) => c.query("select id from public.videos"));
    assert.ok(r.rowCount >= 1);
  });

  test("another mentor can watch videos", async () => {
    const r = await asUser(db, { sub: MENTOR2 }, (c) => c.query("select id from public.videos"));
    assert.ok(r.rowCount >= 1);
  });

  test("a user with no role sees nothing", async () => {
    const r = await asUser(db, { sub: STRANGER }, (c) => c.query("select id from public.videos"));
    assert.equal(r.rowCount, 0);
  });

  test("a mentor cannot delete another mentor's video", async () => {
    const r = await asUser(db, { sub: MENTOR2 }, (c) =>
      c.query("delete from public.videos where id=$1", [vid]),
    );
    assert.equal(r.rowCount, 0);
  });

  test("a mentor can delete their own video", async () => {
    const r = await asUser(db, { sub: MENTOR }, (c) =>
      c.query("delete from public.videos where id=$1", [vid]),
    );
    assert.equal(r.rowCount, 1);
  });
});
