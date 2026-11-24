-- Supabase advisor fixes (performance). No access rule changes — each policy
-- below grants EXACTLY the same access as before; only the SQL form changes.
--
-- Fixes:
--   1. "Auth RLS Initialization Plan" — wrap auth.uid()/role checks in a
--      sub-select so they are evaluated once per statement, not once per row.
--   2. "Multiple Permissive Policies" — merge the two SELECT policies on
--      `profiles` and `user_roles` into a single policy each.
--   3. "Unindexed foreign keys" — add covering indexes.
--
-- Security advisors that are Auth *dashboard* settings (leaked-password
-- protection, MFA/TOTP, OTP expiry) are NOT SQL — see docs/OPEN_ITEMS.md.

-- ============================================================
-- profiles — one SELECT policy (own OR admin); own insert/update.
-- ============================================================
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_select_admin on public.profiles;
drop policy if exists profiles_insert_self on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

create policy profiles_select on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ============================================================
-- user_roles — one SELECT policy (own OR admin); admin-only writes.
-- ============================================================
drop policy if exists user_roles_select_own on public.user_roles;
drop policy if exists user_roles_select_admin on public.user_roles;
drop policy if exists user_roles_admin_insert on public.user_roles;
drop policy if exists user_roles_admin_update on public.user_roles;
drop policy if exists user_roles_admin_delete on public.user_roles;

create policy user_roles_select on public.user_roles
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy user_roles_admin_insert on public.user_roles
  for insert to authenticated
  with check ((select public.is_admin()));

create policy user_roles_admin_update on public.user_roles
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy user_roles_admin_delete on public.user_roles
  for delete to authenticated
  using ((select public.is_admin()));

-- ============================================================
-- audit_log — admins may read.
-- ============================================================
drop policy if exists audit_log_select_admin on public.audit_log;

create policy audit_log_select_admin on public.audit_log
  for select to authenticated
  using ((select public.is_admin()));

-- ============================================================
-- contact_messages — staff read/update (insert policy unchanged).
-- ============================================================
drop policy if exists contact_messages_select_staff on public.contact_messages;
drop policy if exists contact_messages_update_staff on public.contact_messages;

create policy contact_messages_select_staff on public.contact_messages
  for select to authenticated
  using ((select public.is_admin()) or public.has_role((select auth.uid()), 'communications'));

create policy contact_messages_update_staff on public.contact_messages
  for update to authenticated
  using ((select public.is_admin()) or public.has_role((select auth.uid()), 'communications'))
  with check ((select public.is_admin()) or public.has_role((select auth.uid()), 'communications'));

-- ============================================================
-- supporters — staff read/update (opt-in insert policy unchanged).
-- ============================================================
drop policy if exists supporters_select_staff on public.supporters;
drop policy if exists supporters_update_staff on public.supporters;

create policy supporters_select_staff on public.supporters
  for select to authenticated
  using ((select public.is_admin()) or public.has_role((select auth.uid()), 'communications'));

create policy supporters_update_staff on public.supporters
  for update to authenticated
  using ((select public.is_admin()) or public.has_role((select auth.uid()), 'communications'))
  with check ((select public.is_admin()) or public.has_role((select auth.uid()), 'communications'));

-- ============================================================
-- Unindexed foreign keys (covering indexes).
-- ============================================================
create index if not exists user_roles_granted_by_idx on public.user_roles (granted_by);
create index if not exists audit_log_actor_id_idx on public.audit_log (actor_id);
create index if not exists contact_messages_handled_by_idx on public.contact_messages (handled_by);
