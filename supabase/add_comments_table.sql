-- =====================================================
-- BULLETIN POST COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bulletin_comments (
  id BIGSERIAL PRIMARY KEY,
  bulletin_post_id BIGINT NOT NULL REFERENCES public.bulletin_posts(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES public.church_info(organization_id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_id TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON public.bulletin_comments(bulletin_post_id);
CREATE INDEX idx_comments_org ON public.bulletin_comments(organization_id);
CREATE INDEX idx_comments_date ON public.bulletin_comments(created_at DESC);

ALTER TABLE public.bulletin_comments ENABLE ROW LEVEL SECURITY;

-- Allow public to read comments
CREATE POLICY "Public read comments" ON public.bulletin_comments FOR SELECT USING (true);

-- Allow public to insert comments (user-generated content)
CREATE POLICY "Public insert comments" ON public.bulletin_comments FOR INSERT WITH CHECK (true);

-- Only service role can update/delete
CREATE POLICY "Service role full comments" ON public.bulletin_comments FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- UPDATE BULLETIN POSTS TO ALLOW PUBLIC INSERT
-- =====================================================
-- Add policy to allow public users to create bulletin posts
CREATE POLICY "Public insert bulletin posts" ON public.bulletin_posts FOR INSERT WITH CHECK (true);
