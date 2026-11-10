-- Applications: guardians, children, applications, consents.
--
-- CLAUDE.md:
--   * 6–11: the guardian does everything (no child login). 12–16: supervised.
--   * Sensitive child data is FIELD-LEVEL ENCRYPTED by the app before it is
--     stored — these columns hold ciphertext tokens (see src/lib/security/crypto.ts),
--     never plaintext. The database never sees names, DOB, school or notes.
--   * Consent from BOTH the biological and the spiritual parent/guardian, with
--     timestamp and policy version.
--   * Application statuses: submitted, under_review, vetted, paired, waitlisted,
--     accepted, declined.
--   * IDOR-safe: every row is scoped to the owning guardian or to staff via RLS.

create type public.age_group as enum ('6-11', '12-16');

create type public.application_status as enum (
  'submitted', 'under_review', 'vetted', 'paired', 'waitlisted', 'accepted', 'declined'
);

create type public.consent_type as enum ('biological_parent', 'spiritual_parent');

-- ============================================================
-- guardians — a parent/guardian account (role parent_guardian).
-- ============================================================
create table public.guardians (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name_enc text not null,       -- ciphertext
  phone_enc text,                    -- ciphertext
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.guardians enable row level security;
alter table public.guardians force row level security;
create trigger guardians_set_updated_at before update on public.guardians
  for each row execute function public.set_updated_at();

-- ============================================================
-- children — minimal plaintext; all PII encrypted.
-- ============================================================
create table public.children (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.guardians (id) on delete cascade,
  age_group public.age_group not null,
  full_name_enc text not null,       -- ciphertext
  dob_enc text not null,             -- ciphertext
  school_enc text,                   -- ciphertext
  notes_enc text,                    -- ciphertext (health/welfare notes)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.children enable row level security;
alter table public.children force row level security;
create trigger children_set_updated_at before update on public.children
  for each row execute function public.set_updated_at();

-- ============================================================
-- applications
-- ============================================================
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  programme text not null,
  status public.application_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references auth.users (id),
  constraint application_programme_len check (char_length(programme) between 1 and 80)
);
alter table public.applications enable row level security;
alter table public.applications force row level security;
create trigger applications_set_updated_at before update on public.applications
  for each row execute function public.set_updated_at();

-- ============================================================
-- consents — dual consent per application.
-- ============================================================
create table public.consents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  consent_type public.consent_type not null,
  granted_by_guardian uuid not null references public.guardians (id),
  granted_at timestamptz not null default now(),
  policy_version text not null,
  unique (application_id, consent_type),
  constraint consent_policy_len check (char_length(policy_version) between 1 and 40)
);
alter table public.consents enable row level security;
alter table public.consents force row level security;

-- ============================================================
-- Access helpers (SECURITY DEFINER; search_path pinned; see docs/SECURITY.md).
-- ============================================================
create or replace function public.current_guardian_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.guardians where user_id = auth.uid();
$$;

-- Staff who may view child records. Every such view must also be written to
-- audit_log by the app (log_record_view) — RLS controls access, the app logs it.
create or replace function public.has_child_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin()
      or public.has_role(auth.uid(), 'programme_lead')
      or public.has_role(auth.uid(), 'safeguarding_officer');
$$;

revoke all on function public.current_guardian_id() from public;
revoke all on function public.has_child_access() from public;
grant execute on function public.current_guardian_id() to authenticated;
grant execute on function public.has_child_access() to authenticated;

-- ============================================================
-- Policies
-- ============================================================

-- guardians: own row; staff may read.
create policy guardians_insert_self on public.guardians
  for insert to authenticated with check (user_id = auth.uid());
create policy guardians_select_own on public.guardians
  for select to authenticated using (user_id = auth.uid());
create policy guardians_select_staff on public.guardians
  for select to authenticated using (public.has_child_access());
create policy guardians_update_own on public.guardians
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- children: the owning guardian; staff may read.
create policy children_insert_own on public.children
  for insert to authenticated with check (guardian_id = public.current_guardian_id());
create policy children_select_own on public.children
  for select to authenticated using (guardian_id = public.current_guardian_id());
create policy children_select_staff on public.children
  for select to authenticated using (public.has_child_access());
create policy children_update_own on public.children
  for update to authenticated
  using (guardian_id = public.current_guardian_id())
  with check (guardian_id = public.current_guardian_id());

-- applications: owning guardian may create/read; only staff may change status.
create policy applications_insert_own on public.applications
  for insert to authenticated
  with check (
    child_id in (select id from public.children where guardian_id = public.current_guardian_id())
  );
create policy applications_select_own on public.applications
  for select to authenticated
  using (
    child_id in (select id from public.children where guardian_id = public.current_guardian_id())
  );
create policy applications_select_staff on public.applications
  for select to authenticated using (public.has_child_access());
create policy applications_update_staff on public.applications
  for update to authenticated
  using (public.has_child_access()) with check (public.has_child_access());

-- consents: the owning guardian records them; staff may read.
create policy consents_insert_own on public.consents
  for insert to authenticated
  with check (
    granted_by_guardian = public.current_guardian_id()
    and application_id in (
      select a.id from public.applications a
      join public.children c on c.id = a.child_id
      where c.guardian_id = public.current_guardian_id()
    )
  );
create policy consents_select_own on public.consents
  for select to authenticated
  using (
    application_id in (
      select a.id from public.applications a
      join public.children c on c.id = a.child_id
      where c.guardian_id = public.current_guardian_id()
    )
  );
create policy consents_select_staff on public.consents
  for select to authenticated using (public.has_child_access());

-- ============================================================
-- Grants (RLS gates every row). No anon access to any of these tables.
-- ============================================================
grant select, insert, update on public.guardians to authenticated;
grant select, insert, update on public.children to authenticated;
grant select, insert, update on public.applications to authenticated;
grant select, insert on public.consents to authenticated;
revoke delete on public.guardians, public.children, public.applications, public.consents
  from anon, authenticated, service_role;
