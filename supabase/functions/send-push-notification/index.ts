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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

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

    // Get all push subscriptions for this organization
    const { data: subscriptions, error: fetchError } = await supabaseClient
      .from("push_subscriptions")
      .select("*")
      .eq("org_id", orgId);

    if (fetchError) {
      console.error("Error fetching subscriptions:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch subscriptions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No subscriptions found", sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // VAPID keys - these should match the public key used in the client
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@example.com";

    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: icon || "/icon-192x192.png",
      badge: "/icon-192x192.png",
      url: url || "/",
    });

    let successCount = 0;
    let failureCount = 0;

    // Send notification to each subscription
    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        // Use web-push library to send notification
        const response = await sendWebPush(
          pushSubscription,
          notificationPayload,
          vapidPublicKey,
          vapidPrivateKey,
          vapidSubject
        );

        if (response.ok) {
          successCount++;
        } else {
          failureCount++;
          console.error(`Failed to send to ${subscription.endpoint}: ${response.status}`);
          
          // If subscription is invalid (410 Gone), remove it from database
          if (response.status === 410) {
            await supabaseClient
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", subscription.endpoint);
          }
        }
      } catch (error) {
        failureCount++;
        console.error(`Error sending to subscription:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        message: "Notifications sent",
        total: subscriptions.length,
        success: successCount,
        failed: failureCount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-push-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to send web push notification
async function sendWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<Response> {
  // Import web-push functionality
  const webpush = await import("https://esm.sh/web-push@3.6.6");
  
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  try {
    const result = await webpush.sendNotification(subscription, payload);
    return new Response(null, { status: result.statusCode });
  } catch (error: any) {
    return new Response(null, { status: error.statusCode || 500 });
  }
}
