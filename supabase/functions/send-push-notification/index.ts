import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  orgId: string;
}

// ─── APNs JWT helpers ────────────────────────────────────────────────────────

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
    "pkcs8", binaryKey,
    { name: "ECDSA", namedCurve: "P-256" },
    false, ["sign"]
  );

  const header  = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ alg: "ES256", kid: keyId })));
  const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ iss: teamId, iat: Math.floor(Date.now() / 1000) })));
  const signingInput = `${header}.${payload}`;

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  return `${signingInput}.${base64UrlEncode(signature)}`;
}

async function sendApnsNotification(
  token: string, title: string, body: string,
  url: string | undefined, bundleId: string,
  teamId: string, keyId: string, p8Key: string
): Promise<{ ok: boolean; status: number }> {
  try {
    const jwt = await makeApnsJwt(teamId, keyId, p8Key);
    // Sandbox for dev builds, production for App Store builds
    const apnsHost = Deno.env.get("APNS_SANDBOX") === "false"
      ? "api.push.apple.com"
      : "api.sandbox.push.apple.com";
    const response = await fetch(`https://${apnsHost}/3/device/${token}`, {
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
        url: url || "#media",
        link: url || "#media",
      }),
    });
    return { ok: response.ok, status: response.status };
  } catch (error) {
    console.error("APNs send error:", error);
    return { ok: false, status: 500 };
  }
}

// ─── Web Push helper ─────────────────────────────────────────────────────────

async function sendWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string, vapidPublicKey: string, vapidPrivateKey: string, vapidSubject: string
): Promise<Response> {
  const webpush = await import("https://esm.sh/web-push@3.6.6");
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  try {
    const result = await webpush.sendNotification(subscription, payload);
    return new Response(null, { status: result.statusCode });
  } catch (error: any) {
    return new Response(null, { status: error.statusCode || 500 });
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { title, body, icon, url, orgId }: NotificationPayload = await req.json();

    if (!title || !body || !orgId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, body, orgId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = { webSuccess: 0, webFailed: 0, apnsSuccess: 0, apnsFailed: 0 };

    // ── 1. Web push (VAPID) ───────────────────────────────────────────────────
    const vapidPublicKey  = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
    const vapidSubject    = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@example.com";

    const { data: webSubs } = await supabaseClient
      .from("push_subscriptions").select("*").eq("org_id", orgId);

    const webPayload = JSON.stringify({
      title, body,
      icon: icon || "/icon-192x192.png",
      badge: "/icon-192x192.png",
      url: url || "/",
    });

    for (const sub of webSubs ?? []) {
      try {
        const res = await sendWebPush(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          webPayload, vapidPublicKey, vapidPrivateKey, vapidSubject
        );
        if (res.ok) results.webSuccess++;
        else {
          results.webFailed++;
          if (res.status === 410) {
            await supabaseClient.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          }
        }
      } catch { results.webFailed++; }
    }

    // ── 2. APNs (iOS native) ──────────────────────────────────────────────────
    const apnsKey    = Deno.env.get("APNS_KEY") ?? "";
    const apnsKeyId  = Deno.env.get("APNS_KEY_ID") ?? "";
    const apnsTeamId = Deno.env.get("APNS_TEAM_ID") ?? "";
    const bundleId   = Deno.env.get("APNS_BUNDLE_ID") ?? "com.centronuevaesperanza.app";

    if (apnsKey && apnsKeyId && apnsTeamId) {
      const { data: deviceTokens } = await supabaseClient
        .from("device_push_tokens").select("*")
        .eq("org_id", orgId).eq("platform", "ios");

      for (const device of deviceTokens ?? []) {
        const { ok, status } = await sendApnsNotification(
          device.token, title, body, url,
          bundleId, apnsTeamId, apnsKeyId, apnsKey
        );
        if (ok) results.apnsSuccess++;
        else {
          results.apnsFailed++;
          if (status === 410) {
            await supabaseClient.from("device_push_tokens").delete().eq("token", device.token);
          }
        }
      }
    } else {
      console.log("APNs credentials not set — skipping native push");
    }

    return new Response(
      JSON.stringify({ message: "Notifications sent", ...results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
