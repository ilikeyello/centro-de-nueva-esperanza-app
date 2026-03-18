import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2.39.0'
import webpush from 'npm:web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  type: 'announcement' | 'event' | 'devotional' | 'comment';
  record: any;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse the payload from the webhook
    const payload: WebhookPayload = await req.json();
    
    // Verify the request is made with the Custom Webhook Secret
    const webhookSecret = req.headers.get('x-webhook-secret');
    if (webhookSecret !== 'cne-internal-trigger-secret-2026') {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid webhook secret' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Verify JWT Signature (managed by Supabase gateway automatically)
    // We just ensure a token is present
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Missing token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // We only process specific payload types
    if (!['announcement', 'event', 'devotional', 'comment'].includes(payload.type)) {
      return new Response(JSON.stringify({ message: "Ignored payload type" }), { headers: corsHeaders, status: 200 });
    }

    // Configure Web Push with our new keys
    const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY') || '';
    const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY') || '';
    
    webpush.setVapidDetails(
      'mailto:emanuel@emanuelavina.com',
      vapidPublic,
      vapidPrivate
    );

    // Depending on the payload, construct the notification
    let title = '';
    let body = '';
    let url = '/';
    let org_id = '';
    
    if (payload.type === 'announcement') {
      const row = payload.record;
      title = 'New Announcement / Nuevo Anuncio';
      body = row.titleEn || row.titleEs || 'New Announcement';
      url = '/#news-announcements';
      org_id = row.org_id;
    } else if (payload.type === 'event') {
      const row = payload.record;
      title = 'New Event / Nuevo Evento';
      const date = row.eventDate ? new Date(row.eventDate).toLocaleDateString() : '';
      body = `${row.titleEn || row.titleEs || 'Event'} - ${date}`;
      url = '/#news-events';
      org_id = row.org_id;
    } else if (payload.type === 'devotional') {
      const row = payload.record;
      title = 'New Devotional / Nuevo Devocional';
      body = row.title || 'Tap to view';
      url = '/';
      org_id = row.org_id;
    } else if (payload.type === 'comment') {
      const row = payload.record;
      title = 'New Comment / Nuevo Comentario';
      body = `${row.authorName || 'Someone'} commented`;
      url = '/';
      org_id = row.org_id;
    }

    if (!org_id) {
       return new Response(JSON.stringify({ error: "No org_id present" }), { headers: corsHeaders, status: 400 });
    }

    // Fetch all subscribers for this org
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('org_id', org_id);

    if (error) throw error;
    if (!subscriptions || subscriptions.length === 0) {
       return new Response(JSON.stringify({ message: "No subscribers found for this org" }), { headers: corsHeaders, status: 200 });
    }

    const notificationData = JSON.stringify({
      title,
      body,
      icon: '/icon-192x192.png',
      data: {
         type: payload.type,
         url
      }
    });

    // Send push notification to all subscribers
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };
        
        try {
          await webpush.sendNotification(pushSubscription, notificationData);
        } catch (err: any) {
          // If the subscription is expired or invalid (410, 404), we should delete it from our DB
          if (err.statusCode === 410 || err.statusCode === 404) {
             await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          }
          throw err;
        }
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;

    return new Response(
      JSON.stringify({ message: `Sent to ${successCount}/${subscriptions.length} subscribers` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
