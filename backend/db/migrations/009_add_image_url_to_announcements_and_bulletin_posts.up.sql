-- Add optional image URLs to announcements and bulletin posts
ALTER TABLE announcements
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE bulletin_posts
  ADD COLUMN IF NOT EXISTS image_url TEXT;
