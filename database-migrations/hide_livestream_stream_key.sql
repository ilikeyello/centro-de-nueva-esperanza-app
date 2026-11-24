-- Applied 2026-11-24 to the Church Database project.
-- The Mux stream key lets anyone stream to the church's channel, but the
-- "Public read livestreams" policy let the public app key read every column.
-- Public (anon) and signed-in (authenticated) users can now read every column
-- except mux_stream_key. The dashboard reads it through the server's service
-- role, which is not affected.
-- NOTE: a column added to livestreams later must be added to this grant
-- before the app can read it.
revoke select on public.livestreams from anon, authenticated;
grant select (
  id, organization_id, stream_url, title, is_live, scheduled_start,
  created_at, updated_at, created_by, mux_stream_id, mux_playback_id, mux_status
) on public.livestreams to anon, authenticated;
