-- Applied 2026-11-24 to the Church Database project.
-- Picture the app shows in the livestream box when the church isn't live.
-- Set from the dashboard's Livestream tab (emanuel-web-design: api/livestream-offline-image).
alter table public.church_info add column if not exists livestream_offline_image_url text;
