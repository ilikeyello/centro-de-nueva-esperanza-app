/**
 * Supabase Client Service
 * Replaces the Encore client for the church website migration
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Clerk } from '@clerk/clerk-js';
import { 
  getSermonsFromMainSite, 
  getLivestreamFromMainSite, 
  getMusicPlaylistFromMainSite,
  getEventsFromMainSite,
  getAnnouncementsFromMainSite,
  type SermonFromMainSite 
} from './lib/mainSiteData';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Create Supabase client with Clerk auth
export function createClerkSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      // Get the session token from Clerk
      fetch: async (url, options = {}) => {
        const clerk = (window as any).Clerk || (window as any).clerk;
        const token = await clerk?.session?.getToken();
        
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    }
  });
}

// Default client (for unauthenticated requests)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to get current organization ID from Clerk
export async function getCurrentOrganizationId(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const clerk = (window as any).Clerk || (window as any).clerk;
    if (!clerk?.loaded) return null;
    
    const user = clerk.user;
    const orgId = user?.organizationMemberships?.[0]?.organization?.id;
    
    return orgId || null;
  } catch (error) {
    console.error('Error getting organization ID:', error);
    return null;
  }
}

// Helper to set organization context for RLS
export async function setOrganizationContext(orgId: string) {
  // This sets a session variable that RLS policies can use
  await supabase.rpc('set_organization_id', { p_org_id: orgId });
}

// Types matching the database schema
export interface Sermon {
  id: number;
  organization_id: string;
  title: string;
  youtube_url: string;
  created_at: string;
}

// Frontend sermon item format (without organization_id)
export interface SermonItem {
  id: number;
  title: string;
  youtubeUrl: string;
  createdAt: string;
}

export interface Event {
  id: number;
  organization_id: string;
  titleEn: string;
  titleEs: string;
  descriptionEn: string | null;
  descriptionEs: string | null;
  eventDate: string;
  location: string;
  maxAttendees: number | null;
  createdAt: string;
  createdBy: string;
  rsvpCount: number;
}

export interface Announcement {
  id: number;
  organization_id: string;
  titleEn: string;
  titleEs: string;
  contentEn: string;
  contentEs: string;
  priority: string;
  createdAt: string;
  createdBy: string;
  imageUrl: string | null;
}

export interface PrayerRequest {
  id: number;
  organization_id: string;
  title: string;
  description: string;
  isAnonymous: boolean;
  userId: string;
  userName: string | null;
  prayerCount: number;
  createdAt: string;
}

export interface BulletinPost {
  id: number;
  organization_id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface ChurchInfo {
  id: string;
  organization_id: string;
  nameEn: string;
  nameEs: string;
  address: string;
  phone: string;
  email: string;
  serviceTimesEn: string;
  serviceTimesEs: string;
  descriptionEn: string | null;
  descriptionEs: string | null;
  facebookPageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
}

// API Service functions
export class ChurchApiService {
  private orgId: string | null = null;
  private client: SupabaseClient | null = null;
  
  constructor() {
    this.initializeOrgId();
  }
  
  private async initializeOrgId() {
    // Create authenticated client
    this.client = createClerkSupabaseClient();
    
    // Get organization ID
    this.orgId = await getCurrentOrganizationId();
    if (this.orgId) {
      await setOrganizationContext(this.orgId);
    }
  }
  
  private async ensureOrgContext() {
    if (!this.client) {
      await this.initializeOrgId();
    }
    if (!this.orgId) {
      throw new Error('No organization ID found - user may not be in an organization');
    }
  }
  
  private async getClient(): Promise<SupabaseClient> {
    if (!this.client) {
      await this.initializeOrgId();
    }
    return this.client!;
  }
  
  // Sermons - fetches from BOTH local sermons table AND main site's church_content
  async listSermons(): Promise<{ sermons: SermonItem[] }> {
    // Fetch from main site (church_content table) - no auth needed
    const mainSiteSermons = await getSermonsFromMainSite();
    
    // Transform main site sermons to match expected format
    const sermonsFromMainSite: SermonItem[] = mainSiteSermons.map((s) => ({
      id: parseInt(s.id) || 0,
      title: s.title,
      youtubeUrl: s.youtubeUrl,
      createdAt: s.createdAt
    }));

    // Also try to fetch from local sermons table (if it exists)
    let localSermons: SermonItem[] = [];
    try {
      const client = await this.getClient();
      const { data, error } = await client
        .from('sermons')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        localSermons = data.map((s: any) => ({
          id: s.id,
          title: s.title,
          youtubeUrl: s.youtube_url,
          createdAt: s.created_at
        }));
      }
    } catch (e) {
      // Local sermons table might not exist, that's okay
      console.log('Local sermons table not available, using main site data only');
    }
    
    // Combine both sources, main site first (most recent uploads)
    const allSermons = [...sermonsFromMainSite, ...localSermons];
    
    // Sort by date and deduplicate by title
    const seen = new Set<string>();
    const uniqueSermons = allSermons
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter(s => {
        if (seen.has(s.title)) return false;
        seen.add(s.title);
        return true;
      });
    
    return { sermons: uniqueSermons };
  }
  
  async createSermon(data: { title: string; youtubeUrl: string }): Promise<Sermon> {
    const client = await this.getClient();
    const { data: sermon, error } = await client
      .from('sermons')
      .insert({
        title: data.title,
        youtube_url: data.youtubeUrl
      })
      .select()
      .single();
    
    if (error) throw error;
    return sermon;
  }
  
  // Events
  async listEvents(params: { upcoming?: boolean }): Promise<{ events: Event[] }> {
    const client = await this.getClient();
    let query = client
      .from('events')
      .select(`
        *,
        event_rsvps(count)
      `);
    
    if (params.upcoming) {
      query = query.gte('event_date', new Date().toISOString());
    }
    
    const { data, error } = await query.order('event_date', { ascending: false });
    
    if (error) throw error;
    
    // Transform to match expected format (Event interface)
    const events = data.map((e: any) => ({
      id: e.id,
      organization_id: e.organization_id,
      titleEn: e.title_en,
      titleEs: e.title_es,
      descriptionEn: e.description_en,
      descriptionEs: e.description_es,
      eventDate: e.event_date,
      location: e.location,
      maxAttendees: e.max_attendees,
      createdAt: e.created_at,
      createdBy: e.created_by,
      rsvpCount: e.event_rsvps?.[0]?.count || 0
    }));
    
    return { events };
  }
  
  async createEvent(data: {
    titleEn: string;
    titleEs: string;
    descriptionEn: string;
    descriptionEs: string;
    eventDate: string;
    location: string;
    maxAttendees: number;
  }): Promise<Event> {
    const client = await this.getClient();
    const { data: event, error } = await client
      .from('events')
      .insert({
        title_en: data.titleEn,
        title_es: data.titleEs,
        description_en: data.descriptionEn,
        description_es: data.descriptionEs,
        event_date: data.eventDate,
        location: data.location,
        max_attendees: data.maxAttendees,
        created_by: 'user' // You might want to get this from Clerk
      })
      .select()
      .single();
    
    if (error) throw error;
    return event;
  }
  
  // Announcements
  async listAnnouncements(params: { limit?: number }): Promise<{ announcements: Announcement[] }> {
    const client = await this.getClient();
    const { data, error } = await client
      .from('announcements')
      .select('*')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(params.limit || 50);
    
    if (error) throw error;
    
    // Transform to match expected format (Announcement interface)
    const announcements = data.map((a: any) => ({
      id: a.id,
      organization_id: a.organization_id,
      titleEn: a.title_en,
      titleEs: a.title_es,
      contentEn: a.content_en,
      contentEs: a.content_es,
      priority: a.priority,
      createdAt: a.created_at,
      createdBy: a.created_by,
      imageUrl: a.image_url
    }));
    
    return { announcements };
  }
  
  async createAnnouncement(data: {
    titleEn: string;
    titleEs: string;
    contentEn: string;
    contentEs: string;
    priority: string;
    imageUrl?: string;
  }): Promise<Announcement> {
    const client = await this.getClient();
    const { data: announcement, error } = await client
      .from('announcements')
      .insert({
        title_en: data.titleEn,
        title_es: data.titleEs,
        content_en: data.contentEn,
        content_es: data.contentEs,
        priority: data.priority,
        image_url: data.imageUrl || null,
        created_by: 'user' // You might want to get this from Clerk
      })
      .select()
      .single();
    
    if (error) throw error;
    return announcement;
  }
  
  // Prayer Requests
  async listPrayerRequests(): Promise<{ prayers: PrayerRequest[] }> {
    const client = await this.getClient();
    const { data, error } = await client
      .from('prayer_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform to match expected format (PrayerRequest interface)
    const prayers = data.map((p: any) => ({
      id: p.id,
      organization_id: p.organization_id,
      title: p.title,
      description: p.description,
      isAnonymous: p.is_anonymous,
      userId: p.user_id,
      userName: p.user_name,
      prayerCount: p.prayer_count,
      createdAt: p.created_at
    }));
    
    return { prayers };
  }
  
  // Church Info
  async getChurchInfo(): Promise<ChurchInfo | null> {
    const client = await this.getClient();
    const { data, error } = await client
      .from('church_info')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    
    if (!data) return null;
    
    // Transform to match expected format
    return {
      id: data.id,
      organization_id: data.organization_id,
      nameEn: data.name_en,
      nameEs: data.name_es,
      address: data.address,
      phone: data.phone,
      email: data.email,
      serviceTimesEn: data.service_times_en,
      serviceTimesEs: data.service_times_es,
      descriptionEn: data.description_en,
      descriptionEs: data.description_es,
      facebookPageUrl: data.facebook_page_url,
      latitude: data.latitude,
      longitude: data.longitude
    };
  }
  
  // Bulletin Posts
  async listBulletinPosts(): Promise<{ posts: BulletinPost[] }> {
    const client = await this.getClient();
    const { data, error } = await client
      .from('bulletin_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform to match expected format (BulletinPost interface)
    const posts = data.map((p: any) => ({
      id: p.id,
      organization_id: p.organization_id,
      title: p.title,
      content: p.content,
      authorName: p.author_name,
      createdAt: p.created_at
    }));
    
    return { posts };
  }
  
  // Livestream - fetches from main site's church_content
  async getLivestream(): Promise<string | null> {
    return getLivestreamFromMainSite();
  }
  
  // Music Playlist - fetches from main site's church_content
  async getMusicPlaylist(): Promise<string | null> {
    return getMusicPlaylistFromMainSite();
  }
}

// Create singleton instance
export const churchApi = new ChurchApiService();

// Re-export main site data functions for direct use
export { 
  getSermonsFromMainSite, 
  getLivestreamFromMainSite, 
  getMusicPlaylistFromMainSite,
  getEventsFromMainSite,
  getAnnouncementsFromMainSite 
} from './lib/mainSiteData';
