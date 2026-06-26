-- =====================================================
-- CONTENT REPORTS TABLE
-- Lets users flag bulletin comments and prayer requests/comments as
-- inappropriate. Reports are write-only from the client; only the
-- service role can read them (moderation happens outside the app for now).
-- =====================================================
CREATE TABLE IF NOT EXISTS public.content_reports (
  id BIGSERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES public.church_info(organization_id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('bulletin_post', 'bulletin_comment', 'prayer_request', 'prayer_comment')),
  content_id BIGINT NOT NULL,
  reason TEXT,
  reporter_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_reports_org ON public.content_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_content ON public.content_reports(content_type, content_id);

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a report (no read access — moderation reviews via service role)
CREATE POLICY "Public insert content reports" ON public.content_reports FOR INSERT WITH CHECK (true);

-- Only service role can view/manage reports
CREATE POLICY "Service role full content reports" ON public.content_reports FOR SELECT USING (auth.role() = 'service_role');
CREATE POLICY "Service role manage content reports" ON public.content_reports FOR UPDATE USING (auth.role() = 'service_role');
CREATE POLICY "Service role delete content reports" ON public.content_reports FOR DELETE USING (auth.role() = 'service_role');
