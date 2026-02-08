import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const churchOrgId = process.env.NEXT_PUBLIC_CHURCH_ORG_ID;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LivestreamInfo {
  url: string | null;
  isLive: boolean;
  title?: string | null;
  scheduledStart?: string | null;
}

export async function getLivestreamFromMainSite(): Promise<LivestreamInfo> {
  if (!churchOrgId) {
    return { url: null, isLive: false };
  }

  try {
    const { data, error } = await supabase
      .from("livestreams")
      .select("stream_url, is_live, organization_id, updated_at, title, scheduled_start")
      .eq("organization_id", churchOrgId)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (!error) {
      const row = data && data[0];
      if (row && (row as any).stream_url) {
        return {
          url: (row as any).stream_url as string,
          isLive: Boolean((row as any).is_live),
          title: (row as any).title ?? null,
          scheduledStart: (row as any).scheduled_start ?? null,
        };
      }
    }
  } catch {
    // ignore and fallback
  }

  return { url: null, isLive: false };
}
