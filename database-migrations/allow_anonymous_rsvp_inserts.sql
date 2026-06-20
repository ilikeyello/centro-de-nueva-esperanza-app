-- Migration: allow_anonymous_rsvp_inserts
-- Run this in your Supabase dashboard → SQL Editor
-- This allows any visitor to submit an RSVP without needing to be logged in.

CREATE POLICY "Public insert access for event_rsvps" ON event_rsvps
  FOR INSERT WITH CHECK (true);
