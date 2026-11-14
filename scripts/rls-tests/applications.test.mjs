import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { setupDatabase, asUser, seed } from "./helpers.mjs";

const USER_A = "aaaaaaaa-0000-0000-0000-000000000001";
const USER_B = "bbbbbbbb-0000-0000-0000-000000000002";
const STAFF = "cccccccc-0000-0000-0000-000000000003";
const STRANGER = "dddddddd-0000-0000-0000-000000000004";

let db;
let gA, gB, childA, childB, appA, appB;

before(async () => {
  db = await setupDatabase("ihf_rls_apps");
  await seed(db, `insert into auth.users (id,email) values ($1,'a@x'),($2,'b@x'),($3,'s@x'),($4,'d@x')`, [
    USER_A, USER_B, STAFF, STRANGER,
  ]);
  await seed(db, `insert into public.user_roles (user_id, role) values ($1,'programme_lead')`, [STAFF]);

  const g = async (user) =>
    (await seed(db, `insert into public.guardians (user_id, full_name_enc) values ($1,'v1:enc') returning id`, [user]))
      .rows[0].id;
  gA = await g(USER_A);
  gB = await g(USER_B);

  const child = async (gid) =>
    (
      await seed(
        db,
        `insert into public.children (guardian_id, age_group, full_name_enc, dob_enc) values ($1,'12-16','v1:enc','v1:enc') returning id`,
        [gid],
      )
    ).rows[0].id;
  childA = await child(gA);
  childB = await child(gB);

  const app = async (cid) =>
    (await seed(db, `insert into public.applications (child_id, programme) values ($1,'Skills Development') returning id`, [cid]))
      .rows[0].id;
  appA = await app(childA);
  appB = await app(childB);

  await seed(
    db,
    `insert into public.consents (application_id, consent_type, granted_by_guardian, policy_version)
     values ($1,'biological_parent',$2,'v1.0'), ($1,'spiritual_parent',$2,'v1.0')`,
    [appA, gA],
  );
});

after(async () => {
  if (db) await db.end();
});

describe("guardian ownership", () => {
  test("a guardian reads their own child", async () => {
    const r = await asUser(db, { sub: USER_A }, (c) =>
      c.query("select id from public.children where id=$1", [childA]),
    );
    assert.equal(r.rowCount, 1);
  });

  test("a guardian cannot read another guardian's child (IDOR blocked)", async () => {
    const r = await asUser(db, { sub: USER_A }, (c) =>
      c.query("select id from public.children where id=$1", [childB]),
    );
    assert.equal(r.rowCount, 0);
  });

  test("a guardian cannot read another's application or consents", async () => {
    const app = await asUser(db, { sub: USER_A }, (c) =>
      c.query("select id from public.applications where id=$1", [appB]),
    );
    assert.equal(app.rowCount, 0);
    const con = await asUser(db, { sub: USER_A }, (c) => c.query("select id from public.consents"));
    // A sees only consents tied to A's own application (2 of them), never B's.
    assert.equal(con.rowCount, 2);
  });

  test("an authenticated non-guardian sees nothing", async () => {
    const r = await asUser(db, { sub: STRANGER }, (c) => c.query("select id from public.children"));
    assert.equal(r.rowCount, 0);
  });
});

describe("staff access and status changes", () => {
  test("staff (programme_lead) can read children and applications", async () => {
    const kids = await asUser(db, { sub: STAFF }, (c) => c.query("select id from public.children"));
    assert.equal(kids.rowCount, 2);
    const apps = await asUser(db, { sub: STAFF }, (c) => c.query("select id from public.applications"));
    assert.equal(apps.rowCount, 2);
  });

  test("a guardian cannot change an application's status", async () => {
    const r = await asUser(db, { sub: USER_A }, (c) =>
      c.query("update public.applications set status='accepted' where id=$1", [appA]),
    );
    assert.equal(r.rowCount, 0); // no update policy for owners -> no rows affected
  });

  test("staff can change an application's status", async () => {
    const r = await asUser(db, { sub: STAFF }, (c) =>
      c.query("update public.applications set status='under_review' where id=$1", [appA]),
    );
    assert.equal(r.rowCount, 1);
  });

  test("nobody can delete child records", async () => {
    await assert.rejects(
      () => asUser(db, { sub: STAFF }, (c) => c.query("delete from public.children")),
      /permission denied/i,
    );
  });
});

describe("guardian writes (create application + record consent)", () => {
  let newApp;

  test("a guardian can create an application for their own child", async () => {
    const r = await asUser(db, { sub: USER_A }, (c) =>
      c.query(
        "insert into public.applications (child_id, programme) values ($1,'Education & Scholarships') returning id",
        [childA],
      ),
    );
    assert.equal(r.rowCount, 1);
    newApp = r.rows[0].id;
  });

  test("a guardian cannot create an application for another's child (IDOR blocked)", async () => {
    await assert.rejects(
      () =>
        asUser(db, { sub: USER_A }, (c) =>
          c.query("insert into public.applications (child_id, programme) values ($1,'Skills Development')", [
            childB,
          ]),
        ),
      /row-level security/i,
    );
  });

  test("a guardian can record a consent on their own application", async () => {
    const r = await asUser(db, { sub: USER_A }, (c) =>
      c.query(
        `insert into public.consents (application_id, consent_type, granted_by_guardian, policy_version)
         values ($1,'biological_parent',$2,'2026.1-draft') returning id`,
        [newApp, gA],
      ),
    );
    assert.equal(r.rowCount, 1);
  });

  test("a guardian cannot record a consent on another's application", async () => {
    await assert.rejects(
      () =>
        asUser(db, { sub: USER_A }, (c) =>
          c.query(
            `insert into public.consents (application_id, consent_type, granted_by_guardian, policy_version)
             values ($1,'biological_parent',$2,'x')`,
            [appB, gA],
          ),
        ),
      /row-level security/i,
    );
  });
});
