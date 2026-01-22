# Quick Start - Multi-Church Platform

## What You Have Now

✅ **Complete database schema** (`supabase/schema.sql`) - All tables with RLS policies  
✅ **Clerk webhook** (`supabase/functions/clerk-webhook/index.ts`) - Auto-creates churches  
✅ **CNE church site** - Properly filters all data by organization_id  
✅ **Updated .env.local** - Has your org ID: `org_38agxTQYvbrRSYd2jdxcfL5DGXf`

## Your Action Items (In Order)

### 1. Set Up Supabase Database (5 minutes)

```bash
# Go to Supabase Dashboard → SQL Editor → New Query
# Copy/paste the entire contents of supabase/schema.sql
# Click "Run"
```

This creates all 12 tables:
- church_info, sermons, events, announcements, prayer_requests
- bulletin_posts, devotionals, music_playlists, livestreams
- games, gallery_images, event_rsvps

### 2. Deploy the Clerk Webhook (5 minutes)

```bash
# Install Supabase CLI (if needed)
npm install -g supabase

# Login
supabase login

# Link your project (replace with your project ref from Supabase URL)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the webhook
supabase functions deploy clerk-webhook --no-verify-jwt
```

**Save the webhook URL** - you'll get something like:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/clerk-webhook
```

### 3. Configure Clerk Webhook (3 minutes)

1. Go to **Clerk Dashboard** → **Webhooks** → **+ Add Endpoint**
2. Paste the webhook URL from step 2
3. Subscribe to events: `organization.created`, `organization.updated`, `organization.deleted`
4. Click **Create**
5. **Copy the Signing Secret** immediately

### 4. Set Webhook Environment Variables (2 minutes)

Go to **Supabase Dashboard** → **Edge Functions** → **clerk-webhook** → **Secrets**

Add these 3 secrets:

| Secret Name | Value | Where to Find |
|-------------|-------|---------------|
| `CLERK_WEBHOOK_SECRET` | Paste from Clerk | Step 3 above |
| `SUPABASE_URL` | Your project URL | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service_role key | Supabase → Settings → API |

### 5. Test the Automation (2 minutes)

1. Go to **Clerk Dashboard** → Create a new organization
2. Go to **Supabase** → Table Editor → `church_info`
3. You should see the new organization automatically appear!

### 6. Deploy CNE Site to Vercel (5 minutes)

Set these environment variables in Vercel:

```
VITE_SUPABASE_URL=https://wreovuejotnudkpaaffz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (your anon key)
VITE_CHURCH_ORG_ID=org_38agxTQYvbrRSYd2jdxcfL5DGXf
VITE_CLERK_PUBLISHABLE_KEY=pk_test_... (your clerk key)
```

Deploy and your site will automatically show content for that organization!

## How It Works

```
1. Create org in Clerk
   ↓
2. Clerk sends webhook to Supabase Edge Function
   ↓
3. Function creates record in church_info table
   ↓
4. Church site reads data filtered by VITE_CHURCH_ORG_ID
   ↓
5. Only that church's content appears
```

## Next: Build Admin Dashboard

You need **emanuelavina.com** to manage content for all churches.

I can build you a Next.js admin dashboard with:
- Clerk authentication (admin users only)
- Church selector dropdown
- Full CRUD for all content types
- File uploads for images/media
- Modern UI with shadcn/ui

Just say "build the admin dashboard" and I'll create it!

## Troubleshooting

**Webhook not working?**
- Check Supabase Edge Functions logs for errors
- Verify all 3 secrets are set correctly
- Test webhook in Clerk dashboard

**Church site not showing data?**
- Verify `VITE_CHURCH_ORG_ID` matches exactly (case-sensitive)
- Check browser console for errors
- Confirm church record exists in `church_info` table

**Need to manually add a church?**
```sql
INSERT INTO church_info (organization_id, name_en, name_es, address, phone, email, service_times_en, service_times_es)
VALUES ('org_YOUR_ORG_ID', 'Church Name', 'Nombre de Iglesia', 'Address', 'Phone', 'Email', 'Service Times', 'Horarios');
```
