-- Migration: add client_user_id to push_subscriptions
--
-- This stores the browser-local user ID (from localStorage key "cne-user-id")
-- alongside each push subscription so that bulletin-comment notifications can
-- be sent only to the post author's device(s), not every subscriber.
--
-- Run this once in the Supabase SQL editor for your project.

ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS client_user_id TEXT;

-- Index so the auto-notify function can efficiently look up a single user's subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_client_user_id
  ON public.push_subscriptions (org_id, client_user_id);
