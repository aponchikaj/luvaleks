-- =============================================================================
-- Features: timeline (milestones), map (places), music (songs),
--           guestbook, reactions (hearts)
-- =============================================================================

-- Generic site-wide insert brake: rate_limit(max_rows, 'interval').
create or replace function public.rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent bigint;
begin
  execute format(
    'select count(*) from %I.%I where created_at > now() - $1::interval',
    tg_table_schema, tg_table_name
  ) into recent using tg_argv[1];
  if recent >= tg_argv[0]::bigint then
    raise exception 'Too many submissions right now — try again in a few minutes.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- places: pins on "map of us"
-- -----------------------------------------------------------------------------
create table public.places (
  id          bigint generated always as identity primary key,
  name        text not null check (length(name) between 1 and 120),
  description text check (length(description) <= 1000),
  lat         double precision not null check (lat between -90 and 90),
  lng         double precision not null check (lng between -180 and 180),
  visited_on  date,
  emoji       text not null default '♥' check (length(emoji) between 1 and 8),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index places_visited_on_idx on public.places (visited_on);

create trigger places_set_updated_at
  before update on public.places
  for each row execute function public.set_updated_at();

-- A photo can belong to a place; a place shows all its photos.
alter table public.photos
  add column place_id bigint references public.places (id) on delete set null;
create index photos_place_id_idx on public.photos (place_id);

-- -----------------------------------------------------------------------------
-- milestones: the timeline
-- -----------------------------------------------------------------------------
create table public.milestones (
  id          bigint generated always as identity primary key,
  title       text not null check (length(title) between 1 and 120),
  description text check (length(description) <= 2000),
  happened_on date not null,
  emoji       text not null default '♥' check (length(emoji) between 1 and 8),
  photo_id    bigint references public.photos (id) on delete set null,
  place_id    bigint references public.places (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index milestones_happened_on_idx on public.milestones (happened_on);
create index milestones_photo_id_idx    on public.milestones (photo_id);
create index milestones_place_id_idx    on public.milestones (place_id);

create trigger milestones_set_updated_at
  before update on public.milestones
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- songs: "our songs" player (Spotify links)
-- -----------------------------------------------------------------------------
create table public.songs (
  id          bigint generated always as identity primary key,
  title       text not null check (length(title) between 1 and 200),
  artist      text check (length(artist) <= 200),
  spotify_url text not null unique
              check (spotify_url ~ '^https://open\.spotify\.com/(intl-[a-z]+/)?(track|album|playlist|episode)/[A-Za-z0-9]+'),
  note        text check (length(note) <= 280),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index songs_sort_idx on public.songs (sort_order, created_at);

-- -----------------------------------------------------------------------------
-- guestbook: visitors leave wishes; shown only after we approve them
-- -----------------------------------------------------------------------------
create table public.guestbook_entries (
  id          bigint generated always as identity primary key,
  name        text not null check (length(name) between 1 and 60),
  message     text not null check (length(message) between 1 and 500),
  is_approved boolean not null default false,
  created_at  timestamptz not null default now()
);

create index guestbook_approved_idx on public.guestbook_entries (is_approved, created_at desc);

create trigger guestbook_rate_limit
  before insert on public.guestbook_entries
  for each row execute function public.rate_limit('20', '10 minutes');

-- -----------------------------------------------------------------------------
-- reactions: anonymous hearts, one per browser (client_id) per item.
-- No direct table access for visitors — only via the functions below.
-- -----------------------------------------------------------------------------
create table public.reactions (
  id          bigint generated always as identity primary key,
  target_type text not null check (target_type in ('photo', 'note', 'milestone', 'guestbook')),
  target_id   bigint not null,
  client_id   uuid not null,
  created_at  timestamptz not null default now(),
  unique (target_type, target_id, client_id)
);

create index reactions_client_idx on public.reactions (client_id, created_at);

create or replace function public.reaction_target_exists(p_type text, p_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case p_type
    when 'photo'     then exists (select 1 from public.photos where id = p_id)
    when 'note'      then exists (select 1 from public.notes where id = p_id)
    when 'milestone' then exists (select 1 from public.milestones where id = p_id)
    when 'guestbook' then exists (select 1 from public.guestbook_entries where id = p_id and is_approved)
    else false
  end;
$$;

-- Toggle a heart. Returns the new count and whether this client has reacted.
create or replace function public.toggle_reaction(p_type text, p_id bigint, p_client uuid)
returns table (count bigint, reacted boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed boolean;
begin
  if not public.reaction_target_exists(p_type, p_id) then
    raise exception 'Nothing to react to' using errcode = 'P0002';
  end if;

  delete from public.reactions
  where target_type = p_type and target_id = p_id and client_id = p_client;
  removed := found;

  if not removed then
    if (select count(*) from public.reactions
        where client_id = p_client and created_at > now() - interval '1 minute') >= 60 then
      raise exception 'Slow down a little ♥' using errcode = 'P0001';
    end if;
    insert into public.reactions (target_type, target_id, client_id)
    values (p_type, p_id, p_client)
    on conflict do nothing;
  end if;

  return query
    select count(*)::bigint, not removed
    from public.reactions
    where target_type = p_type and target_id = p_id;
end;
$$;

-- Batch counts for a list of items, plus whether this client reacted to each.
create or replace function public.reaction_counts(p_type text, p_ids bigint[], p_client uuid)
returns table (target_id bigint, count bigint, reacted boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select r.target_id, count(*)::bigint, bool_or(r.client_id = p_client)
  from public.reactions r
  where r.target_type = p_type and r.target_id = any (p_ids)
  group by r.target_id;
$$;

revoke all on function public.toggle_reaction(text, bigint, uuid) from public;
revoke all on function public.reaction_counts(text, bigint[], uuid) from public;
revoke all on function public.reaction_target_exists(text, bigint) from public, anon, authenticated;
grant execute on function public.toggle_reaction(text, bigint, uuid) to anon, authenticated;
grant execute on function public.reaction_counts(text, bigint[], uuid) to anon, authenticated;

-- Remove hearts when the thing they point at is deleted.
create or replace function public.delete_reactions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.reactions where target_type = tg_argv[0] and target_id = old.id;
  return old;
end;
$$;

create trigger photos_delete_reactions     after delete on public.photos
  for each row execute function public.delete_reactions('photo');
create trigger notes_delete_reactions      after delete on public.notes
  for each row execute function public.delete_reactions('note');
create trigger milestones_delete_reactions after delete on public.milestones
  for each row execute function public.delete_reactions('milestone');
create trigger guestbook_delete_reactions  after delete on public.guestbook_entries
  for each row execute function public.delete_reactions('guestbook');

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.places            enable row level security;
alter table public.milestones        enable row level security;
alter table public.songs             enable row level security;
alter table public.guestbook_entries enable row level security;
alter table public.reactions         enable row level security;

-- Public-read, admin-write tables.
do $$
declare
  t text;
begin
  foreach t in array array['places', 'milestones', 'songs'] loop
    execute format('create policy "%1$s are public" on public.%1$I for select to anon, authenticated using (true)', t);
    execute format('create policy "admins insert %1$s" on public.%1$I for insert to authenticated with check ((select public.is_admin()))', t);
    execute format('create policy "admins update %1$s" on public.%1$I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format('create policy "admins delete %1$s" on public.%1$I for delete to authenticated using ((select public.is_admin()))', t);
  end loop;
end;
$$;

-- guestbook
create policy "approved entries are public"
  on public.guestbook_entries for select
  to anon, authenticated
  using (is_approved or (select public.is_admin()));

create policy "anyone can sign the guestbook"
  on public.guestbook_entries for insert
  to anon, authenticated
  with check (is_approved = false);

create policy "admins update guestbook"
  on public.guestbook_entries for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admins delete guestbook"
  on public.guestbook_entries for delete
  to authenticated
  using ((select public.is_admin()));

-- reactions: admins may look; everyone else goes through the functions.
create policy "admins read reactions"
  on public.reactions for select
  to authenticated
  using ((select public.is_admin()));

-- -----------------------------------------------------------------------------
-- Realtime
-- -----------------------------------------------------------------------------
alter publication supabase_realtime
  add table public.places, public.milestones, public.songs, public.guestbook_entries;
