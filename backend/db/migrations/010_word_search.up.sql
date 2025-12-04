-- Word search levels
CREATE TABLE word_search_levels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rows INTEGER NOT NULL DEFAULT 12,
  cols INTEGER NOT NULL DEFAULT 12,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Word search words
CREATE TABLE word_search_words (
  id BIGSERIAL PRIMARY KEY,
  level_id TEXT NOT NULL REFERENCES word_search_levels(id) ON DELETE CASCADE,
  word_en TEXT NOT NULL,
  word_es TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
