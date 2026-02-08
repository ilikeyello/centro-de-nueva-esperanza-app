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
  type LivestreamInfo
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
export type Sermon = SermonItem;

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

export interface BulletinComment {
  id: number;
  bulletinPostId: number;
  organization_id: string;
  authorName: string;
  authorId: string | null;
  content: string;
  createdAt: string;
}

export interface BulletinPost {
  id: number;
  organization_id: string;
  title: string;
  content: string;
  authorName: string;
  likeCount: number;
  createdAt: string;
  comments: BulletinComment[];
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
      .select('id, organization_id, title, description, is_anonymous, user_id, user_name, prayer_count, created_at')
      .eq('organization_id', this.orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const prayers = (data ?? []).map((p: any) => ({
      id: p.id,
      organization_id: p.organization_id,
      title: p.title,
      description: p.description,
      isAnonymous: p.is_anonymous,
      userId: p.user_id,
      userName: p.user_name,
      prayerCount: p.prayer_count,
      createdAt: p.created_at,
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
    const { data: postsData, error: postsError } = await this.client
      .from('bulletin_posts')
      .select('id, organization_id, title, content, author_name, like_count, created_at')
      .eq('organization_id', this.orgId)
      .order('created_at', { ascending: false });

    if (postsError) throw postsError;

    const postIds = (postsData ?? []).map((p: any) => p.id).filter((id: any) => typeof id === 'number');

    const { data: commentsData, error: commentsError } = postIds.length
      ? await this.client
          .from('bulletin_comments')
          .select('id, bulletin_post_id, organization_id, author_name, author_id, content, created_at')
          .eq('organization_id', this.orgId)
          .in('bulletin_post_id', postIds)
          .order('created_at', { ascending: true })
      : { data: [], error: null };

    if (commentsError) throw commentsError;

    const commentsByPostId = new Map<number, BulletinComment[]>();
    (commentsData ?? []).forEach((c: any) => {
      const mapped: BulletinComment = {
        id: c.id,
        bulletinPostId: c.bulletin_post_id,
        organization_id: c.organization_id,
        authorName: c.author_name,
        authorId: c.author_id,
        content: c.content,
        createdAt: c.created_at,
      };

      const existing = commentsByPostId.get(mapped.bulletinPostId) ?? [];
      existing.push(mapped);
      commentsByPostId.set(mapped.bulletinPostId, existing);
    });

    const posts = (postsData ?? []).map((p: any) => ({
      id: p.id,
      organization_id: p.organization_id,
      title: p.title,
      content: p.content,
      authorName: p.author_name,
      likeCount: p.like_count ?? 0,
      createdAt: p.created_at,
      comments: commentsByPostId.get(p.id) ?? [],
    }));

    return { posts };
  }
  
  // --- External Data (from main site) ---
  async getLivestream(): Promise<LivestreamInfo> {
    return getLivestreamFromMainSite();
  }
  
  async getMusicPlaylist(): Promise<string | null> {
    return getMusicPlaylistFromMainSite();
  }

  // --- Write Operations (User Generated Content) ---
  
  async createBulletinPost(post: { title: string; content: string; authorName: string; authorId?: string | null }): Promise<BulletinPost> {
    const { data, error } = await this.client
      .from('bulletin_posts')
      .insert({
        organization_id: this.orgId,
        title: post.title,
        content: post.content,
        author_name: post.authorName,
        author_id: post.authorId
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      organization_id: data.organization_id,
      title: data.title,
      content: data.content,
      authorName: data.author_name,
      likeCount: data.like_count ?? 0,
      createdAt: data.created_at,
      comments: []
    };
  }

  async createBulletinComment(comment: { postId: number; content: string; authorName: string; authorId?: string | null }): Promise<BulletinComment> {
    const { data, error } = await this.client
      .from('bulletin_comments')
      .insert({
        organization_id: this.orgId,
        bulletin_post_id: comment.postId,
        content: comment.content,
        author_name: comment.authorName,
        author_id: comment.authorId
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      bulletinPostId: data.bulletin_post_id,
      organization_id: data.organization_id,
      authorName: data.author_name,
      authorId: data.author_id,
      content: data.content,
      createdAt: data.created_at
    };
  }

  async createPrayerRequest(prayer: { title: string; description: string; isAnonymous: boolean; authorName?: string | null; userId?: string | null }): Promise<PrayerRequest> {
    const { data, error } = await this.client
      .from('prayer_requests')
      .insert({
        organization_id: this.orgId,
        title: prayer.title,
        description: prayer.description,
        is_anonymous: prayer.isAnonymous,
        user_name: prayer.authorName,
        user_id: prayer.userId
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      organization_id: data.organization_id,
      title: data.title,
      description: data.description,
      isAnonymous: data.is_anonymous,
      userId: data.user_id,
      userName: data.user_name,
      prayerCount: data.prayer_count,
      createdAt: data.created_at,
    };
  }

  async incrementPrayerCount(prayerId: number): Promise<void> {
    const { data: current, error: fetchError } = await this.client
      .from('prayer_requests')
      .select('prayer_count')
      .eq('id', prayerId)
      .eq('organization_id', this.orgId)
      .single();
      
    if (fetchError) throw fetchError;
    
    const { error: updateError } = await this.client
      .from('prayer_requests')
      .update({ prayer_count: (current?.prayer_count || 0) + 1 })
      .eq('id', prayerId)
      .eq('organization_id', this.orgId);
      
    if (updateError) throw updateError;
  }

  async incrementLikeCount(postId: number): Promise<void> {
    const { data: current, error: fetchError } = await this.client
      .from('bulletin_posts')
      .select('like_count')
      .eq('id', postId)
      .eq('organization_id', this.orgId)
      .single();
      
    if (fetchError) throw fetchError;
    
    const { error: updateError } = await this.client
      .from('bulletin_posts')
      .update({ like_count: (current?.like_count || 0) + 1 })
      .eq('id', postId)
      .eq('organization_id', this.orgId);
      
    if (updateError) throw updateError;
  }

  async createAnnouncement(announcement: {
    titleEn: string;
    titleEs: string;
    contentEn: string;
    contentEs: string;
    priority?: string;
  }): Promise<Announcement> {
    const { data, error } = await this.client
      .from('announcements')
      .insert({
        organization_id: this.orgId,
        title_en: announcement.titleEn,
        title_es: announcement.titleEs,
        content_en: announcement.contentEn,
        content_es: announcement.contentEs,
        priority: announcement.priority || 'normal',
        created_by: 'user',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      organization_id: data.organization_id,
      titleEn: data.title_en,
      titleEs: data.title_es,
      contentEn: data.content_en,
      contentEs: data.content_es,
      priority: data.priority,
      createdAt: data.created_at,
      createdBy: data.created_by,
      imageUrl: data.image_url,
    };
  }

  async deleteAnnouncement(id: number): Promise<void> {
    const { error } = await this.client
      .from('announcements')
      .delete()
      .eq('id', id)
      .eq('organization_id', this.orgId);

    if (error) throw error;
  }

  async createEvent(event: {
    titleEn: string;
    titleEs: string;
    descriptionEn?: string;
    descriptionEs?: string;
    eventDate: string;
    location: string;
    maxAttendees?: number;
  }): Promise<Event> {
    const { data, error } = await this.client
      .from('events')
      .insert({
        organization_id: this.orgId,
        title_en: event.titleEn,
        title_es: event.titleEs,
        description_en: event.descriptionEn || null,
        description_es: event.descriptionEs || null,
        event_date: event.eventDate,
        location: event.location,
        max_attendees: event.maxAttendees || null,
        created_by: 'user',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      organization_id: data.organization_id,
      titleEn: data.title_en,
      titleEs: data.title_es,
      descriptionEn: data.description_en,
      descriptionEs: data.description_es,
      eventDate: data.event_date,
      location: data.location,
      maxAttendees: data.max_attendees,
      createdAt: data.created_at,
      createdBy: data.created_by,
      rsvpCount: 0,
    };
  }

  async deleteEvent(id: number): Promise<void> {
    const { error } = await this.client
      .from('events')
      .delete()
      .eq('id', id)
      .eq('organization_id', this.orgId);

    if (error) throw error;
  }
}

// --- Create and export a singleton instance ---
export const churchApi = new ChurchApiService();

// --- Re-export main site data functions for direct use ---
export { 
  getSermonsFromMainSite, 
  getLivestreamFromMainSite, 
  getMusicPlaylistFromMainSite,
  getAllMusicPlaylistsFromMainSite,
  getEventsFromMainSite,
  getAnnouncementsFromMainSite 
} from './lib/mainSiteData';

export type { MusicPlaylistFromMainSite } from './lib/mainSiteData';
