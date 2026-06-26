import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const churchOrgId = process.env.NEXT_PUBLIC_CHURCH_ORG_ID;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LivestreamInfo {
  playbackId: string | null;
  isLive: boolean;
  title?: string | null;
  scheduledStart?: string | null;
}

export async function getLivestreamFromMainSite(): Promise<LivestreamInfo> {
  if (!churchOrgId) {
    return { playbackId: null, isLive: false };
  }

  try {
    const { data, error } = await supabase
      .from("livestreams")
      .select("mux_playback_id, is_live, updated_at, title, scheduled_start")
      .eq("organization_id", churchOrgId)
      .not("mux_playback_id", "is", null)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (!error) {
      const row = data && data[0];
      if (row && (row as any).mux_playback_id) {
        return {
          playbackId: (row as any).mux_playback_id as string,
          isLive: Boolean((row as any).is_live),
          title: (row as any).title ?? null,
          scheduledStart: (row as any).scheduled_start ?? null,
        };
      }
    }
  } catch {
    // ignore
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

export async function getMusicTracksFromMainSite(): Promise<MusicTrack[]> {
  if (!churchOrgId) return [];
  try {
    const { data, error } = await supabase
      .from("music_tracks")
      .select("id, title, artist, mux_playback_id, mux_status, duration, sort_order, created_at")
      .eq("organization_id", churchOrgId)
      .eq("mux_status", "ready")
      .not("mux_playback_id", "is", null)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) return [];
    return (data || []).map((t: any) => ({
      id: String(t.id),
      title: t.title || "Untitled",
      artist: t.artist ?? null,
      playbackId: t.mux_playback_id as string,
      duration: t.duration ?? null,
    }));
  } catch {
    return [];
  }
}
