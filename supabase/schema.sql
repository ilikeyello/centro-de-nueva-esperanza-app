-- =====================================================
-- MULTI-CHURCH PLATFORM DATABASE SCHEMA
-- =====================================================
-- This schema supports multiple church sites, each identified by organization_id from Clerk
-- All data is isolated per organization using Row Level Security (RLS)

-- =====================================================
-- 1. CHURCH INFO TABLE
-- =====================================================
-- Stores basic information about each church organization
CREATE TABLE IF NOT EXISTS church_info (
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

-- RLS Policies for church_info
ALTER TABLE church_info ENABLE ROW LEVEL SECURITY;

-- Allow public read access (church sites need to read their own info)
CREATE POLICY "Public read access for church_info" ON church_info
  FOR SELECT USING (true);

-- Allow service role to insert/update (for webhooks and admin)
CREATE POLICY "Service role full access for church_info" ON church_info
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 2. SERMONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sermons (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  description TEXT,
  speaker TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_sermons_org_id ON sermons(organization_id);
CREATE INDEX IF NOT EXISTS idx_sermons_created_at ON sermons(created_at DESC);

ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for sermons" ON sermons
  FOR SELECT USING (true);

CREATE POLICY "Service role full access for sermons" ON sermons
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 3. EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_events_org_id ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Service role full access for events" ON events
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 4. EVENT RSVPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS event_rsvps (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_rsvp_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON event_rsvps(event_id);

ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for event_rsvps" ON event_rsvps
  FOR SELECT USING (true);

CREATE POLICY "Service role full access for event_rsvps" ON event_rsvps
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 5. ANNOUNCEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS announcements (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_announcements_org_id ON announcements(organization_id);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for announcements" ON announcements
  FOR SELECT USING (true);

CREATE POLICY "Service role full access for announcements" ON announcements
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 6. PRAYER REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS prayer_requests (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  user_id TEXT,
  user_name TEXT,
  prayer_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prayer_requests_org_id ON prayer_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_created_at ON prayer_requests(created_at DESC);

ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for prayer_requests" ON prayer_requests
  FOR SELECT USING (true);

CREATE POLICY "Service role full access for prayer_requests" ON prayer_requests
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 7. BULLETIN POSTS TABLE (Community Board)
-- =====================================================
CREATE TABLE IF NOT EXISTS bulletin_posts (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bulletin_posts_org_id ON bulletin_posts(organization_id);
CREATE INDEX IF NOT EXISTS idx_bulletin_posts_created_at ON bulletin_posts(created_at DESC);

ALTER TABLE bulletin_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for bulletin_posts" ON bulletin_posts
  FOR SELECT USING (true);

CREATE POLICY "Service role full access for bulletin_posts" ON bulletin_posts
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 8. DEVOTIONALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS devotionals (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_devotionals_org_id ON devotionals(organization_id);
CREATE INDEX IF NOT EXISTS idx_devotionals_publish_date ON devotionals(publish_date DESC);

ALTER TABLE devotionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for devotionals" ON devotionals
  FOR SELECT USING (true);

CREATE POLICY "Service role full access for devotionals" ON devotionals
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 9. MUSIC PLAYLIST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS music_playlists (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL,
  playlist_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_music_playlists_org_id ON music_playlists(organization_id);

ALTER TABLE music_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for music_playlists" ON music_playlists
  FOR SELECT USING (true);

CREATE POLICY "Service role full access for music_playlists" ON music_playlists
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 10. LIVESTREAM TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS livestreams (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL,
  stream_url TEXT NOT NULL,
  title TEXT,
  is_live BOOLEAN DEFAULT false,
  scheduled_start TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_livestreams_org_id ON livestreams(organization_id);

ALTER TABLE livestreams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for livestreams" ON livestreams
  FOR SELECT USING (true);

CREATE POLICY "Service role full access for livestreams" ON livestreams
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 11. GAMES TABLE (Trivia, Word Search, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS games (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL,
  game_type TEXT NOT NULL CHECK (game_type IN ('trivia', 'word_search', 'graveyard_shift')),
  title_en TEXT NOT NULL,
  title_es TEXT NOT NULL,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_games_org_id ON games(organization_id);
CREATE INDEX IF NOT EXISTS idx_games_type ON games(game_type);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for games" ON games
  FOR SELECT USING (true);

CREATE POLICY "Service role full access for games" ON games
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 12. GALLERY IMAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS gallery_images (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_gallery_images_org_id ON gallery_images(organization_id);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for gallery_images" ON gallery_images
  FOR SELECT USING (true);

CREATE POLICY "Service role full access for gallery_images" ON gallery_images
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to relevant tables
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

-- =====================================================
-- FOREIGN KEY CONSTRAINTS
-- =====================================================
-- Add foreign keys after all tables are created to avoid dependency issues

ALTER TABLE sermons 
  ADD CONSTRAINT fk_sermons_org 
  FOREIGN KEY (organization_id) 
  REFERENCES church_info(organization_id) 
  ON DELETE CASCADE;

ALTER TABLE events 
  ADD CONSTRAINT fk_events_org 
  FOREIGN KEY (organization_id) 
  REFERENCES church_info(organization_id) 
  ON DELETE CASCADE;

ALTER TABLE announcements 
  ADD CONSTRAINT fk_announcements_org 
  FOREIGN KEY (organization_id) 
  REFERENCES church_info(organization_id) 
  ON DELETE CASCADE;

ALTER TABLE prayer_requests 
  ADD CONSTRAINT fk_prayer_requests_org 
  FOREIGN KEY (organization_id) 
  REFERENCES church_info(organization_id) 
  ON DELETE CASCADE;

ALTER TABLE bulletin_posts 
  ADD CONSTRAINT fk_bulletin_posts_org 
  FOREIGN KEY (organization_id) 
  REFERENCES church_info(organization_id) 
  ON DELETE CASCADE;

ALTER TABLE devotionals 
  ADD CONSTRAINT fk_devotionals_org 
  FOREIGN KEY (organization_id) 
  REFERENCES church_info(organization_id) 
  ON DELETE CASCADE;

ALTER TABLE music_playlists 
  ADD CONSTRAINT fk_music_playlists_org 
  FOREIGN KEY (organization_id) 
  REFERENCES church_info(organization_id) 
  ON DELETE CASCADE;

ALTER TABLE livestreams 
  ADD CONSTRAINT fk_livestreams_org 
  FOREIGN KEY (organization_id) 
  REFERENCES church_info(organization_id) 
  ON DELETE CASCADE;

ALTER TABLE games 
  ADD CONSTRAINT fk_games_org 
  FOREIGN KEY (organization_id) 
  REFERENCES church_info(organization_id) 
  ON DELETE CASCADE;

ALTER TABLE gallery_images 
  ADD CONSTRAINT fk_gallery_images_org 
  FOREIGN KEY (organization_id) 
  REFERENCES church_info(organization_id) 
  ON DELETE CASCADE;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. All tables use organization_id to isolate data per church
-- 2. RLS policies allow public read access (church sites are public)
-- 3. Only service_role can write (admin dashboard uses service key)
-- 4. Foreign keys ensure data integrity (added after table creation)
-- 5. Indexes optimize queries by organization_id
