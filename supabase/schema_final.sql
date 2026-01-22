-- =====================================================
-- MULTI-CHURCH PLATFORM DATABASE SCHEMA
-- =====================================================
-- Single language fields - each church uses their preferred language

-- Drop all tables
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
CREATE TABLE public.church_info (
  organization_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT DEFAULT 'To be updated',
  phone TEXT DEFAULT 'To be updated',
  email TEXT DEFAULT 'To be updated',
  service_times TEXT DEFAULT 'To be updated',
  description TEXT,
  facebook_page_url TEXT,
  website_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.church_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read church_info" ON public.church_info FOR SELECT USING (true);
CREATE POLICY "Service role full church_info" ON public.church_info FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 2. SERMONS TABLE
-- =====================================================
CREATE TABLE public.sermons (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES public.church_info(organization_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  description TEXT,
  speaker TEXT,
  sermon_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX idx_sermons_org ON public.sermons(organization_id);
CREATE INDEX idx_sermons_date ON public.sermons(created_at DESC);

ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read sermons" ON public.sermons FOR SELECT USING (true);
CREATE POLICY "Service role full sermons" ON public.sermons FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 3. EVENTS TABLE
-- =====================================================
CREATE TABLE public.events (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES public.church_info(organization_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  max_attendees INTEGER,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_org ON public.events(organization_id);
CREATE INDEX idx_events_date ON public.events(event_date);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Service role full events" ON public.events FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 4. EVENT RSVPS TABLE
-- =====================================================
CREATE TABLE public.event_rsvps (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_rsvps_event ON public.event_rsvps(event_id);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read rsvps" ON public.event_rsvps FOR SELECT USING (true);
CREATE POLICY "Service role full rsvps" ON public.event_rsvps FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 5. ANNOUNCEMENTS TABLE
-- =====================================================
CREATE TABLE public.announcements (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES public.church_info(organization_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL,
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_announcements_org ON public.announcements(organization_id);
CREATE INDEX idx_announcements_priority ON public.announcements(priority);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Service role full announcements" ON public.announcements FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 6. PRAYER REQUESTS TABLE
-- =====================================================
CREATE TABLE public.prayer_requests (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES public.church_info(organization_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  user_id TEXT,
  user_name TEXT,
  prayer_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prayers_org ON public.prayer_requests(organization_id);
CREATE INDEX idx_prayers_date ON public.prayer_requests(created_at DESC);

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read prayers" ON public.prayer_requests FOR SELECT USING (true);
CREATE POLICY "Service role full prayers" ON public.prayer_requests FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 7. BULLETIN POSTS TABLE
-- =====================================================
CREATE TABLE public.bulletin_posts (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES public.church_info(organization_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bulletin_org ON public.bulletin_posts(organization_id);
CREATE INDEX idx_bulletin_date ON public.bulletin_posts(created_at DESC);

ALTER TABLE public.bulletin_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read bulletin" ON public.bulletin_posts FOR SELECT USING (true);
CREATE POLICY "Service role full bulletin" ON public.bulletin_posts FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 8. DEVOTIONALS TABLE
-- =====================================================
CREATE TABLE public.devotionals (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES public.church_info(organization_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  scripture_reference TEXT,
  author TEXT,
  publish_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX idx_devotionals_org ON public.devotionals(organization_id);
CREATE INDEX idx_devotionals_date ON public.devotionals(publish_date DESC);

ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read devotionals" ON public.devotionals FOR SELECT USING (true);
CREATE POLICY "Service role full devotionals" ON public.devotionals FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 9. MUSIC PLAYLISTS TABLE
-- =====================================================
CREATE TABLE public.music_playlists (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES public.church_info(organization_id) ON DELETE CASCADE,
  playlist_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX idx_playlists_org ON public.music_playlists(organization_id);

ALTER TABLE public.music_playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read playlists" ON public.music_playlists FOR SELECT USING (true);
CREATE POLICY "Service role full playlists" ON public.music_playlists FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 10. LIVESTREAMS TABLE
-- =====================================================
CREATE TABLE public.livestreams (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES public.church_info(organization_id) ON DELETE CASCADE,
  stream_url TEXT NOT NULL,
  title TEXT,
  is_live BOOLEAN DEFAULT false,
  scheduled_start TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX idx_livestreams_org ON public.livestreams(organization_id);

ALTER TABLE public.livestreams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read livestreams" ON public.livestreams FOR SELECT USING (true);
CREATE POLICY "Service role full livestreams" ON public.livestreams FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 11. GAMES TABLE
-- =====================================================
CREATE TABLE public.games (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES public.church_info(organization_id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('trivia', 'word_search', 'graveyard_shift')),
  title TEXT NOT NULL,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX idx_games_org ON public.games(organization_id);
CREATE INDEX idx_games_type ON public.games(game_type);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Service role full games" ON public.games FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 12. GALLERY IMAGES TABLE
-- =====================================================
CREATE TABLE public.gallery_images (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES public.church_info(organization_id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

CREATE INDEX idx_gallery_org ON public.gallery_images(organization_id);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read gallery" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Service role full gallery" ON public.gallery_images FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_church_info_updated_at BEFORE UPDATE ON public.church_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bulletin_posts_updated_at BEFORE UPDATE ON public.bulletin_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_music_playlists_updated_at BEFORE UPDATE ON public.music_playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_livestreams_updated_at BEFORE UPDATE ON public.livestreams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERT TEST DATA
-- =====================================================
INSERT INTO public.church_info (organization_id, name, created_by)
VALUES ('org_38agxTQYvbrRSYd2jdxcfL5DGXf', 'Centro de Nueva Esperanza', 'system')
ON CONFLICT (organization_id) DO NOTHING;
