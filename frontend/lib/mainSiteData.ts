/**
 * Main Site Data Bridge
 * 
 * This module fetches data from the main site's database tables (church_content)
 * and transforms it to match this church site's expected format.
 * 
 * Data Flow:
 * Main Site (emanuelavina.com) → uploads to church_content table
 * This Church Site → reads from church_content table via this bridge
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const clerkOrgId = import.meta.env.VITE_CLERK_ORG_ID;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Public client (no auth needed - RLS allows public reads)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  
  if (!clerkOrgId) {
    console.warn('VITE_CLERK_ORG_ID not set - cannot fetch church data');
    return null;
  }

  const { data, error } = await supabase
    .from('churches')
    .select('id')
    .eq('clerk_org_id', clerkOrgId)
    .single();

  if (error) {
    console.error('Error fetching church:', error);
    return null;
  }

  cachedChurchId = data?.id || null;
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
 * Fetch the livestream URL uploaded via the main site admin
 */
export async function getLivestreamFromMainSite(): Promise<string | null> {
  const content = await fetchContentByType('livestream');
  return content[0]?.youtube_url || null;
}

/**
 * Fetch the music playlist URL uploaded via the main site admin
 */
export async function getMusicPlaylistFromMainSite(): Promise<string | null> {
  const content = await fetchContentByType('music');
  return content[0]?.youtube_playlist_url || null;
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
  const [sermons, livestream, musicPlaylist, events, announcements] = await Promise.all([
    getSermonsFromMainSite(),
    getLivestreamFromMainSite(),
    getMusicPlaylistFromMainSite(),
    getEventsFromMainSite(),
    getAnnouncementsFromMainSite(),
  ]);

  return {
    sermons,
    livestream,
    musicPlaylist,
    events,
    announcements,
  };
}

/**
 * Get the church info from main site
 */
export async function getChurchInfoFromMainSite(): Promise<ChurchRow | null> {
  if (!clerkOrgId) return null;

  const { data, error } = await supabase
    .from('churches')
    .select('*')
    .eq('clerk_org_id', clerkOrgId)
    .single();

  if (error) {
    console.error('Error fetching church info:', error);
    return null;
  }

  return data;
}
