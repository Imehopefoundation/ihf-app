-- LMS videos (mentors post a YouTube/Vimeo link; mentees watch).
--
-- Only the provider + opaque video id are stored (validated by the app, see
-- src/lib/video.ts); never a raw URL. RLS gives mentors control of their own
-- posts and lets mentees/mentors/admin watch.

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  posted_by uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  provider text not null,
  video_ref text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint video_provider_chk check (provider in ('youtube', 'vimeo')),
  constraint video_title_len check (char_length(title) between 1 and 160),
  constraint video_desc_len check (description is null or char_length(description) <= 2000),
  constraint video_ref_len check (char_length(video_ref) between 1 and 64)
);

alter table public.videos enable row level security;
alter table public.videos force row level security;

create trigger videos_set_updated_at before update on public.videos
  for each row execute function public.set_updated_at();

create index videos_posted_by_idx on public.videos (posted_by);
create index videos_created_at_idx on public.videos (created_at desc);

-- Watch: any mentor, mentee or admin may view the library.
create policy videos_select on public.videos
  for select to authenticated
  using (
    (select public.is_admin())
    or public.has_role((select auth.uid()), 'mentor')
    or public.has_role((select auth.uid()), 'mentee')
  );

-- Post: a mentor (or admin) inserts rows owned by themselves.
create policy videos_insert on public.videos
  for insert to authenticated
  with check (
    posted_by = (select auth.uid())
    and ((select public.is_admin()) or public.has_role((select auth.uid()), 'mentor'))
  );

-- Manage: only the posting mentor or an admin may edit / delete.
create policy videos_update on public.videos
  for update to authenticated
  using (posted_by = (select auth.uid()) or (select public.is_admin()))
  with check (posted_by = (select auth.uid()) or (select public.is_admin()));

create policy videos_delete on public.videos
  for delete to authenticated
  using (posted_by = (select auth.uid()) or (select public.is_admin()));

grant select, insert, update, delete on public.videos to authenticated;
revoke all on public.videos from anon;
