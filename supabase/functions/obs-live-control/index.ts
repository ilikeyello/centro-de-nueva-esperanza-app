// obs-live-control — receives updates from the OBS dock (emanuelavina.com/obs-dock.html)
// and saves what part of the service is on right now. The app listens to the
// live_service_state table and changes the button under the livestream player.
//
// The dock sends the church's org id and its secret key. Only the key's
// SHA-256 hash is stored (live_control_keys), so this function runs without
// a Supabase login (verify_jwt = false) and checks the key itself.
//
// Body:
//   { org, key, action: "ping" }                         -> checks the key
//   { org, key, mode, songTitle?, verse?, delaySeconds? } -> saves the state
//
// delaySeconds pushes show_at into the future so the app changes the button
// when viewers actually see that moment (the video runs behind real life).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MODES = ["off", "worship", "offering", "sermon"] as const;
type Mode = (typeof MODES)[number];

interface Verse {
  book: string;
  chapter: number;
  verse: number | null;
  endVerse: number | null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function sameText(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function toInt(value: unknown, min: number, max: number): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

function cleanVerse(raw: unknown): Verse | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  const book = typeof v.book === "string" ? v.book.trim().toLowerCase() : "";
  if (!/^[1-3]?-?[a-z-]{2,30}$/.test(book)) return null;
  const chapter = toInt(v.chapter, 1, 150);
  if (chapter == null) return null;
  const verse = v.verse == null ? null : toInt(v.verse, 1, 200);
  const endVerse = v.endVerse == null ? null : toInt(v.endVerse, 1, 200);
  return {
    book,
    chapter,
    verse,
    endVerse: verse != null && endVerse != null && endVerse > verse ? endVerse : null,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Body must be JSON" }, 400);
  }

  const org = typeof body.org === "string" ? body.org.trim() : "";
  const key = typeof body.key === "string" ? body.key.trim() : "";
  if (!org || !key) return json({ error: "Missing church id or key" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: keyRow } = await supabase
    .from("live_control_keys")
    .select("key_hash")
    .eq("organization_id", org)
    .maybeSingle();
  if (!keyRow || !sameText(await sha256Hex(key), keyRow.key_hash)) {
    return json({ error: "Wrong church id or key" }, 401);
  }

  if (body.action === "ping") return json({ ok: true });

  const mode = body.mode as Mode;
  if (!MODES.includes(mode)) return json({ error: "Unknown mode" }, 400);

  const songTitle = typeof body.songTitle === "string" ? body.songTitle.trim().slice(0, 120) || null : null;
  const verse = cleanVerse(body.verse);
  const delaySeconds = toInt(body.delaySeconds ?? 0, 0, 90) ?? 0;

  const now = Date.now();
  const row = {
    organization_id: org,
    mode,
    // Only keep what belongs to the current part of the service.
    song_title: mode === "worship" ? songTitle : null,
    verse: mode === "sermon" ? verse : null,
    show_at: new Date(now + delaySeconds * 1000).toISOString(),
    updated_at: new Date(now).toISOString(),
  };

  const { error } = await supabase.from("live_service_state").upsert(row, { onConflict: "organization_id" });
  if (error) {
    console.error("obs-live-control save failed:", error);
    return json({ error: "Could not save" }, 500);
  }

  return json({ ok: true, state: row });
});
