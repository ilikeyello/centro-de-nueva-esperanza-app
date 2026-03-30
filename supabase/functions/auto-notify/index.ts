import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const payload = await req.json();
    const { type, record, old_record } = payload;

    console.log("Auto-notify webhook received:", { type, record });

    let notificationTitle = "";
    let notificationBody = "";
    let notificationUrl = "/";
    let orgId = "";

    // Handle different event types
    switch (type) {
      case "INSERT":
        if (payload.table === "announcements") {
          orgId = record.organization_id;
          notificationTitle = "New Announcement";
          notificationBody = record.title_en || record.title_es;
          notificationUrl = "/announcements";
        } else if (payload.table === "events") {
          orgId = record.organization_id;
          notificationTitle = "New Event";
          const eventDate = new Date(record.event_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          notificationBody = `${record.title_en || record.title_es} - ${eventDate}`;
          notificationUrl = "/events";
        } else if (payload.table === "sermons") {
          orgId = record.organization_id;
          notificationTitle = "New Devotional";
          notificationBody = record.title;
          notificationUrl = "/devotionals";
        } else if (payload.table === "bulletin_comments") {
          // Get the original post to check author and get title
          const { data: post } = await supabaseClient
            .from("bulletin_posts")
            .select("author_id, title, organization_id")
            .eq("id", record.post_id)
            .single();

          if (post && post.author_id !== record.author_id) {
            orgId = post.organization_id;
            notificationTitle = "New Reply to Your Post";
            notificationBody = `Someone replied to "${post.title}"`;
            notificationUrl = "/bulletin";
          } else {
            // Don't send notification if author replied to their own post
            return new Response(
              JSON.stringify({ message: "Skipped: author replied to own post" }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
        break;

      case "UPDATE":
        if (payload.table === "livestreams") {
          // Only notify when going live (false -> true or null -> true)
          if (record.is_live === true && (!old_record?.is_live || old_record.is_live === false)) {
            orgId = record.organization_id;
            notificationTitle = "We're Live!";
            notificationBody = record.title || "Join us for our live service";
            notificationUrl = "/livestream";
          } else {
            return new Response(
              JSON.stringify({ message: "Skipped: livestream not going live" }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Unknown event type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    if (!orgId || !notificationTitle) {
      return new Response(
        JSON.stringify({ error: "Could not determine notification details" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call the send-push-notification function
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    const response = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        orgId,
        title: notificationTitle,
        body: notificationBody,
        url: notificationUrl,
        icon: "/icon-192x192.png",
      }),
    });

    const result = await response.json();

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in auto-notify:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
