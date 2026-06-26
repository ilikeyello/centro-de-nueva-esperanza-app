/**
 * Main Site Data Bridge
 * 
 * This module fetches data from the main site's database tables (church_content)
 * and transforms it to match this church site's expected format.
 * 
 * Data Flow: (cache-bust v2)
 * Main Site (emanuelavina.com) → uploads to church_content table
 * This Church Site → reads from church_content table via this bridge
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Support both names; prefer VITE_CHURCH_ORG_ID
const churchOrgId = import.meta.env.VITE_CHURCH_ORG_ID || import.meta.env.VITE_CLERK_ORG_ID;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

if (!churchOrgId) {
  console.warn('VITE_CHURCH_ORG_ID (or VITE_CLERK_ORG_ID) is not set; main-site scoped content will not load.');
} else {
  console.log('Using organization id for content fetch:', churchOrgId);
}

// Public client (no auth needed - RLS allows public reads)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export { churchOrgId };

// Types from main site's schema
interface ChurchContentRow {
  id: string;
  church_id: string;
  type: 'sermon' | 'music' | 'livestream' | 'event' | 'announcement' | 'blog';
  title: string;
  description?: string;
  content?: string;
  youtube_url?: string;
  youtube_playlist_url?: string;
  file_path?: string;
  public_url?: string;
  file_type?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

interface ChurchRow {
  id: string;
  clerk_org_id: string;
  name: string;
  slug?: string;
  domain?: string;
  subscription_plan: string;
}

// Cache the church ID to avoid repeated lookups
let cachedChurchId: string | null = null;

/**
 * Get the church ID for this site's organization
 */
async function getChurchId(): Promise<string | null> {
  if (cachedChurchId) return cachedChurchId;
  
  if (!churchOrgId) {
    console.warn('VITE_CHURCH_ORG_ID not set - cannot fetch church data');
    return null;
  }

  const { data, error } = await supabase
    .from('church_info')
    .select('organization_id')
    .eq('organization_id', churchOrgId)
    .single();

  if (error) {
    console.error('Error fetching church:', error);
    return null;
  }

  cachedChurchId = (data as any)?.organization_id || null;
  console.log('Resolved church id for org', churchOrgId, '=>', cachedChurchId);
  return cachedChurchId;
}

/**
 * Fetch content by type from the main site's church_content table
 */
async function fetchContentByType(type: ChurchContentRow['type']): Promise<ChurchContentRow[]> {
  const churchId = await getChurchId();
  if (!churchId) return [];

  const { data, error } = await supabase
    .from('church_content')
    .select('*')
    .eq('church_id', churchId)
    .eq('type', type)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching ${type}:`, error);
    return [];
  }

  console.log(`Fetched ${type} content count:`, (data || []).length);
  return data || [];
}

// ============================================
// Public API - matches church site's expected format
// ============================================

export interface SermonFromMainSite {
  id: string;
  title: string;
  youtubeUrl: string;
  description?: string;
  createdAt: string;
}

/**
 * Fetch sermons uploaded via the main site admin
 */
export async function getSermonsFromMainSite(): Promise<SermonFromMainSite[]> {
  const content = await fetchContentByType('sermon');
  
  return content.map(item => ({
    id: item.id,
    title: item.title,
    youtubeUrl: item.youtube_url || '',
    description: item.description,
    createdAt: item.created_at,
  }));
}

/**
 * Fetch the current livestream (Mux). Returns the Mux playback id used by the
 * <mux-player> in the app, plus whether it's currently live.
 */
export interface LivestreamInfo {
  playbackId: string | null;
  isLive: boolean;
  title?: string | null;
  scheduledStart?: string | null;
}

export async function getLivestreamFromMainSite(): Promise<LivestreamInfo> {
  if (!churchOrgId) {
    console.warn('No org id configured; cannot fetch livestream');
    return { playbackId: null, isLive: false };
  }

  try {
    const { data, error } = await supabase
      .from('livestreams')
      .select('mux_playback_id, is_live, updated_at, title, scheduled_start')
      .eq('organization_id', churchOrgId)
      .not('mux_playback_id', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching livestreams table:', error);
    } else {
      const row = data && data[0];
      if (row && row.mux_playback_id) {
        return {
          playbackId: row.mux_playback_id as string,
          isLive: Boolean(row.is_live),
          title: (row as any).title ?? null,
          scheduledStart: (row as any).scheduled_start ?? null,
        };
      }
    }
  } catch (err) {
    console.error('Unhandled error fetching livestreams table:', err);
  }

  return { playbackId: null, isLive: false };
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string | null;
  playbackId: string;
  duration: number | null;
}

/**
 * Fetch worship music tracks (Mux audio assets) uploaded via the admin
 * dashboard. Only "ready" tracks with a playback id are returned.
 */
export async function getMusicTracksFromMainSite(): Promise<MusicTrack[]> {
  if (!churchOrgId) return [];
  try {
    const { data, error } = await supabase
      .from('music_tracks')
      .select('id, title, artist, mux_playback_id, mux_status, duration, sort_order, created_at')
      .eq('organization_id', churchOrgId)
      .eq('mux_status', 'ready')
      .not('mux_playback_id', 'is', null)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching music_tracks:', error);
      return [];
    }
    return (data || []).map((t: any) => ({
      id: String(t.id),
      title: t.title || 'Untitled',
      artist: t.artist ?? null,
      playbackId: t.mux_playback_id as string,
      duration: t.duration ?? null,
    }));
  } catch (err) {
    console.error('Unhandled error fetching music_tracks:', err);
    return [];
  }
}

export interface EventFromMainSite {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

/**
 * Fetch events uploaded via the main site admin
 */
export async function getEventsFromMainSite(): Promise<EventFromMainSite[]> {
  const content = await fetchContentByType('event');
  
  return content.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    createdAt: item.created_at,
    metadata: item.metadata,
  }));
}

export interface AnnouncementFromMainSite {
  id: string;
  title: string;
  content?: string;
  description?: string;
  createdAt: string;
}

/**
 * Fetch announcements uploaded via the main site admin
 */
export async function getAnnouncementsFromMainSite(): Promise<AnnouncementFromMainSite[]> {
  const content = await fetchContentByType('announcement');
  
  return content.map(item => ({
    id: item.id,
    title: item.title,
    content: item.content,
    description: item.description,
    createdAt: item.created_at,
  }));
}

/**
 * Fetch all content from main site in one call
 */
export async function getAllMainSiteContent() {
  const [sermons, livestream, musicTracks, events, announcements] = await Promise.all([
    getSermonsFromMainSite(),
    getLivestreamFromMainSite(),
    getMusicTracksFromMainSite(),
    getEventsFromMainSite(),
    getAnnouncementsFromMainSite(),
  ]);

  return {
    sermons,
    livestream,
    musicTracks,
    events,
    announcements,
  };
}

/**
 * Get the church info from main site
 */
export async function getChurchInfoFromMainSite(): Promise<ChurchRow | null> {
  if (!churchOrgId) return null;

  const { data, error } = await supabase
    .from('churches')
    .select('*')
    .eq('clerk_org_id', churchOrgId)
    .single();

  if (error) {
    console.error('Error fetching church info:', error);
    return null;
  }

  return data;
}

export interface ChurchAdditionalInfo {
  name: string;
  description: string | null;
  service_times: string;
  address: string;
  phone: string;
  email: string;
  facebook_page_url: string | null;
  youtube_url: string | null;
  tithely_url?: string | null;
  tithely_embed?: string | null;
}

/**
 * Fetch detailed church info (address, description, service times, etc.)
 */
export async function getChurchAdditionalInfo(): Promise<ChurchAdditionalInfo | null> {
  if (!churchOrgId) return null;

  const { data, error } = await supabase
    .from('church_info')
    .select('*')
    .eq('organization_id', churchOrgId)
    .single();

  if (error) {
    console.error('Error fetching additional church info:', error);
    return null;
  }

  return data as ChurchAdditionalInfo;
}
