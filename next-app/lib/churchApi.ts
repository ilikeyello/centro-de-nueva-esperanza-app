import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getLivestreamFromMainSite, type LivestreamInfo } from "@/lib/mainSiteData";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const churchOrgIdEnv = process.env.NEXT_PUBLIC_CHURCH_ORG_ID;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

if (!churchOrgIdEnv) {
  throw new Error("Missing church organization ID. Please set NEXT_PUBLIC_CHURCH_ORG_ID.");
}

const churchOrgId: string = churchOrgIdEnv;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Sermon {
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

export interface PrayerComment {
  id: number;
  prayerRequestId: number;
  organization_id: string;
  authorName: string;
  authorId: string | null;
  content: string;
  createdAt: string;
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
  comments: PrayerComment[];
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

class ChurchApiService {
  private client: SupabaseClient = supabase;
  private orgId: string = churchOrgId;

  async listSermons(): Promise<{ sermons: Sermon[] }> {
    return this.sermons.list();
  }

  sermons = {
    list: async (): Promise<{ sermons: Sermon[] }> => {
      let localSermons: Sermon[] = [];
      try {
        const { data, error } = await this.client
          .from("sermons")
          .select("*")
          .eq("organization_id", this.orgId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;

        localSermons = (data ?? []).map((s: any) => ({
          id: s.id,
          title: s.title,
          youtubeUrl: s.youtube_url,
          createdAt: s.created_at,
        }));
      } catch {
        localSermons = [];
      }

      return { sermons: localSermons };
    },
  };

  async listEvents(params: { upcoming?: boolean }): Promise<{ events: Event[] }> {
    return this.events.list(params);
  }

  events = {
    list: async (params: { upcoming?: boolean }): Promise<{ events: Event[] }> => {
      let query = this.client
        .from("events")
        .select("*, event_rsvps(count)")
        .eq("organization_id", this.orgId);

      if (params.upcoming) {
        query = query.gte("event_date", new Date().toISOString());
      }

      const { data, error } = await query.order("event_date", { ascending: false });

      if (error) throw error;

      const events = (data ?? []).map((e: any) => ({
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
        rsvpCount: e.event_rsvps?.[0]?.count || 0,
      }));

      return { events };
    },
  };

  async listAnnouncements(params: { limit?: number }): Promise<{ announcements: Announcement[] }> {
    return this.announcements.list(params);
  }

  announcements = {
    list: async (params: { limit?: number }): Promise<{ announcements: Announcement[] }> => {
      const { data, error } = await this.client
        .from("announcements")
        .select("*")
        .eq("organization_id", this.orgId)
        .order("priority", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(params.limit || 50);

      if (error) throw error;

      const announcements = (data ?? []).map((a: any) => ({
        id: a.id,
        organization_id: a.organization_id,
        titleEn: a.title_en ?? a.titleEn ?? a.title ?? "",
        titleEs: a.title_es ?? a.titleEs ?? a.title ?? "",
        contentEn: a.content_en ?? a.contentEn ?? a.content ?? "",
        contentEs: a.content_es ?? a.contentEs ?? a.content ?? "",
        priority: a.priority ?? "normal",
        createdAt: a.created_at ?? a.createdAt ?? new Date().toISOString(),
        createdBy: a.created_by ?? a.createdBy ?? "",
        imageUrl: a.image_url ?? a.imageUrl ?? null,
      }));

      return { announcements };
    },
  };

  async listPrayerRequests(): Promise<{ prayers: PrayerRequest[] }> {
    return this.prayers.list();
  }

  async createPrayerRequest(prayer: {
    title: string;
    description: string;
    isAnonymous: boolean;
    authorName?: string | null;
    userId?: string | null;
  }): Promise<PrayerRequest> {
    return this.prayers.create(prayer);
  }

  async createPrayerComment(comment: {
    prayerId: number;
    content: string;
    authorName: string;
    authorId?: string | null;
  }): Promise<PrayerComment> {
    return this.prayers.comment(comment);
  }

  async incrementPrayerCount(prayerId: number): Promise<void> {
    return this.prayers.increment(prayerId);
  }

  prayers = {
    list: async (): Promise<{ prayers: PrayerRequest[] }> => {
      const { data, error } = await this.client
        .from("prayer_requests")
        .select("*, prayer_comments(*)")
        .eq("organization_id", this.orgId)
        .order("created_at", { ascending: false });

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
        comments: (p.prayer_comments || [])
          .map((c: any) => ({
            id: c.id,
            prayerRequestId: c.prayer_request_id,
            organization_id: c.organization_id,
            authorName: c.author_name,
            authorId: c.author_id,
            content: c.content,
            createdAt: c.created_at,
          }))
          .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
      }));

      return { prayers };
    },

    create: async (prayer: {
      title: string;
      description: string;
      isAnonymous: boolean;
      authorName?: string | null;
      userId?: string | null;
    }): Promise<PrayerRequest> => {
      const { data, error } = await this.client
        .from("prayer_requests")
        .insert({
          organization_id: this.orgId,
          title: prayer.title,
          description: prayer.description,
          is_anonymous: prayer.isAnonymous,
          user_name: prayer.authorName,
          user_id: prayer.userId,
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
        comments: [],
      };
    },

    increment: async (prayerId: number): Promise<void> => {
      const { data: current, error: fetchError } = await this.client
        .from("prayer_requests")
        .select("prayer_count")
        .eq("id", prayerId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await this.client
        .from("prayer_requests")
        .update({ prayer_count: (current?.prayer_count || 0) + 1 })
        .eq("id", prayerId);

      if (updateError) throw updateError;
    },

    comment: async (comment: {
      prayerId: number;
      content: string;
      authorName: string;
      authorId?: string | null;
    }): Promise<PrayerComment> => {
      const { data, error } = await this.client
        .from("prayer_comments")
        .insert({
          organization_id: this.orgId,
          prayer_request_id: comment.prayerId,
          content: comment.content,
          author_name: comment.authorName,
          author_id: comment.authorId,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        prayerRequestId: data.prayer_request_id,
        organization_id: data.organization_id,
        authorName: data.author_name,
        authorId: data.author_id,
        content: data.content,
        createdAt: data.created_at,
      };
    },
  };

  async listBulletinPosts(): Promise<{ posts: BulletinPost[] }> {
    return this.bulletin.list();
  }

  async createBulletinPost(post: {
    title: string;
    content: string;
    authorName: string;
    authorId?: string | null;
  }): Promise<BulletinPost> {
    return this.bulletin.create(post);
  }

  async createBulletinComment(comment: {
    postId: number;
    content: string;
    authorName: string;
    authorId?: string | null;
  }): Promise<BulletinComment> {
    return this.bulletin.comment(comment);
  }

  bulletin = {
    list: async (): Promise<{ posts: BulletinPost[] }> => {
      const { data: postsData, error: postsError } = await this.client
        .from("bulletin_posts")
        .select("id, organization_id, title, content, author_name, created_at")
        .eq("organization_id", this.orgId)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      const postIds = (postsData ?? []).map((p: any) => p.id).filter((id: any) => typeof id === "number");

      const { data: commentsData, error: commentsError } = postIds.length
        ? await this.client
            .from("bulletin_comments")
            .select("id, bulletin_post_id, organization_id, author_name, author_id, content, created_at")
            .eq("organization_id", this.orgId)
            .in("bulletin_post_id", postIds)
            .order("created_at", { ascending: true })
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
        createdAt: p.created_at,
        comments: commentsByPostId.get(p.id) ?? [],
      }));

      return { posts };
    },

    create: async (post: {
      title: string;
      content: string;
      authorName: string;
      authorId?: string | null;
    }): Promise<BulletinPost> => {
      const { data, error } = await this.client
        .from("bulletin_posts")
        .insert({
          organization_id: this.orgId,
          title: post.title,
          content: post.content,
          author_name: post.authorName,
          author_id: post.authorId,
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
        createdAt: data.created_at,
        comments: [],
      };
    },

    comment: async (comment: {
      postId: number;
      content: string;
      authorName: string;
      authorId?: string | null;
    }): Promise<BulletinComment> => {
      const { data, error } = await this.client
        .from("bulletin_comments")
        .insert({
          organization_id: this.orgId,
          bulletin_post_id: comment.postId,
          content: comment.content,
          author_name: comment.authorName,
          author_id: comment.authorId,
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
        createdAt: data.created_at,
      };
    },
  };

  async getChurchInfo(): Promise<ChurchInfo | null> {
    const { data, error } = await this.client
      .from("church_info")
      .select("*")
      .eq("organization_id", this.orgId)
      .single();

    if (error && (error as any).code !== "PGRST116") throw error;

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
      longitude: data.longitude,
    };
  }

  async getLivestream(): Promise<LivestreamInfo> {
    return getLivestreamFromMainSite();
  }
}

export const churchApi = new ChurchApiService();
