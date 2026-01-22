-- =====================================================
-- MULTI-CHURCH PLATFORM DATABASE SCHEMA (CLEAN INSTALL)
-- =====================================================
-- Run this to drop existing tables and create fresh ones

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS gallery_images CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS livestreams CASCADE;
DROP TABLE IF EXISTS music_playlists CASCADE;
DROP TABLE IF EXISTS devotionals CASCADE;
DROP TABLE IF EXISTS bulletin_posts CASCADE;
DROP TABLE IF EXISTS prayer_requests CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS event_rsvps CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS sermons CASCADE;
DROP TABLE IF EXISTS church_info CASCADE;

-- =====================================================
-- 1. CHURCH INFO TABLE
-- =====================================================
CREATE TABLE church_info (
  organization_id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_es TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  service_times_en TEXT,
  service_times_es TEXT,
  description_en TEXT,
  description_es TEXT,
  facebook_page_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE church_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for church_info" ON church_info FOR SELECT USING (true);
CREATE POLICY "Service role full access for church_info" ON church_info FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 2. SERMONS TABLE
-- =====================================================
CREATE TABLE sermons (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES church_info(organization_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  description TEXT,
  speaker TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX idx_sermons_org_id ON sermons(organization_id);
CREATE INDEX idx_sermons_created_at ON sermons(created_at DESC);

ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for sermons" ON sermons FOR SELECT USING (true);
CREATE POLICY "Service role full access for sermons" ON sermons FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 3. EVENTS TABLE
-- =====================================================
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES church_info(organization_id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_es TEXT NOT NULL,
  description_en TEXT,
  description_es TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  max_attendees INTEGER,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_org_id ON events(organization_id);
CREATE INDEX idx_events_date ON events(event_date);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for events" ON events FOR SELECT USING (true);
CREATE POLICY "Service role full access for events" ON events FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 4. EVENT RSVPS TABLE
-- =====================================================
CREATE TABLE event_rsvps (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_rsvps_event_id ON event_rsvps(event_id);

ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for event_rsvps" ON event_rsvps FOR SELECT USING (true);
CREATE POLICY "Service role full access for event_rsvps" ON event_rsvps FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 5. ANNOUNCEMENTS TABLE
-- =====================================================
CREATE TABLE announcements (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES church_info(organization_id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_es TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_es TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL,
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_announcements_org_id ON announcements(organization_id);
CREATE INDEX idx_announcements_priority ON announcements(priority);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Service role full access for announcements" ON announcements FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 6. PRAYER REQUESTS TABLE
-- =====================================================
CREATE TABLE prayer_requests (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES church_info(organization_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  user_id TEXT,
  user_name TEXT,
  prayer_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prayer_requests_org_id ON prayer_requests(organization_id);
CREATE INDEX idx_prayer_requests_created_at ON prayer_requests(created_at DESC);

ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for prayer_requests" ON prayer_requests FOR SELECT USING (true);
CREATE POLICY "Service role full access for prayer_requests" ON prayer_requests FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 7. BULLETIN POSTS TABLE
-- =====================================================
CREATE TABLE bulletin_posts (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES church_info(organization_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bulletin_posts_org_id ON bulletin_posts(organization_id);
CREATE INDEX idx_bulletin_posts_created_at ON bulletin_posts(created_at DESC);

ALTER TABLE bulletin_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for bulletin_posts" ON bulletin_posts FOR SELECT USING (true);
CREATE POLICY "Service role full access for bulletin_posts" ON bulletin_posts FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 8. DEVOTIONALS TABLE
-- =====================================================
CREATE TABLE devotionals (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES church_info(organization_id) ON DELETE CASCADE,
  title_en TEXT NOT NULL,
  title_es TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_es TEXT NOT NULL,
  scripture_reference TEXT,
  author TEXT,
  publish_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX idx_devotionals_org_id ON devotionals(organization_id);
CREATE INDEX idx_devotionals_publish_date ON devotionals(publish_date DESC);

ALTER TABLE devotionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for devotionals" ON devotionals FOR SELECT USING (true);
CREATE POLICY "Service role full access for devotionals" ON devotionals FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 9. MUSIC PLAYLISTS TABLE
-- =====================================================
CREATE TABLE music_playlists (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES church_info(organization_id) ON DELETE CASCADE,
  playlist_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX idx_music_playlists_org_id ON music_playlists(organization_id);

ALTER TABLE music_playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for music_playlists" ON music_playlists FOR SELECT USING (true);
CREATE POLICY "Service role full access for music_playlists" ON music_playlists FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 10. LIVESTREAMS TABLE
-- =====================================================
CREATE TABLE livestreams (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES church_info(organization_id) ON DELETE CASCADE,
  stream_url TEXT NOT NULL,
  title TEXT,
  is_live BOOLEAN DEFAULT false,
  scheduled_start TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX idx_livestreams_org_id ON livestreams(organization_id);

ALTER TABLE livestreams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for livestreams" ON livestreams FOR SELECT USING (true);
CREATE POLICY "Service role full access for livestreams" ON livestreams FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 11. GAMES TABLE
-- =====================================================
CREATE TABLE games (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES church_info(organization_id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('trivia', 'word_search', 'graveyard_shift')),
  title_en TEXT NOT NULL,
  title_es TEXT NOT NULL,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX idx_games_org_id ON games(organization_id);
CREATE INDEX idx_games_type ON games(game_type);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for games" ON games FOR SELECT USING (true);
CREATE POLICY "Service role full access for games" ON games FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 12. GALLERY IMAGES TABLE
-- =====================================================
CREATE TABLE gallery_images (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES church_info(organization_id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX idx_gallery_images_org_id ON gallery_images(organization_id);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for gallery_images" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Service role full access for gallery_images" ON gallery_images FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_church_info_updated_at BEFORE UPDATE ON church_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bulletin_posts_updated_at BEFORE UPDATE ON bulletin_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_music_playlists_updated_at BEFORE UPDATE ON music_playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_livestreams_updated_at BEFORE UPDATE ON livestreams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
