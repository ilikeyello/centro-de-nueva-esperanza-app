-- Bulletin posts table
CREATE TABLE bulletin_posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bulletin comments table
CREATE TABLE bulletin_comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES bulletin_posts(id) ON DELETE CASCADE,
  prayer_id BIGINT REFERENCES prayer_requests(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT bulletin_comments_target_check CHECK (
    ((post_id IS NOT NULL)::int + (prayer_id IS NOT NULL)::int) = 1
  )
);

CREATE INDEX bulletin_comments_post_idx ON bulletin_comments(post_id);
CREATE INDEX bulletin_comments_prayer_idx ON bulletin_comments(prayer_id);
