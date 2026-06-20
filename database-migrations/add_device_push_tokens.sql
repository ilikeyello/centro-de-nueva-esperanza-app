-- Device push tokens for native iOS / Android apps (Capacitor)
-- These are APNs (iOS) and FCM (Android) tokens, separate from
-- the existing web-push VAPID subscriptions.

create table if not exists device_push_tokens (
  id           bigserial primary key,
  org_id       text        not null,
  token        text        not null unique,
  platform     text        not null check (platform in ('ios', 'android', 'web')),
  device_id    text,
  language     text        not null default 'en',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Index for org-level queries (sending to all members of a church)
create index if not exists device_push_tokens_org_id_idx on device_push_tokens (org_id);

-- RLS: allow the anon/service role to insert and update tokens from the app
alter table device_push_tokens enable row level security;

create policy "Allow insert device tokens" on device_push_tokens
  for insert with check (true);

create policy "Allow update own device token" on device_push_tokens
  for update using (true);

create policy "Allow delete own device token" on device_push_tokens
  for delete using (true);

-- Service role can read all (for Edge Functions sending notifications)
create policy "Service role can read all tokens" on device_push_tokens
  for select using (true);
