# Automatic Push Notifications Setup

This guide shows you how to set up automatic push notifications for:
- ✅ New Announcements
- ✅ New Events
- ✅ New Devotionals (Sermons)
- ✅ Livestream Going Live
- ✅ Bulletin Post Replies

## Step 1: Deploy the Auto-Notify Edge Function

### Option A: Using Supabase Dashboard (Easiest)

1. Go to https://supabase.com/dashboard → Your Project → **Edge Functions**
2. Click **"Create a new function"**
3. Name it: `auto-notify`
4. Copy the code from: `supabase/functions/auto-notify/index.ts`
5. Paste it into the editor
6. Click **"Deploy function"**

### Option B: Using CLI

```bash
cd centro-de-nueva-esperanza
supabase functions deploy auto-notify
```

## Step 2: Create Database Webhooks

Go to https://supabase.com/dashboard → Your Project → **Database** → **Webhooks**

Create **5 webhooks** (one for each notification type):

### Webhook 1: New Announcements
- **Name**: `notify-new-announcement`
- **Table**: `announcements`
- **Events**: Check only `Insert`
- **Type**: `HTTP Request`
- **Method**: `POST`
- **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/auto-notify`
- **HTTP Headers**:
  ```
  Authorization: Bearer YOUR_SUPABASE_ANON_KEY
  Content-Type: application/json
  ```
- **HTTP Params**: Leave empty
- Click **"Create webhook"**

### Webhook 2: New Events
- **Name**: `notify-new-event`
- **Table**: `events`
- **Events**: Check only `Insert`
- **Type**: `HTTP Request`
- **Method**: `POST`
- **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/auto-notify`
- **HTTP Headers**:
  ```
  Authorization: Bearer YOUR_SUPABASE_ANON_KEY
  Content-Type: application/json
  ```
- Click **"Create webhook"**

### Webhook 3: New Devotionals
- **Name**: `notify-new-devotional`
- **Table**: `sermons`
- **Events**: Check only `Insert`
- **Type**: `HTTP Request`
- **Method**: `POST`
- **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/auto-notify`
- **HTTP Headers**:
  ```
  Authorization: Bearer YOUR_SUPABASE_ANON_KEY
  Content-Type: application/json
  ```
- Click **"Create webhook"**

### Webhook 4: Livestream Going Live
- **Name**: `notify-livestream-live`
- **Table**: `livestreams`
- **Events**: Check `Insert` AND `Update`
- **Type**: `HTTP Request`
- **Method**: `POST`
- **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/auto-notify`
- **HTTP Headers**:
  ```
  Authorization: Bearer YOUR_SUPABASE_ANON_KEY
  Content-Type: application/json
  ```
- Click **"Create webhook"**

### Webhook 5: Bulletin Post Replies
- **Name**: `notify-bulletin-reply`
- **Table**: `bulletin_comments`
- **Events**: Check only `Insert`
- **Type**: `HTTP Request`
- **Method**: `POST`
- **URL**: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/auto-notify`
- **HTTP Headers**:
  ```
  Authorization: Bearer YOUR_SUPABASE_ANON_KEY
  Content-Type: application/json
  ```
- Click **"Create webhook"**

## Step 3: Find Your Values

### Your Project Reference
- Go to Settings → General
- Look for "Reference ID" (e.g., `abcdefghijk`)
- Your URL will be: `https://abcdefghijk.supabase.co/functions/v1/auto-notify`

### Your Anon Key
- Go to Settings → API
- Copy the "anon public" key
- Use it in the Authorization header: `Bearer YOUR_KEY_HERE`

## Step 4: Test It!

1. **Test Announcement**: Create a new announcement in the admin dashboard
2. **Test Event**: Create a new event
3. **Test Devotional**: Upload a new sermon/devotional
4. **Test Livestream**: Toggle a livestream to "Live"
5. **Test Bulletin Reply**: Have someone reply to a bulletin post

All subscribed users should receive push notifications automatically! 🎉

## Troubleshooting

- **No notifications sent**: Check Supabase Edge Functions logs for errors
- **Webhook not firing**: Check Database → Webhooks → View logs
- **Users not receiving**: Make sure they've subscribed to notifications on the church site

## How It Works

```
Admin creates content → Database webhook triggers → auto-notify function → 
send-push-notification function → All subscribed users get notification
```
