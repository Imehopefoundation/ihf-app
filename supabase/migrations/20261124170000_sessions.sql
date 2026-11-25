-- Sessions: a mentor records that a session happened — devotion and
-- code-of-conduct reading, with notes. Mentees view the record.
-- (Per-mentee attendance comes once pairings exist.)
-- Idempotent so it is safe to re-run.

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users (id) on delete cascade,
  title text not null,
  session_date date not null,
  devotion_done boolean not null default false,
  code_of_conduct_read boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint session_title_len check (char_length(title) between 1 and 160),
  constraint session_notes_len check (notes is null or char_length(notes) <= 2000)
);

alter table public.sessions enable row level security;
alter table public.sessions force row level security;

drop trigger if exists sessions_set_updated_at on public.sessions;
create trigger sessions_set_updated_at before update on public.sessions
  for each row execute function public.set_updated_at();

create index if not exists sessions_created_by_idx on public.sessions (created_by);
create index if not exists sessions_date_idx on public.sessions (session_date desc);

drop policy if exists sessions_select on public.sessions;
create policy sessions_select on public.sessions
  for select to authenticated
  using (
    (select public.is_admin())
    or public.has_role((select auth.uid()), 'mentor')
    or public.has_role((select auth.uid()), 'mentee')
  );

drop policy if exists sessions_insert on public.sessions;
create policy sessions_insert on public.sessions
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and ((select public.is_admin()) or public.has_role((select auth.uid()), 'mentor'))
  );

drop policy if exists sessions_update on public.sessions;
create policy sessions_update on public.sessions
  for update to authenticated
  using (created_by = (select auth.uid()) or (select public.is_admin()))
  with check (created_by = (select auth.uid()) or (select public.is_admin()));

drop policy if exists sessions_delete on public.sessions;
create policy sessions_delete on public.sessions
  for delete to authenticated
  using (created_by = (select auth.uid()) or (select public.is_admin()));

grant select, insert, update, delete on public.sessions to authenticated;
revoke all on public.sessions from anon;
