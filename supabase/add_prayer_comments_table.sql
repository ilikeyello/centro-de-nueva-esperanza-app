-- =====================================================
-- PRAYER REQUEST COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.prayer_comments (
  id BIGSERIAL PRIMARY KEY,
  prayer_request_id BIGINT NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES public.church_info(organization_id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_id TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prayer_comments_request ON public.prayer_comments(prayer_request_id);
CREATE INDEX IF NOT EXISTS idx_prayer_comments_org ON public.prayer_comments(organization_id);
CREATE INDEX IF NOT EXISTS idx_prayer_comments_date ON public.prayer_comments(created_at DESC);

ALTER TABLE public.prayer_comments ENABLE ROW LEVEL SECURITY;

-- Allow public to read comments
CREATE POLICY "Public read prayer comments" ON public.prayer_comments FOR SELECT USING (true);

-- Allow public to insert comments (user-generated content)
CREATE POLICY "Public insert prayer comments" ON public.prayer_comments FOR INSERT WITH CHECK (true);

-- Only service role can update/delete
CREATE POLICY "Service role full prayer comments" ON public.prayer_comments FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- UPDATE PRAYER REQUESTS TO ALLOW PUBLIC INSERT
-- =====================================================
-- Add policy to allow public users to create prayer requests
CREATE POLICY "Public insert prayer requests" ON public.prayer_requests FOR INSERT WITH CHECK (true);
