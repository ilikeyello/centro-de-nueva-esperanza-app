import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getUrlForType(type: string): string {
  switch (type) {
    case "announcement": return "/#news-announcements";
    case "event":        return "/#news-events";
    case "livestream":   return "/#media";
    case "bulletin":     return "/#bulletin";
    default:             return "/";
  }
}

interface LocalizedContent {
  en: { title: string; body: string };
  es: { title: string; body: string };
}

// ─── APNs helpers ────────────────────────────────────────────────────────────

function base64UrlEncode(data: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(data)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function makeApnsJwt(teamId: string, keyId: string, p8Key: string): Promise<string> {
  const keyData = p8Key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", binaryKey, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]
  );
  const header  = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ alg: "ES256", kid: keyId })));
  const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ iss: teamId, iat: Math.floor(Date.now() / 1000) })));
  const signingInput = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" }, cryptoKey, new TextEncoder().encode(signingInput)
  );
  return `${signingInput}.${base64UrlEncode(signature)}`;
}

async function sendApns(
  token: string, title: string, body: string, url: string,
  bundleId: string, teamId: string, keyId: string, p8Key: string
): Promise<{ ok: boolean; status: number }> {
  try {
    const jwt = await makeApnsJwt(teamId, keyId, p8Key);
    // Sandbox for dev builds, production for App Store builds
    const apnsHost = Deno.env.get("APNS_SANDBOX") === "false"
      ? "api.push.apple.com"
      : "api.sandbox.push.apple.com";
    const res = await fetch(`https://${apnsHost}/3/device/${token}`, {
      method: "POST",
      headers: {
        "authorization": `bearer ${jwt}`,
        "apns-topic": bundleId,
        "apns-push-type": "alert",
        "apns-priority": "10",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        aps: { alert: { title, body }, sound: "default", badge: 1 },
        url, link: url,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error(`APNs error ${res.status} for token ${token.slice(0,10)}:`, errBody);
    }
    return { ok: res.ok, status: res.status };
  } catch (err) {
    console.error("APNs send exception:", err);
    return { ok: false, status: 500 };
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload = await req.json();
    const { type, table, record, old_record } = payload;
    console.log("auto-notify received:", { type, table, record });

    let content: LocalizedContent | null = null;
    let notificationType = "";
    let orgId = "";
    let targetClientUserId: string | null = null;

    if (type === "INSERT") {
      if (table === "announcements") {
        orgId = record.organization_id;
        notificationType = "announcement";
        content = {
          en: { title: "New Announcement", body: record.title_en || record.title_es || "New Announcement" },
          es: { title: "Nuevo Anuncio",     body: record.title_es || record.title_en || "Nuevo Anuncio" },
        };

      } else if (table === "events") {
        orgId = record.organization_id;
        notificationType = "event";
        const eventDateEn = new Date(record.event_date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const eventDateEs = new Date(record.event_date).toLocaleDateString("es-ES", { month: "short", day: "numeric" });
        content = {
          en: { title: "New Event",    body: `${record.title_en || record.title_es} — ${eventDateEn}` },
          es: { title: "Nuevo Evento", body: `${record.title_es || record.title_en} — ${eventDateEs}` },
        };

      } else if (table === "bulletin_comments") {
        const { data: post } = await supabase
          .from("bulletin_posts").select("author_id, title, organization_id")
          .eq("id", record.bulletin_post_id).single();

        if (!post) return new Response(JSON.stringify({ message: "Post not found, skipping" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (post.author_id && post.author_id === record.author_id) return new Response(JSON.stringify({ message: "Skipped: self-reply" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

        orgId = post.organization_id;
        notificationType = "bulletin";
        targetClientUserId = post.author_id ?? null;
        const commenter = record.author_name || "Someone";
        content = {
          en: { title: "New Reply to Your Post",           body: `${commenter} replied to "${post.title}"` },
          es: { title: "Nueva Respuesta a Tu Publicación", body: `${commenter} respondió a "${post.title}"` },
        };
      }

    } else if (type === "UPDATE") {
      if (table === "livestreams") {
        const wasLive = old_record?.is_live === true;
        const isNowLive = record.is_live === true;
        if (isNowLive && !wasLive) {
          orgId = record.organization_id;
          notificationType = "livestream";
          content = {
            en: { title: "We're Live!",      body: record.title || "Join us for our live service" },
            es: { title: "¡Estamos en Vivo!", body: record.title || "Únete a nuestro servicio en vivo" },
          };
        } else {
          return new Response(JSON.stringify({ message: "Skipped: not a going-live transition" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }
    }

    if (!orgId || !content) {
      return new Response(JSON.stringify({ message: "No notification needed for this event" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const notifUrl = getUrlForType(notificationType);
    const results = { webSuccess: 0, webFailed: 0, apnsSuccess: 0, apnsFailed: 0 };

    // ── 1. Web push (VAPID) ───────────────────────────────────────────────────
    let webQuery = supabase.from("push_subscriptions").select("endpoint, p256dh, auth, language").eq("org_id", orgId);
    if (targetClientUserId) webQuery = webQuery.eq("client_user_id", targetClientUserId);
    const { data: webSubs } = await webQuery;

    if (webSubs && webSubs.length > 0) {
      const vapidPublicKey  = Deno.env.get("VAPID_PUBLIC_KEY")  ?? "";
      const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
      const vapidSubject    = Deno.env.get("VAPID_SUBJECT")     ?? "mailto:contact@emanuelavina.com";
      const webpush = await import("https://esm.sh/web-push@3.6.6");
      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

      for (const sub of webSubs) {
        const lang: "en" | "es" = sub.language === "es" ? "es" : "en";
        const localized = content[lang];
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify({ title: localized.title, body: localized.body, icon: "/icon-192x192.png", badge: "/icon-192x192.png", data: { type: notificationType, url: notifUrl } })
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

    // ── 2. APNs (iOS native) ──────────────────────────────────────────────────
    const apnsKey    = Deno.env.get("APNS_KEY")    ?? "";
    const apnsKeyId  = Deno.env.get("APNS_KEY_ID") ?? "";
    const apnsTeamId = Deno.env.get("APNS_TEAM_ID") ?? "";
    const bundleId   = Deno.env.get("APNS_BUNDLE_ID") ?? "com.centronuevaesperanza.app";

    if (apnsKey && apnsKeyId && apnsTeamId) {
      const { data: deviceTokens } = await supabase
        .from("device_push_tokens").select("token, language").eq("org_id", orgId).eq("platform", "ios");

      console.log(`APNs: found ${deviceTokens?.length ?? 0} iOS tokens`);

      for (const device of deviceTokens ?? []) {
        const lang: "en" | "es" = device.language === "es" ? "es" : "en";
        const localized = content[lang];
        const { ok, status } = await sendApns(
          device.token, localized.title, localized.body, notifUrl,
          bundleId, apnsTeamId, apnsKeyId, apnsKey
        );
        if (ok) results.apnsSuccess++;
        else {
          results.apnsFailed++;
          if (status === 410) await supabase.from("device_push_tokens").delete().eq("token", device.token);
        }
      }
    } else {
      console.log("APNs credentials not configured, skipping native push");
    }

    console.log("auto-notify results:", results);
    return new Response(
      JSON.stringify({ success: true, ...results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in auto-notify:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
