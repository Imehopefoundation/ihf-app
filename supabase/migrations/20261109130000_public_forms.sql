-- Public-form storage: contact_messages and supporters.
--
-- Both accept inserts from unauthenticated visitors (the public forms), but the
-- RLS INSERT policies are NON-permissive: they bound every field at the database
-- so a hostile client cannot store oversized or malformed data even if it
-- bypasses the app. Reads are restricted to staff roles. Email delivery and the
-- one-click unsubscribe endpoint are wired in a later phase (Communications).

-- ============================================================
-- contact_messages
-- ============================================================
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  topic text not null,
  message text not null,
  created_at timestamptz not null default now(),
  handled boolean not null default false,
  handled_by uuid references auth.users (id),
  handled_at timestamptz,
  constraint contact_name_len check (char_length(name) between 1 and 120),
  constraint contact_email_len check (char_length(email) between 3 and 254),
  constraint contact_topic_len check (char_length(topic) between 1 and 60),
  constraint contact_message_len check (char_length(message) between 1 and 5000)
);

alter table public.contact_messages enable row level security;
alter table public.contact_messages force row level security;

-- Anyone may submit a message, but only within the bounds above (non-permissive).
create policy contact_messages_insert_public on public.contact_messages
  for insert to anon, authenticated
  with check (
    char_length(name) between 1 and 120
    and char_length(email) between 3 and 254
    and char_length(topic) between 1 and 60
    and char_length(message) between 1 and 5000
    and handled = false
    and handled_by is null
    and handled_at is null
  );

-- Only staff who handle enquiries may read or update them.
create policy contact_messages_select_staff on public.contact_messages
  for select to authenticated
  using (public.is_admin() or public.has_role(auth.uid(), 'communications'));

create policy contact_messages_update_staff on public.contact_messages
  for update to authenticated
  using (public.is_admin() or public.has_role(auth.uid(), 'communications'))
  with check (public.is_admin() or public.has_role(auth.uid(), 'communications'));

revoke delete on public.contact_messages from anon, authenticated, service_role;

-- Explicit least-privilege grants (RLS still gates every row).
grant insert on public.contact_messages to anon, authenticated;
grant select, update on public.contact_messages to authenticated;

-- ============================================================
-- supporters (newsletter / updates opt-in). Private list.
-- ============================================================
create table public.supporters (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  opt_in boolean not null,
  consent_at timestamptz not null default now(),
  unsubscribe_token uuid not null default gen_random_uuid(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint supporter_email_len check (char_length(email) between 3 and 254),
  constraint supporter_name_len check (name is null or char_length(name) <= 120)
);

alter table public.supporters enable row level security;
alter table public.supporters force row level security;

-- Explicit opt-in enforced at the database: a row cannot be created without it.
create policy supporters_insert_optin on public.supporters
  for insert to anon, authenticated
  with check (
    opt_in = true
    and char_length(email) between 3 and 254
    and (name is null or char_length(name) <= 120)
    and unsubscribed_at is null
  );

-- Private list: only staff who run communications may read it.
create policy supporters_select_staff on public.supporters
  for select to authenticated
  using (public.is_admin() or public.has_role(auth.uid(), 'communications'));

create policy supporters_update_staff on public.supporters
  for update to authenticated
  using (public.is_admin() or public.has_role(auth.uid(), 'communications'))
  with check (public.is_admin() or public.has_role(auth.uid(), 'communications'));

revoke delete on public.supporters from anon, authenticated, service_role;

-- Explicit least-privilege grants (RLS still gates every row).
grant insert on public.supporters to anon, authenticated;
grant select, update on public.supporters to authenticated;
