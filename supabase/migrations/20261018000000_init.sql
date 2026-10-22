-- =============================================================================
-- Lazare & Aleksa — initial schema
-- Tables: profiles (admins), photos (Cloudinary-backed gallery),
--         notes (sticky-note board), messages ("send us a message" inbox)
-- Access model: everyone can READ photos/notes and WRITE messages;
--               only admins (profiles.is_admin) can write photos/notes and read messages.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles: one row per auth user. Only Lazare & Aleksa should ever exist here.
-- -----------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (length(display_name) between 1 and 40),
  avatar_url   text,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Auto-create a profile when an auth user is created (from the dashboard).
-- is_admin stays false until flipped manually — see supabase/seed.sql.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- security definer so RLS policies can call it without recursion on profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin
  );
$$;

-- -----------------------------------------------------------------------------
-- photos: metadata only; the binary lives in Cloudinary.
-- -----------------------------------------------------------------------------
create table public.photos (
  id          bigint generated always as identity primary key,
  public_id   text not null unique,             -- Cloudinary public_id
  url         text not null,                    -- Cloudinary secure_url
  width       integer check (width > 0),
  height      integer check (height > 0),
  format      text,
  caption     text check (length(caption) <= 280),
  taken_on    date,
  tags        text[] not null default '{}',
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index photos_taken_on_idx    on public.photos (taken_on desc nulls last, created_at desc);
create index photos_uploaded_by_idx on public.photos (uploaded_by);
create index photos_tags_idx        on public.photos using gin (tags);

create trigger photos_set_updated_at
  before update on public.photos
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- notes: sticky notes on a shared board. Positions are relative (0..1) so the
-- board layout survives any screen size.
-- -----------------------------------------------------------------------------
create table public.notes (
  id         bigint generated always as identity primary key,
  content    text not null check (length(content) between 1 and 500),
  color      text not null default 'blue'
             check (color in ('blue', 'sky', 'yellow', 'pink', 'mint', 'white')),
  pos_x      double precision not null default 0.5 check (pos_x between 0 and 1),
  pos_y      double precision not null default 0.5 check (pos_y between 0 and 1),
  rotation   double precision not null default 0 check (rotation between -15 and 15),
  is_pinned  boolean not null default false,
  author_id  uuid references public.profiles (id) on delete set null,
  to_id      uuid references public.profiles (id) on delete set null, -- who it's for (optional)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notes_created_at_idx on public.notes (created_at desc);
create index notes_author_id_idx  on public.notes (author_id);
create index notes_to_id_idx      on public.notes (to_id);

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- messages: public "send us a message" inbox. Write-only for visitors.
-- -----------------------------------------------------------------------------
create table public.messages (
  id         bigint generated always as identity primary key,
  name       text not null check (length(name) between 1 and 80),
  email      text check (email is null or (length(email) <= 254 and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  content    text not null check (length(content) between 1 and 2000),
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index messages_inbox_idx on public.messages (is_read, created_at desc);

-- Basic spam brake: at most 20 messages site-wide per 10 minutes.
create or replace function public.messages_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(*) from public.messages where created_at > now() - interval '10 minutes') >= 20 then
    raise exception 'Too many messages right now — try again in a few minutes.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger messages_rate_limit
  before insert on public.messages
  for each row execute function public.messages_rate_limit();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.photos   enable row level security;
alter table public.notes    enable row level security;
alter table public.messages enable row level security;

-- profiles: names/avatars are public (shown on notes); users may edit only
-- their own name/avatar — never is_admin (enforced by column grants below).
create policy "profiles are public"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "users update own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;

-- photos
create policy "photos are public"
  on public.photos for select
  to anon, authenticated
  using (true);

create policy "admins insert photos"
  on public.photos for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "admins update photos"
  on public.photos for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admins delete photos"
  on public.photos for delete
  to authenticated
  using ((select public.is_admin()));

-- notes
create policy "notes are public"
  on public.notes for select
  to anon, authenticated
  using (true);

create policy "admins insert notes"
  on public.notes for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "admins update notes"
  on public.notes for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admins delete notes"
  on public.notes for delete
  to authenticated
  using ((select public.is_admin()));

-- messages: anyone can send (unread only); only admins can read/manage.
create policy "anyone can send a message"
  on public.messages for insert
  to anon, authenticated
  with check (is_read = false);

create policy "admins read messages"
  on public.messages for select
  to authenticated
  using ((select public.is_admin()));

create policy "admins update messages"
  on public.messages for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admins delete messages"
  on public.messages for delete
  to authenticated
  using ((select public.is_admin()));

-- -----------------------------------------------------------------------------
-- Realtime: live sticky-note board, gallery and admin inbox.
-- (RLS still applies to realtime — visitors never receive message rows.)
-- -----------------------------------------------------------------------------
alter publication supabase_realtime add table public.notes, public.photos, public.messages;
