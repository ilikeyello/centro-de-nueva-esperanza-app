-- Add livestream status field to church_info table
ALTER TABLE church_info 
ADD COLUMN livestream_status TEXT DEFAULT 'offline',
ADD COLUMN livestream_url TEXT,
ADD COLUMN livestream_started_at TIMESTAMP;
