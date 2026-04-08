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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload = await req.json();
    const { type, table, record, old_record } = payload;

    console.log("auto-notify received:", { type, table, record });

    let notificationTitle = "";
    let notificationBody = "";
    let notificationType = "";
    let orgId = "";
    // When set, only the subscriber whose client_user_id matches is notified
    let targetClientUserId: string | null = null;

    if (type === "INSERT") {
      if (table === "announcements") {
        orgId = record.organization_id;
        notificationTitle = "New Announcement / Nuevo Anuncio";
        notificationBody = record.title_en || record.title_es || "New Announcement";
        notificationType = "announcement";

      } else if (table === "events") {
        orgId = record.organization_id;
        const eventDate = new Date(record.event_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        notificationTitle = "New Event / Nuevo Evento";
        notificationBody = `${record.title_en || record.title_es} — ${eventDate}`;
        notificationType = "event";

      } else if (table === "bulletin_comments") {
        // Fetch the original post to get its author and org
        const { data: post } = await supabase
          .from("bulletin_posts")
          .select("author_id, title, organization_id")
          .eq("id", record.bulletin_post_id)
          .single();

        if (!post) {
          return new Response(JSON.stringify({ message: "Post not found, skipping" }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Don't notify if the commenter is the post author
        if (post.author_id && post.author_id === record.author_id) {
          return new Response(JSON.stringify({ message: "Skipped: self-reply" }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        orgId = post.organization_id;
        notificationTitle = "New Reply to Your Post";
        notificationBody = `${record.author_name || "Someone"} replied to "${post.title}"`;
        notificationType = "bulletin";
        // Only notify the post author's device(s)
        targetClientUserId = post.author_id ?? null;
      }

    } else if (type === "UPDATE") {
      if (table === "livestreams") {
        const wasLive = old_record?.is_live === true;
        const isNowLive = record.is_live === true;
        if (isNowLive && !wasLive) {
          orgId = record.organization_id;
          notificationTitle = "We're Live! / ¡Estamos en Vivo!";
          notificationBody = record.title || "Join us for our live service";
          notificationType = "livestream";
        } else {
          return new Response(JSON.stringify({ message: "Skipped: not a going-live transition" }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    if (!orgId || !notificationTitle) {
      return new Response(JSON.stringify({ message: "No notification needed for this event" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build subscription query
    let query = supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("org_id", orgId);

    if (targetClientUserId) {
      // Bulletin comment: only notify the post author's devices
      query = query.eq("client_user_id", targetClientUserId);
    }

    const { data: subscriptions, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching subscriptions:", fetchError);
      return new Response(JSON.stringify({ error: "Failed to fetch subscriptions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscriptions found", sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Load VAPID keys from environment
    const vapidPublicKey  = Deno.env.get("VAPID_PUBLIC_KEY")  ?? "";
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
    const vapidSubject    = Deno.env.get("VAPID_SUBJECT")     ?? "mailto:contact@emanuelavina.com";

    const webpush = await import("https://esm.sh/web-push@3.6.6");
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const notificationPayload = JSON.stringify({
      title: notificationTitle,
      body:  notificationBody,
      icon:  "/icon-192x192.png",
      badge: "/icon-192x192.png",
      data: {
        type: notificationType,
        url:  getUrlForType(notificationType),
      },
    });

    let successCount = 0;
    let failureCount = 0;

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notificationPayload
        );
        successCount++;
      } catch (err: any) {
        failureCount++;
        console.error(`Failed to send to ${sub.endpoint}:`, err?.statusCode);
        // Remove expired/gone subscriptions
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total: subscriptions.length,
        sent: successCount,
        failed: failureCount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in auto-notify:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
