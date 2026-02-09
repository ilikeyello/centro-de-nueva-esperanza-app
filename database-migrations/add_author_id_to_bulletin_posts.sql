-- Add author_id column to bulletin_posts table for comment notifications
ALTER TABLE bulletin_posts 
ADD COLUMN author_id TEXT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_bulletin_posts_author_id ON bulletin_posts(author_id);

-- Add comment to explain the purpose
COMMENT ON COLUMN bulletin_posts.author_id IS 'UUID of the user who created this post, used for notifications';
