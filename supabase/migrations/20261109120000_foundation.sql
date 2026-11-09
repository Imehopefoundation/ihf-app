-- Foundation migration: profiles, user_roles, audit_log.
--
-- CLAUDE.md hard rules enforced here:
--   * RLS ENABLED **and** FORCED on every table; no permissive "USING (true)".
--   * audit_log is append-only (UPDATE/DELETE revoked from every app role).
--   * SECURITY DEFINER functions set search_path explicitly (see docs/SECURITY.md).
--   * Role checks go through a SECURITY DEFINER helper (no UI-only authorisation).
--
-- Assumes the Supabase-provided `auth` schema, `auth.uid()`, and the roles
-- anon / authenticated / service_role already exist (they do on Supabase; the
-- local/CI test harness in supabase/tests/setup/ emulates them).

-- ============================================================
-- Enum of application roles (CLAUDE.md §Roles)
-- ============================================================
create type public.app_role as enum (
  'visitor',
  'supporter',
  'parent_guardian',
  'mentee',
  'mentor',
  'volunteer',
  'programme_lead',
  'quality_assurance',
  'finance',
  'communications',
  'safeguarding_officer',
  'admin'
);

-- ============================================================
-- updated_at trigger helper (invoker rights; search_path pinned)
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ============================================================
-- profiles — one row per auth user. Intentionally minimal (data
-- minimisation); PII-bearing columns are added later with care.
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- user_roles — maps a user to one or more application roles.
-- ============================================================
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  granted_by uuid references auth.users (id),
  granted_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;
alter table public.user_roles force row level security;

-- ============================================================
-- Role-check helpers. SECURITY DEFINER so RLS policies can call them without
-- recursing into user_roles' own policies. Owned by the migration role
-- (postgres / BYPASSRLS on Supabase), so they bypass FORCE RLS as intended.
-- Listed in docs/SECURITY.md.
-- ============================================================
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = _user_id
      and ur.role = _role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

-- ============================================================
-- audit_log — append-only record of security-relevant events, incl. every
-- staff view of a child's record (logged via log_record_view, used from
-- later phases). CLAUDE.md: append-only; reads restricted.
-- ============================================================
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id),
  action text not null,
  target_table text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;
alter table public.audit_log force row level security;

-- Append-only at the privilege level too (defence in depth): no role may
-- UPDATE or DELETE, including service_role. Inserts happen only via the
-- SECURITY DEFINER logging function below.
revoke update, delete on public.audit_log from anon, authenticated, service_role;

-- Append-only writer. Owner-rights insert bypasses the (deny-all) insert RLS,
-- so callers can record events without being able to read or tamper with them.
create or replace function public.log_audit(
  _action text,
  _target_table text default null,
  _target_id uuid default null,
  _metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if _action is null or length(_action) = 0 or length(_action) > 200 then
    raise exception 'invalid audit action';
  end if;
  insert into public.audit_log (actor_id, action, target_table, target_id, metadata)
  values (auth.uid(), _action, _target_table, _target_id, coalesce(_metadata, '{}'::jsonb));
end;
$$;

-- "a helper that logs record views" (PROMPTS.md Phase 1).
create or replace function public.log_record_view(_target_table text, _target_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  select public.log_audit('record_view', _target_table, _target_id, '{}'::jsonb);
$$;

-- ============================================================
-- Policies
-- ============================================================

-- profiles: a user sees/edits only their own row; admins may read all.
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy profiles_select_admin on public.profiles
  for select to authenticated
  using (public.is_admin());

create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
-- (no delete policy -> deletes denied)

-- user_roles: a user may read their own roles; only admins may read all or
-- grant/revoke roles. A user can never grant themselves a role.
create policy user_roles_select_own on public.user_roles
  for select to authenticated
  using (user_id = auth.uid());

create policy user_roles_select_admin on public.user_roles
  for select to authenticated
  using (public.is_admin());

create policy user_roles_admin_insert on public.user_roles
  for insert to authenticated
  with check (public.is_admin());

create policy user_roles_admin_update on public.user_roles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy user_roles_admin_delete on public.user_roles
  for delete to authenticated
  using (public.is_admin());

-- audit_log: admins may read; nobody may write directly (writes go through
-- log_audit). No INSERT/UPDATE/DELETE policies -> all denied by RLS.
create policy audit_log_select_admin on public.audit_log
  for select to authenticated
  using (public.is_admin());

-- ============================================================
-- Execute grants (least privilege)
-- ============================================================
revoke all on function public.has_role(uuid, public.app_role) from public;
revoke all on function public.is_admin() from public;
revoke all on function public.log_audit(text, text, uuid, jsonb) from public;
revoke all on function public.log_record_view(text, uuid) from public;

grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.log_audit(text, text, uuid, jsonb) to authenticated;
grant execute on function public.log_record_view(text, uuid) to authenticated;
