-- =============================================================================
-- Desktop wallpaper (admin-editable) + emoji → symbol names
-- =============================================================================

-- -----------------------------------------------------------------------------
-- site_settings: exactly one row (id is always true)
-- -----------------------------------------------------------------------------
create table public.site_settings (
  id                  boolean primary key default true check (id),
  -- Built-in gradient wallpaper, used when no image is set.
  wallpaper_preset    text not null default 'blue'
                      check (wallpaper_preset in ('blue', 'midnight', 'dawn', 'aqua', 'graphite')),
  -- Cloudinary image (from the photo library or uploaded just for the desktop).
  wallpaper_public_id text check (length(wallpaper_public_id) <= 255),
  updated_at          timestamptz not null default now()
);

insert into public.site_settings default values;

create trigger site_settings_touch
  before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

create policy "settings are public"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "admins update settings"
  on public.site_settings for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- No insert/delete policies: the single row is created above and can't be removed.

alter publication supabase_realtime add table public.site_settings;

-- -----------------------------------------------------------------------------
-- places.emoji / milestones.emoji now hold a symbol name (see src/components/icons/Symbol.jsx).
-- The column keeps its name; old emoji values still render via a legacy map.
-- -----------------------------------------------------------------------------
alter table public.places     alter column emoji set default 'heart';
alter table public.milestones alter column emoji set default 'heart';
alter table public.places     drop constraint if exists places_emoji_check;
alter table public.milestones drop constraint if exists milestones_emoji_check;
alter table public.places     add constraint places_emoji_check     check (length(emoji) between 1 and 32);
alter table public.milestones add constraint milestones_emoji_check check (length(emoji) between 1 and 32);
update public.places     set emoji = 'heart' where emoji = '♥';
update public.milestones set emoji = 'heart' where emoji = '♥';

comment on column public.places.emoji     is 'Symbol name, e.g. heart, airplane, cup';
comment on column public.milestones.emoji is 'Symbol name, e.g. heart, airplane, cup';
