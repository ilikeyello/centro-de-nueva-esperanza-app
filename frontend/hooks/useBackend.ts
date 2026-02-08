/**
 * Backend Hook - Supabase Version
 * Replaces the Encore backend client with Supabase
 */

import { churchApi } from '../supabase-client';

// Export the same interface as the original useBackend hook
// but using Supabase instead of Encore
export function useBackend() {
  return churchApi;
}

// Export types for compatibility
export type {
  Sermon,
  Event,
  Announcement,
  PrayerRequest,
  BulletinPost,
  BulletinComment,
  ChurchInfo
} from '../supabase-client';
