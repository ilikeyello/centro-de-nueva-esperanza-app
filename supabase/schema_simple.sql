-- =====================================================
-- SIMPLE TEST - Create just church_info first
-- =====================================================
-- Run this FIRST to test if the basic table creation works

DROP TABLE IF EXISTS church_info CASCADE;

CREATE TABLE public.church_info (
  organization_id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_es TEXT NOT NULL,
  address TEXT DEFAULT 'To be updated',
  phone TEXT DEFAULT 'To be updated',
  email TEXT DEFAULT 'To be updated',
  service_times_en TEXT DEFAULT 'To be updated',
  service_times_es TEXT DEFAULT 'To be updated',
  description_en TEXT,
  description_es TEXT,
  facebook_page_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test insert
INSERT INTO public.church_info (organization_id, name_en, name_es, created_by)
VALUES ('org_38agxTQYvbrRSYd2jdxcfL5DGXf', 'Test Church', 'Iglesia de Prueba', 'system');

-- Verify it worked
SELECT * FROM public.church_info;
