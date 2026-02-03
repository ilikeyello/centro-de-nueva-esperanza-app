-- =====================================================
-- FIX BULLETIN RLS FOR PUBLIC POSTING/COMMENTING
-- =====================================================
-- Goal:
-- - Church site uses Supabase anon key.
-- - RLS must allow INSERT for unauthenticated/public users.
--
-- This file is safe to run multiple times.

-- Ensure RLS is enabled (should already be)
ALTER TABLE public.bulletin_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulletin_comments ENABLE ROW LEVEL SECURITY;

-- Public SELECT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bulletin_posts'
      AND policyname = 'Public read access for bulletin_posts'
  ) THEN
    CREATE POLICY "Public read access for bulletin_posts" ON public.bulletin_posts
      FOR SELECT USING (true);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bulletin_comments'
      AND policyname = 'Public read comments'
  ) THEN
    CREATE POLICY "Public read comments" ON public.bulletin_comments
      FOR SELECT USING (true);
  END IF;
END$$;

-- Public INSERT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bulletin_posts'
      AND policyname = 'Public insert bulletin posts'
  ) THEN
    CREATE POLICY "Public insert bulletin posts" ON public.bulletin_posts
      FOR INSERT WITH CHECK (true);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bulletin_comments'
      AND policyname = 'Public insert comments'
  ) THEN
    CREATE POLICY "Public insert comments" ON public.bulletin_comments
      FOR INSERT WITH CHECK (true);
  END IF;
END$$;

-- Service role full access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bulletin_posts'
      AND policyname = 'Service role full access for bulletin_posts'
  ) THEN
    CREATE POLICY "Service role full access for bulletin_posts" ON public.bulletin_posts
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'bulletin_comments'
      AND policyname = 'Service role full comments'
  ) THEN
    CREATE POLICY "Service role full comments" ON public.bulletin_comments
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END$$;
