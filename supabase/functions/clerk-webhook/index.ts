import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Webhook } from 'https://esm.sh/svix@1';

// --- Types for the incoming webhook payload ---
type ClerkEvent = {
  data: {
    id: string;
    name: string;
    slug?: string;
    image_url?: string;
    created_by?: string;
  };
  object: 'event';
  type: 'organization.created' | 'organization.updated' | 'organization.deleted';
};

// --- Main Function ---
serve(async (req) => {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // 1. Get the webhook signature and payload from the request
    const svix_id = req.headers.get('svix-id');
    const svix_timestamp = req.headers.get('svix-timestamp');
    const svix_signature = req.headers.get('svix-signature');
    
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Missing Svix headers');
      return new Response('Missing Svix headers', { status: 400 });
    }

    // Get raw body for signature verification
    const body = await req.text();
    
    // 2. Verify the webhook signature
    const webhookSecret = Deno.env.get('CLERK_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET is not set');
      return new Response('Server configuration error', { status: 500 });
    }

    const wh = new Webhook(webhookSecret);
    let evt: ClerkEvent;
    
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as ClerkEvent;
    } catch (err) {
      console.error('Webhook verification failed:', err instanceof Error ? err.message : String(err));
      return new Response('Invalid signature', { status: 401 });
    }

    // 3. Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return new Response('Server configuration error', { status: 500 });
    }

    // 4. Create a Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // 5. Handle different event types
    if (evt.type === 'organization.created') {
      const { id, name, created_by } = evt.data;

      console.log(`Processing organization.created event for: ${id} - ${name}`);

      // Check if organization already exists (idempotency)
      const { data: existing } = await supabaseAdmin
        .from('church_info')
        .select('id')
        .eq('organization_id', id)
        .single();

      if (existing) {
        console.log(`Organization ${id} already exists, skipping insert`);
        return new Response('Organization already exists', { status: 200 });
      }

      // Insert the new organization into the 'church_info' table
      const { error } = await supabaseAdmin.from('church_info').insert([
        {
          organization_id: id,
          name: name,
          created_by: created_by || 'system',
          address: 'To be updated',
          phone: 'To be updated',
          email: 'To be updated',
          service_times: 'To be updated',
          description: null,
          facebook_page_url: null,
          website_url: null,
          latitude: null,
          longitude: null,
        },
      ]);

      if (error) {
        console.error('Error inserting organization:', error);
        return new Response(`Database error: ${error.message}`, { status: 500 });
      }

      console.log(`✅ Successfully created church record for: ${id} - ${name}`);
      return new Response(JSON.stringify({ success: true, organization_id: id }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (evt.type === 'organization.updated') {
      const { id, name } = evt.data;
      
      console.log(`Processing organization.updated event for: ${id}`);

      const { error } = await supabaseAdmin
        .from('church_info')
        .update({
          name: name,
          updated_at: new Date().toISOString(),
        })
        .eq('organization_id', id);

      if (error) {
        console.error('Error updating organization:', error);
        return new Response(`Database error: ${error.message}`, { status: 500 });
      }

      console.log(`✅ Successfully updated church record for: ${id}`);
      return new Response(JSON.stringify({ success: true, organization_id: id }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (evt.type === 'organization.deleted') {
      const { id } = evt.data;
      
      console.log(`Processing organization.deleted event for: ${id}`);

      // Soft delete or hard delete - your choice
      // For now, we'll hard delete (CASCADE will remove all related data)
      const { error } = await supabaseAdmin
        .from('church_info')
        .delete()
        .eq('organization_id', id);

      if (error) {
        console.error('Error deleting organization:', error);
        return new Response(`Database error: ${error.message}`, { status: 500 });
      }

      console.log(`✅ Successfully deleted church record for: ${id}`);
      return new Response(JSON.stringify({ success: true, organization_id: id }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Unknown event type
    console.log(`Received unhandled event type: ${evt.type}`);
    return new Response('Event type not handled', { status: 200 });

  } catch (error) {
    console.error('Unexpected error:', error instanceof Error ? error.message : String(error));
    return new Response('Internal server error', { status: 500 });
  }
});
