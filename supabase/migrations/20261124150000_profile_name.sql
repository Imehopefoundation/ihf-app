-- A display name on the profile, so the LMS can greet people by name.
-- Encrypted (a mentee is a minor; names are sensitive — CLAUDE.md). Only the
-- user themselves (and admin) can read their profile row (existing RLS).
alter table public.profiles add column if not exists full_name_enc text;
