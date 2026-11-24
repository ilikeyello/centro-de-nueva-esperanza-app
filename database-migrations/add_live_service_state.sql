-- Applied 2026-11-24 to the Church Database project.
-- What part of the service is on right now, driven by OBS through the
-- obs-live-control edge function. The app reads it (realtime) to change the
-- button under the livestream player.
create table if not exists public.live_service_state (
  organization_id text primary key,
  mode text not null default 'off' check (mode in ('off', 'worship', 'offering', 'sermon')),
  song_title text,
  verse jsonb,
  show_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.live_service_state enable row level security;

drop policy if exists "Public read live_service_state" on public.live_service_state;
create policy "Public read live_service_state" on public.live_service_state
  for select using (true);

-- One secret per church for the OBS dock. Only the hash is stored, and no
-- policies means only the service role (edge function) can read it.
-- Add a church:  insert into live_control_keys (organization_id, key_hash)
--                values ('<org id>', encode(sha256('<key>'::bytea), 'hex'));
create table if not exists public.live_control_keys (
  organization_id text primary key,
  key_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.live_control_keys enable row level security;

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'live_service_state'
  ) then
    alter publication supabase_realtime add table public.live_service_state;
  end if;
end $$;
