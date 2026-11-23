-- Remove the online application feature.
--
-- Decision (2026-11-23): applications are NOT handled online. The whole
-- apply-as-mentee flow is removed from the app, and its tables are dropped here.
-- Drops, in dependency order: consents, applications, children, guardians, plus
-- the enums and SECURITY DEFINER helpers that existed only for them.
--
-- IRREVERSIBLE: any rows in these tables are deleted. `cascade` also removes
-- their RLS policies, grants, triggers and foreign keys.
--
-- Kept intentionally: the `app_role` enum (incl. parent_guardian, mentee) — the
-- roles remain valid and may be assigned for other features.

drop table if exists public.consents cascade;
drop table if exists public.applications cascade;
drop table if exists public.children cascade;
drop table if exists public.guardians cascade;

drop function if exists public.current_guardian_id() cascade;
drop function if exists public.has_child_access() cascade;

drop type if exists public.consent_type;
drop type if exists public.application_status;
drop type if exists public.age_group;
