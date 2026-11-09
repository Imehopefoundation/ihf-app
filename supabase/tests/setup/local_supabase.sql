-- LOCAL / CI TEST HARNESS ONLY.
--
-- Emulates the parts of a Supabase project that are normally provided by the
-- platform (the `auth` schema, `auth.uid()`, and the anon/authenticated/
-- service_role roles) so that our migrations and RLS tests can run against a
-- plain Postgres. This file is NEVER applied to a real Supabase project — it is
-- loaded only by scripts/rls-tests before the migrations.

create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text unique
);

-- Mirror Supabase's request-scoped helpers: they read the JWT claims that the
-- API gateway sets per request via `set_config('request.jwt.claims', ...)`.
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid;
$$;

create or replace function auth.role()
returns text
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '')::text;
$$;

-- Supabase roles. service_role bypasses RLS (as on the platform); anon and
-- authenticated do not.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
grant select on auth.users to authenticated, service_role;

-- Mirror Supabase's default table grants (RLS still gates actual access). Set
-- BEFORE the migrations run so tables created by them inherit these grants;
-- the foundation migration then REVOKEs update/delete on audit_log on top.
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
