-- Migration: fix_anonymous_rsvp_policies
-- Run this in your Supabase dashboard -> SQL Editor (project: wreovuejotnudkpaaffz)
--
-- Why: The events page RSVP button submits as an anonymous (anon) user.
-- The base schema only granted SELECT (read) and service_role full access,
-- so anon INSERTs were blocked by Row Level Security (error 42501).
-- The client uses upsert (INSERT ... ON CONFLICT DO UPDATE), which means we
-- need BOTH an INSERT and an UPDATE policy for anon/public users.
--
-- This script is idempotent: safe to run more than once.

-- Make sure RLS is on (no-op if already enabled)
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit an RSVP
DROP POLICY IF EXISTS "Public insert access for event_rsvps" ON public.event_rsvps;
CREATE POLICY "Public insert access for event_rsvps"
  ON public.event_rsvps
  FOR INSERT
  WITH CHECK (true);

-- Allow the upsert to update an existing RSVP (same browser session re-submitting)
DROP POLICY IF EXISTS "Public update access for event_rsvps" ON public.event_rsvps;
CREATE POLICY "Public update access for event_rsvps"
  ON public.event_rsvps
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Verify the policies are in place
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'event_rsvps'
ORDER BY cmd;
