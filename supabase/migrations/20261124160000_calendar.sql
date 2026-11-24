-- Calendar: classes, assessments, submission deadlines and other events, so a
-- member can see what they have throughout the month. Mentors/admin create &
-- edit events; mentees/mentors/admin view them.
--
-- Written idempotently so it is safe to re-run (e.g. after a partial apply).

do $$
begin
  if not exists (select 1 from pg_type where typname = 'calendar_event_type') then
    create type public.calendar_event_type as enum ('class', 'assessment', 'submission', 'other');
  end if;
end
$$;

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users (id) on delete cascade,
  title text not null,
  event_type public.calendar_event_type not null default 'class',
  event_date date not null,
  start_time time,
  end_time time,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ce_title_len check (char_length(title) between 1 and 160),
  constraint ce_desc_len check (description is null or char_length(description) <= 2000)
);

alter table public.calendar_events enable row level security;
alter table public.calendar_events force row level security;

drop trigger if exists calendar_events_set_updated_at on public.calendar_events;
create trigger calendar_events_set_updated_at before update on public.calendar_events
  for each row execute function public.set_updated_at();

create index if not exists calendar_events_date_idx on public.calendar_events (event_date);
create index if not exists calendar_events_created_by_idx on public.calendar_events (created_by);

-- View: any mentor, mentee or admin.
drop policy if exists calendar_select on public.calendar_events;
create policy calendar_select on public.calendar_events
  for select to authenticated
  using (
    (select public.is_admin())
    or public.has_role((select auth.uid()), 'mentor')
    or public.has_role((select auth.uid()), 'mentee')
  );

-- Create: mentors (or admin), as themselves.
drop policy if exists calendar_insert on public.calendar_events;
create policy calendar_insert on public.calendar_events
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and ((select public.is_admin()) or public.has_role((select auth.uid()), 'mentor'))
  );

-- Edit / delete: the creating mentor or an admin.
drop policy if exists calendar_update on public.calendar_events;
create policy calendar_update on public.calendar_events
  for update to authenticated
  using (created_by = (select auth.uid()) or (select public.is_admin()))
  with check (created_by = (select auth.uid()) or (select public.is_admin()));

drop policy if exists calendar_delete on public.calendar_events;
create policy calendar_delete on public.calendar_events
  for delete to authenticated
  using (created_by = (select auth.uid()) or (select public.is_admin()));

grant select, insert, update, delete on public.calendar_events to authenticated;
revoke all on public.calendar_events from anon;
