// auto-notify — fans a single content change out to every subscribed device.
//
// Invoked two ways:
//   1. Database webhooks (AFTER INSERT/UPDATE) on announcements, events,
//      sermons, livestreams, bulletin_comments.
//   2. A pg_cron job that POSTs {"type":"SCHEDULED","table":"verses_of_the_day"}
//      once an hour; the handler only sends when it is 7am in the church's
//      timezone and today's verse hasn't gone out yet.
//
// Every notification carries a `url` (hash route) and, where it points at one
// specific item, an `itemId`. The app reads both on tap and opens that item.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { BOOK_NAMES, YEARLY_VERSES } from "./verse-data.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** The church's local timezone — drives the 7am daily-verse send. */
const CHURCH_TZ = "America/Denver";
const VERSE_SEND_HOUR = 7;

type Lang = "en" | "es";
interface LocalizedContent {
  en: { title: string; body: string };
  es: { title: string; body: string };
}

// Spanish is the app's default, so anything that isn't explicitly "en" gets es.
const langOf = (stored: string | null | undefined): Lang => (stored === "en" ? "en" : "es");

function routeFor(type: string): string {
  switch (type) {
    case "announcement": return "/#news-announcements";
    case "event":        return "/#news-events";
    case "livestream":   return "/#media";
    case "devotional":   return "/#media";
    case "verse":        return "/#verse";
    case "bulletin":     return "/#bulletin";
    default:             return "/";
  }
}

// ─── Dates in the church's timezone ──────────────────────────────────────────
// Deno's edge runtime is UTC. Everything user-facing (which verse is "today",
// whether it is 7am yet) has to be computed in CHURCH_TZ or the verse flips
// mid-evening and the cron fires an hour off across DST.

function churchParts(date = new Date()): { y: number; m: number; d: number; hour: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: CHURCH_TZ, year: "numeric", month: "2-digit",
    day: "2-digit", hour: "2-digit", hour12: false,
  });
  const p: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) p[part.type] = part.value;
  return { y: +p.year, m: +p.month, d: +p.day, hour: +p.hour % 24 };
}

/** YYYY-MM-DD in the church's timezone. */
function churchDateKey(date = new Date()): string {
  const { y, m, d } = churchParts(date);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** 0-based day of the year, so Jan 1 is always the first verse in the list. */
function dayOfYear(date = new Date()): number {
  const { y, m, d } = churchParts(date);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 86_400_000);
}

function formatReference(book: string, chapter: number, verse: number, endVerse: number | null, lang: Lang): string {
  const name = BOOK_NAMES[book]?.[lang] ?? book;
  const range = endVerse && endVerse > verse ? `${verse}-${endVerse}` : `${verse}`;
  return `${name} ${chapter}:${range}`;
}

/** Parses a `"<book> <chapter>:<verse>"` entry from the built-in yearly list. */
function parseBuiltIn(entry: string): { book: string; chapter: number; verse: number } | null {
  const match = entry.match(/^(.+)\s+(\d+):(\d+)$/);
  if (!match) return null;
  return { book: match[1], chapter: +match[2], verse: +match[3] };
}

// ─── APNs ────────────────────────────────────────────────────────────────────

function base64UrlEncode(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Apple rejects providers that mint a new auth token more than once every 20
// minutes (429 TooManyProviderTokenUpdates) and expires tokens after 60. The
// previous version built a fresh JWT per device, so a fan-out to more than a
// handful of phones got throttled and silently dropped. Build one, reuse it.
let cachedJwt: { token: string; madeAt: number } | null = null;
const JWT_TTL_MS = 45 * 60 * 1000;

async function apnsJwt(teamId: string, keyId: string, p8Key: string): Promise<string> {
  if (cachedJwt && Date.now() - cachedJwt.madeAt < JWT_TTL_MS) return cachedJwt.token;

  const keyData = p8Key
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\\n/g, "")
    .replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", binaryKey, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"],
  );
  const header = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ alg: "ES256", kid: keyId })));
  const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ iss: teamId, iat: Math.floor(Date.now() / 1000) })));
  const signingInput = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" }, cryptoKey, new TextEncoder().encode(signingInput),
  );
  const token = `${signingInput}.${base64UrlEncode(signature)}`;
  cachedJwt = { token, madeAt: Date.now() };
  return token;
}

const APNS_HOSTS = {
  production: "api.push.apple.com",
  sandbox: "api.sandbox.push.apple.com",
} as const;
type ApnsEnv = keyof typeof APNS_HOSTS;

interface ApnsCreds { teamId: string; keyId: string; p8Key: string; bundleId: string }

async function postToApns(
  host: string, token: string, jwt: string, bundleId: string, body: unknown,
  collapseId: string,
): Promise<{ status: number; reason: string }> {
  const headers: Record<string, string> = {
    authorization: `bearer ${jwt}`,
    "apns-topic": bundleId,
    "apns-push-type": "alert",
    "apns-priority": "10",
    "content-type": "application/json",
  };
  // Collapsing means a burst of the same kind replaces itself on the lock
  // screen instead of stacking up.
  if (collapseId) headers["apns-collapse-id"] = collapseId.slice(0, 64);

  const res = await fetch(`https://${host}/3/device/${token}`, {
    method: "POST", headers, body: JSON.stringify(body),
  });
  if (res.ok) return { status: res.status, reason: "" };
  const text = await res.text().catch(() => "");
  let reason = text;
  try { reason = JSON.parse(text)?.reason ?? text; } catch { /* keep raw */ }
  return { status: res.status, reason };
}

/**
 * Sends one alert. A device token is only valid against the APNs environment
 * the build was signed for — sandbox for Xcode builds, production for
 * TestFlight and the App Store — and the fleet is a mix of both. We try the
 * environment that worked last time for this device, then fall back to the
 * other on BadDeviceToken, and record the winner so the retry happens once.
 */
async function sendApns(
  device: { token: string; apns_env: string | null },
  title: string, body: string, url: string, itemId: string | number | null,
  type: string, creds: ApnsCreds,
): Promise<{ ok: boolean; env: ApnsEnv | null; status: number; reason: string }> {
  const jwt = await apnsJwt(creds.teamId, creds.keyId, creds.p8Key);
  const payload = {
    aps: {
      alert: { title, body },
      sound: "default",
      badge: 1,
      "thread-id": type,
    },
    type, url, link: url,
    itemId: itemId ?? null,
  };

  const known = device.apns_env === "sandbox" || device.apns_env === "production"
    ? device.apns_env as ApnsEnv
    : null;
  const order: ApnsEnv[] = known
    ? [known, known === "production" ? "sandbox" : "production"]
    : ["production", "sandbox"];

  let last = { status: 0, reason: "" };
  for (const env of order) {
    try {
      const result = await postToApns(
        APNS_HOSTS[env], device.token, jwt, creds.bundleId, payload, `${type}-${itemId ?? ""}`,
      );
      if (result.status >= 200 && result.status < 300) {
        return { ok: true, env, status: result.status, reason: "" };
      }
      last = result;
      // Only a wrong-environment or unregistered token is worth retrying on the
      // other host. Auth or payload errors will fail identically on both.
      if (!(result.status === 400 && result.reason === "BadDeviceToken")) break;
    } catch (err) {
      last = { status: 500, reason: String(err) };
      break;
    }
  }
  return { ok: false, env: null, status: last.status, reason: last.reason };
}

// ─── Fan-out ─────────────────────────────────────────────────────────────────

interface Delivery {
  orgId: string;
  type: string;
  content: LocalizedContent;
  itemId: string | number | null;
  /** Only notify this one bulletin author, rather than the whole org. */
  targetClientUserId?: string | null;
}

async function deliver(supabase: any, job: Delivery) {
  const url = routeFor(job.type);
  const results = { webSuccess: 0, webFailed: 0, apnsSuccess: 0, apnsFailed: 0, errors: [] as string[] };

  // ── Web push (VAPID) ───────────────────────────────────────────────────────
  let webQuery = supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth, language")
    .eq("org_id", job.orgId);
  if (job.targetClientUserId) webQuery = webQuery.eq("client_user_id", job.targetClientUserId);
  const { data: webSubs } = await webQuery;

  if (webSubs?.length) {
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:contact@emanuelavina.com";
    if (vapidPublicKey && vapidPrivateKey) {
      const webpush = await import("https://esm.sh/web-push@3.6.6");
      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

      for (const sub of webSubs) {
        const localized = job.content[langOf(sub.language)];
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify({
              title: localized.title, body: localized.body,
              icon: "/icon-192x192.png", badge: "/icon-192x192.png",
              data: { type: job.type, url, itemId: job.itemId ?? null },
            }),
          );
          results.webSuccess++;
        } catch (err: any) {
          results.webFailed++;
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          }
        }
      }
    }
  }

  // ── APNs (iOS native) ──────────────────────────────────────────────────────
  const p8Key = Deno.env.get("APNS_KEY") ?? "";
  const keyId = Deno.env.get("APNS_KEY_ID") ?? "";
  const teamId = Deno.env.get("APNS_TEAM_ID") ?? "";
  const bundleId = Deno.env.get("APNS_BUNDLE_ID") ?? "com.centronuevaesperanza.app";

  if (!p8Key || !keyId || !teamId) {
    results.errors.push("APNs credentials missing (need APNS_KEY, APNS_KEY_ID, APNS_TEAM_ID)");
    console.error("APNs credentials not configured — skipping native push");
    return results;
  }

  let deviceQuery = supabase
    .from("device_push_tokens")
    .select("token, language, apns_env")
    .eq("org_id", job.orgId)
    .eq("platform", "ios");
  const { data: devices, error: deviceError } = await deviceQuery;
  if (deviceError) results.errors.push(`device query: ${deviceError.message}`);

  console.log(`APNs: ${devices?.length ?? 0} iOS tokens for ${job.orgId} / ${job.type}`);

  const creds: ApnsCreds = { teamId, keyId, p8Key, bundleId };
  for (const device of devices ?? []) {
    const localized = job.content[langOf(device.language)];
    const { ok, env, status, reason } = await sendApns(
      device, localized.title, localized.body, url, job.itemId, job.type, creds,
    );
    if (ok) {
      results.apnsSuccess++;
      if (env && env !== device.apns_env) {
        await supabase.from("device_push_tokens").update({ apns_env: env }).eq("token", device.token);
      }
    } else {
      results.apnsFailed++;
      if (results.errors.length < 5) results.errors.push(`${status} ${reason}`);
      // 410 Unregistered, or BadDeviceToken on both hosts — the app is gone.
      if (status === 410 || (status === 400 && reason === "BadDeviceToken")) {
        await supabase.from("device_push_tokens").delete().eq("token", device.token);
      }
    }
  }

  return results;
}

// ─── Content builders ────────────────────────────────────────────────────────

function announcementContent(record: any): LocalizedContent {
  const es = record.title_es || record.title || record.title_en || "Nuevo anuncio";
  const en = record.title_en || record.title || record.title_es || "New announcement";
  return {
    es: { title: "Nuevo Anuncio", body: es },
    en: { title: "New Announcement", body: en },
  };
}

function eventContent(record: any): LocalizedContent {
  const fmt = (locale: string) =>
    record.event_date
      ? new Date(record.event_date).toLocaleDateString(locale, {
          month: "short", day: "numeric", timeZone: CHURCH_TZ,
        })
      : "";
  const esTitle = record.title_es || record.title || record.title_en || "Nuevo evento";
  const enTitle = record.title_en || record.title || record.title_es || "New event";
  const esDate = fmt("es-ES");
  const enDate = fmt("en-US");
  return {
    es: { title: "Nuevo Evento", body: esDate ? `${esTitle} — ${esDate}` : esTitle },
    en: { title: "New Event", body: enDate ? `${enTitle} — ${enDate}` : enTitle },
  };
}

function livestreamContent(record: any): LocalizedContent {
  return {
    es: { title: "¡Estamos en Vivo!", body: record.title || "Únete a nuestro servicio en vivo" },
    en: { title: "We're Live!", body: record.title || "Join us for our live service" },
  };
}

function devotionalContent(record: any): LocalizedContent {
  const es = record.title_es || record.title || record.title_en || "Nuevo devocional";
  const en = record.title_en || record.title || record.title_es || "New devotional";
  return {
    es: { title: "Nuevo Devocional", body: es },
    en: { title: "New Devotional", body: en },
  };
}

/** Resolves today's verse the same way the app does: admin override, else the built-in list. */
async function verseContent(supabase: any, orgId: string): Promise<LocalizedContent | null> {
  const dateKey = churchDateKey();

  const { data: override } = await supabase
    .from("verses_of_the_day")
    .select("book, chapter, verse, end_verse, note_en, note_es")
    .eq("organization_id", orgId)
    .eq("verse_date", dateKey)
    .maybeSingle();

  let book: string, chapter: number, verse: number, endVerse: number | null;
  let noteEn: string | null = null, noteEs: string | null = null;

  if (override) {
    book = override.book; chapter = override.chapter; verse = override.verse;
    endVerse = override.end_verse ?? null;
    noteEn = override.note_en ?? null; noteEs = override.note_es ?? null;
  } else {
    const entry = YEARLY_VERSES[dayOfYear() % YEARLY_VERSES.length];
    const parsed = entry ? parseBuiltIn(entry) : null;
    if (!parsed) return null;
    book = parsed.book; chapter = parsed.chapter; verse = parsed.verse; endVerse = null;
  }

  return {
    es: {
      title: "Versículo del Día",
      body: noteEs?.trim()
        ? `${formatReference(book, chapter, verse, endVerse, "es")} — ${noteEs.trim()}`
        : formatReference(book, chapter, verse, endVerse, "es"),
    },
    en: {
      title: "Verse of the Day",
      body: noteEn?.trim()
        ? `${formatReference(book, chapter, verse, endVerse, "en")} — ${noteEn.trim()}`
        : formatReference(book, chapter, verse, endVerse, "en"),
    },
  };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const payload = await req.json().catch(() => ({}));

    // Config probe — reports which secrets are present without revealing them.
    if (payload?.diag === true) {
      const present = (name: string) => (Deno.env.get(name) ?? "").length > 0;
      const { count } = await supabase
        .from("device_push_tokens").select("*", { count: "exact", head: true }).eq("platform", "ios");
      return json({
        diag: true,
        churchTime: churchDateKey(),
        churchHour: churchParts().hour,
        iosTokens: count ?? 0,
        secrets: {
          APNS_KEY: present("APNS_KEY"),
          APNS_KEY_ID: present("APNS_KEY_ID"),
          APNS_TEAM_ID: present("APNS_TEAM_ID"),
          APNS_BUNDLE_ID: Deno.env.get("APNS_BUNDLE_ID") ?? "(default) com.centronuevaesperanza.app",
          VAPID_PUBLIC_KEY: present("VAPID_PUBLIC_KEY"),
          VAPID_PRIVATE_KEY: present("VAPID_PRIVATE_KEY"),
        },
      });
    }

    const { type, table, record, old_record } = payload;
    console.log("auto-notify:", { type, table, id: record?.id });

    // ── Scheduled: daily verse of the day ────────────────────────────────────
    if (type === "SCHEDULED" && table === "verses_of_the_day") {
      const { hour } = churchParts();
      const force = payload.force === true;
      if (!force && hour !== VERSE_SEND_HOUR) {
        return json({ message: `Skipped: local hour is ${hour}, verse sends at ${VERSE_SEND_HOUR}` });
      }

      const dateKey = churchDateKey();
      const { data: orgs } = await supabase
        .from("device_push_tokens").select("org_id").not("org_id", "is", null);
      const orgIds = [...new Set((orgs ?? []).map((o: any) => o.org_id))];

      const sent: Record<string, unknown> = {};
      for (const orgId of orgIds) {
        // One row per org per day; the unique index makes a double-fire a no-op.
        const { error: claimError } = await supabase
          .from("notification_sends")
          .insert({ org_id: orgId, kind: "verse", ref_key: dateKey });
        if (claimError) { sent[orgId] = "already sent today"; continue; }

        const content = await verseContent(supabase, orgId);
        if (!content) { sent[orgId] = "no verse resolved"; continue; }
        sent[orgId] = await deliver(supabase, { orgId, type: "verse", content, itemId: dateKey });
      }
      return json({ success: true, dateKey, sent });
    }

    // ── Webhook-driven content ───────────────────────────────────────────────
    let job: Delivery | null = null;

    if (type === "INSERT" && table === "announcements") {
      job = { orgId: record.organization_id, type: "announcement", content: announcementContent(record), itemId: record.id };

    } else if (type === "INSERT" && table === "events") {
      job = { orgId: record.organization_id, type: "event", content: eventContent(record), itemId: record.id };

    } else if (type === "INSERT" && table === "sermons") {
      job = { orgId: record.organization_id, type: "devotional", content: devotionalContent(record), itemId: record.id };

    } else if (table === "livestreams" && (type === "INSERT" || type === "UPDATE")) {
      // A stream can arrive already live (INSERT) or be flipped live later
      // (UPDATE). The old code only handled the flip, so streams created in the
      // live state never notified anyone.
      const wasLive = type === "UPDATE" && old_record?.is_live === true;
      const isNowLive = record?.is_live === true;
      if (!isNowLive || wasLive) {
        return json({ message: "Skipped: not a going-live transition" });
      }
      job = { orgId: record.organization_id, type: "livestream", content: livestreamContent(record), itemId: record.id };

    } else if (type === "INSERT" && table === "verses_of_the_day") {
      // An admin picked a verse. Only push immediately if it's for today and
      // today's verse hasn't already gone out.
      const dateKey = churchDateKey();
      if (record.verse_date !== dateKey) return json({ message: "Skipped: verse is not for today" });
      const { error: claimError } = await supabase
        .from("notification_sends")
        .insert({ org_id: record.organization_id, kind: "verse", ref_key: dateKey });
      if (claimError) return json({ message: "Skipped: today's verse already sent" });
      const content = await verseContent(supabase, record.organization_id);
      if (!content) return json({ message: "Skipped: could not resolve verse" });
      job = { orgId: record.organization_id, type: "verse", content, itemId: dateKey };

    } else if (type === "INSERT" && table === "bulletin_comments") {
      const { data: post } = await supabase
        .from("bulletin_posts").select("author_id, title, organization_id")
        .eq("id", record.bulletin_post_id).single();
      if (!post) return json({ message: "Post not found, skipping" });
      if (post.author_id && post.author_id === record.author_id) return json({ message: "Skipped: self-reply" });

      const commenter = record.author_name || "Alguien";
      job = {
        orgId: post.organization_id,
        type: "bulletin",
        itemId: record.bulletin_post_id,
        targetClientUserId: post.author_id ?? null,
        content: {
          es: { title: "Nueva Respuesta a Tu Publicación", body: `${commenter} respondió a "${post.title}"` },
          en: { title: "New Reply to Your Post", body: `${record.author_name || "Someone"} replied to "${post.title}"` },
        },
      };
    }

    if (!job?.orgId || !job.content) {
      return json({ message: "No notification needed for this event" });
    }

    const results = await deliver(supabase, job);
    console.log("auto-notify results:", results);
    return json({ success: true, type: job.type, ...results });

  } catch (error: any) {
    console.error("Error in auto-notify:", error);
    return json({ error: error?.message ?? String(error) }, 500);
  }
});
