-- Verify author_id column exists and is properly set up
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM 
  information_schema.columns 
WHERE 
  table_name = 'bulletin_posts' 
  AND column_name = 'author_id';

-- Check if index exists
SELECT 
  indexname, 
  indexdef 
FROM 
  pg_indexes 
WHERE 
  tablename = 'bulletin_posts' 
  AND indexname = 'idx_bulletin_posts_author_id';

-- Sample posts to verify authorId is working
SELECT 
  id, 
  title, 
  author_name, 
  author_id, 
  created_at
FROM 
  bulletin_posts 
LIMIT 5;
