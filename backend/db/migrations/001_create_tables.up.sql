-- Events table
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_es TEXT NOT NULL,
  description_en TEXT,
  description_es TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  max_attendees INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT NOT NULL
);

-- Event RSVPs table
CREATE TABLE event_rsvps (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  attendees INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Announcements table
CREATE TABLE announcements (
  id BIGSERIAL PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_es TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_es TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT NOT NULL
);

-- Prayer requests table
CREATE TABLE prayer_requests (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  user_id TEXT NOT NULL,
  user_name TEXT,
  prayer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prayer interactions table
CREATE TABLE prayer_interactions (
  id BIGSERIAL PRIMARY KEY,
  prayer_id BIGINT NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prayer_id, user_id)
);

-- Donations table
CREATE TABLE donations (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT,
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_intent_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  donation_type TEXT DEFAULT 'general' CHECK (donation_type IN ('general', 'missions', 'building', 'other')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Church info table
CREATE TABLE church_info (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name_en TEXT NOT NULL,
  name_es TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  service_times_en TEXT NOT NULL,
  service_times_es TEXT NOT NULL,
  description_en TEXT,
  description_es TEXT,
  facebook_page_url TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION
);

-- Insert default church info
INSERT INTO church_info (name_en, name_es, address, phone, email, service_times_en, service_times_es)
VALUES (
  'Community Church',
  'Iglesia Comunitaria',
  '123 Main Street, City, State 12345',
  '(555) 123-4567',
  'info@communitychurch.org',
  'Sunday Service: 10:00 AM | Wednesday Bible Study: 7:00 PM',
  'Servicio Dominical: 10:00 AM | Estudio Bíblico Miércoles: 7:00 PM'
);
