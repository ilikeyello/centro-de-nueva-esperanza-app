# Push Notification Setup Guide

## Step 1: Set Environment Variables in Supabase Dashboard

Go to your Supabase project dashboard and add these secrets:

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/functions
2. Click on "Edge Functions" in the left sidebar
3. Scroll down to "Function Secrets"
4. Add these three secrets:

```
VAPID_PUBLIC_KEY=BBrkeboelGXOYj8h4wRqnldwBSAMnJiFFuCu4rrMXwyFWnpWwqMHtsoVVLCJ3J5auGInGcdzs-K_M8GO18JR8LQ
VAPID_PRIVATE_KEY=QaPAX2TgRCqWoW9KAfEDUnKLaqsmvRhN4XpYzaqYwCw
VAPID_SUBJECT=mailto:your-email@example.com
```

**Important:** Replace `your-email@example.com` with your actual email address.

## Step 2: Deploy the Edge Function

### Option A: Using Supabase CLI (Recommended)

If you have Supabase CLI installed:

```bash
cd centro-de-nueva-esperanza
supabase functions deploy send-push-notification
```

### Option B: Using Supabase Dashboard (Easier)

1. Go to https://supabase.com/dashboard/project/YOUR_PROJECT_ID/functions
2. Click "Create a new function"
3. Name it: `send-push-notification`
4. Copy and paste the code from: `supabase/functions/send-push-notification/index.ts`
5. Click "Deploy"

## Step 3: Test It

1. Deploy both websites (admin and church site)
2. On the church site, enable notifications when prompted
3. Go to admin dashboard → Content → Notifications tab
4. Send a test notification
5. You should receive it even if the app is closed!

## Troubleshooting

- **"No subscriptions found"**: Make sure users have enabled notifications on the church site
- **Notifications not appearing**: Check browser console for errors
- **Edge function errors**: Check Supabase logs in the dashboard

## What These Keys Do

- **VAPID_PUBLIC_KEY**: Used by the browser to subscribe to notifications (already set in the code)
- **VAPID_PRIVATE_KEY**: Used by the server to send notifications (kept secret)
- **VAPID_SUBJECT**: Your contact email (required by the Web Push protocol)
