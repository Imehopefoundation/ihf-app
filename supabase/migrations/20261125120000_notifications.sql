-- Notifications: an operational record of messages queued/sent to a user
-- (email in v1). Stores NO PII — only the user_id, a kind, the related entity
-- id, and a short non-personal subject label. Written only by the server
-- (service_role, which bypasses RLS); users may read their own.
-- Idempotent so it is safe to re-run.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  ref_id uuid,
  channel text not null default 'email',
  subject text,
  status text not null default 'queued',
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  constraint notifications_status_chk check (status in ('queued', 'sent', 'failed')),
  constraint notifications_kind_len check (char_length(kind) between 1 and 64),
  constraint notifications_subject_len check (subject is null or char_length(subject) <= 200)
);

alter table public.notifications enable row level security;
alter table public.notifications force row level security;

-- One notification per (user, kind, related entity): the reminder cron relies
-- on this to never send twice. ref_id is always set for reminders; the coalesce
-- keeps the guarantee even for null-ref kinds.
create unique index if not exists notifications_unique_idx
  on public.notifications (user_id, kind, coalesce(ref_id, '00000000-0000-0000-0000-000000000000'::uuid));

create index if not exists notifications_user_idx on public.notifications (user_id);
create index if not exists notifications_status_idx on public.notifications (status);

-- Users may read ONLY their own notifications; admins may read all. No insert/
-- update/delete policy exists, so authenticated users can never write — only
-- the server's service_role client (which bypasses RLS) does.
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

grant select on public.notifications to authenticated;
revoke all on public.notifications from anon;
