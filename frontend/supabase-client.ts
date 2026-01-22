/**
 * Supabase Client Service (Read-Only)
 * This client is for public-facing church sites and only performs read operations.
 * It uses a public organization ID from environment variables to fetch the correct data.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  getSermonsFromMainSite, 
  getLivestreamFromMainSite, 
  getMusicPlaylistFromMainSite,
  getEventsFromMainSite,
  getAnnouncementsFromMainSite,
} from './lib/mainSiteData';

// --- Environment Variables ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const churchOrgId = import.meta.env.VITE_CHURCH_ORG_ID;

// --- Validate Environment Variables ---
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}
if (!churchOrgId) {
  throw new Error('Missing church organization ID. Please set VITE_CHURCH_ORG_ID.');
}

// --- Create a single, public Supabase client ---
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Types matching the database schema ---
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

// --- API Service (Read-Only) ---
export class ChurchApiService {
  private client: SupabaseClient = supabase;
  private orgId: string = churchOrgId;

  // Sermons - fetches from BOTH local sermons table AND main site's church_content
  async listSermons(): Promise<{ sermons: SermonItem[] }> {
    const mainSiteSermons = await getSermonsFromMainSite();
    
    const sermonsFromMainSite: SermonItem[] = mainSiteSermons.map((s) => ({
      id: parseInt(s.id) || 0,
      title: s.title,
      youtubeUrl: s.youtubeUrl,
      createdAt: s.createdAt
    }));

    let localSermons: SermonItem[] = [];
    try {
      const { data, error } = await this.client
        .from('sermons')
        .select('*')
        .eq('organization_id', this.orgId)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;

      if (data) {
        localSermons = data.map((s: any) => ({
          id: s.id,
          title: s.title,
          youtubeUrl: s.youtube_url,
          createdAt: s.created_at
        }));
      }
    } catch (e) {
      console.log('Local sermons table not available, using main site data only');
    }
    
    const allSermons = [...sermonsFromMainSite, ...localSermons];
    
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
  
  // Events
  async listEvents(params: { upcoming?: boolean }): Promise<{ events: Event[] }> {
    let query = this.client
      .from('events')
      .select('*, event_rsvps(count)')
      .eq('organization_id', this.orgId);
    
    if (params.upcoming) {
      query = query.gte('event_date', new Date().toISOString());
    }
    
    const { data, error } = await query.order('event_date', { ascending: false });
    
    if (error) throw error;
    
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
  
  // Announcements
  async listAnnouncements(params: { limit?: number }): Promise<{ announcements: Announcement[] }> {
    const { data, error } = await this.client
      .from('announcements')
      .select('*')
      .eq('organization_id', this.orgId)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(params.limit || 50);
    
    if (error) throw error;
    
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
  
  // Prayer Requests
  async listPrayerRequests(): Promise<{ prayers: PrayerRequest[] }> {
    const { data, error } = await this.client
      .from('prayer_requests')
      .select('*')
      .eq('organization_id', this.orgId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
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
    const { data, error } = await this.client
      .from('church_info')
      .select('*')
      .eq('organization_id', this.orgId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    
    if (!data) return null;
    
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
    const { data, error } = await this.client
      .from('bulletin_posts')
      .select('*')
      .eq('organization_id', this.orgId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
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
  
  // --- External Data (from main site) ---
  async getLivestream(): Promise<string | null> {
    return getLivestreamFromMainSite();
  }
  
  async getMusicPlaylist(): Promise<string | null> {
    return getMusicPlaylistFromMainSite();
  }
}

// --- Create and export a singleton instance ---
export const churchApi = new ChurchApiService();

// --- Re-export main site data functions for direct use ---
export { 
  getSermonsFromMainSite, 
  getLivestreamFromMainSite, 
  getMusicPlaylistFromMainSite,
  getEventsFromMainSite,
  getAnnouncementsFromMainSite 
} from './lib/mainSiteData';
