-- Auto-provision a profile row when a new auth user is created.
--
-- The standard Supabase pattern: a SECURITY DEFINER trigger on auth.users. It
-- creates only the profile skeleton (id) — no PII — so a freshly signed-up user
-- has a profile without the app needing elevated privileges. Idempotent.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
