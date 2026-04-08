import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2.39.0'
import webpush from 'npm:web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Payload sent by the database pg_net trigger
interface WebhookPayload {
  type: 'announcement' | 'event' | 'devotional' | 'comment';
  record: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: WebhookPayload = await req.json();

    if (!['announcement', 'event', 'devotional', 'comment'].includes(payload.type)) {
      return new Response(JSON.stringify({ message: "Ignored payload type" }), {
        headers: corsHeaders,
        status: 200,
      });
    }

    const vapidPublic  = Deno.env.get('VAPID_PUBLIC_KEY')  || '';
    const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY') || '';
    const vapidSubject = Deno.env.get('VAPID_SUBJECT')     || 'mailto:admin@example.com';

    webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

    let title  = '';
    let body   = '';
    let url    = '/';
    let org_id = '';
    let notificationType = '';

    if (payload.type === 'announcement') {
      const row = payload.record;
      title           = 'New Announcement / Nuevo Anuncio';
      body            = row.title_en || row.title_es || 'New Announcement';
      url             = '/#news-announcements';
      org_id          = row.organization_id;
      notificationType = 'announcement';

    } else if (payload.type === 'event') {
      const row  = payload.record;
      const date = row.event_date
        ? new Date(row.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '';
      title           = 'New Event / Nuevo Evento';
      body            = `${row.title_en || row.title_es || 'Event'} — ${date}`;
      url             = '/#news-events';
      org_id          = row.organization_id;
      notificationType = 'event';

    } else if (payload.type === 'devotional') {
      const row = payload.record;
      title           = 'New Devotional / Nuevo Devocional';
      body            = row.title || 'Tap to view';
      url             = '/';
      org_id          = row.organization_id;
      notificationType = 'devotional';

    } else if (payload.type === 'comment') {
      const row = payload.record;
      title           = 'New Reply to Your Post';
      body            = `${row.author_name || 'Someone'} replied to your post`;
      url             = '/#bulletin';
      org_id          = row.organization_id;
      notificationType = 'bulletin';
    }

    if (!org_id) {
      return new Response(JSON.stringify({ error: "No org_id in record" }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('org_id', org_id);

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: "No subscribers found" }), {
        headers: corsHeaders,
        status: 200,
      });
    }

    const notificationData = JSON.stringify({
      title,
      body,
      icon:  '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: { type: notificationType, url },
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            notificationData
          );
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
          }
          throw err;
        }
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;

    return new Response(
      JSON.stringify({ message: `Sent to ${successCount}/${subscriptions.length} subscribers` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})
