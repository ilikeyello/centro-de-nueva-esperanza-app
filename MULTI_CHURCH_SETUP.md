# Multi-Church Platform Setup Guide

This guide will help you set up the complete multi-church platform architecture where:
- **emanuelavina.com** = Central admin hub for managing all churches
- **Individual church sites** (like CNE) = Public-facing sites that display content
- **Supabase** = Centralized database for all churches
- **Clerk** = Organization management and authentication

---

## Architecture Overview

```
Clerk (Create Org) 
    ↓ (webhook)
Supabase (Auto-create church_info record)
    ↓ (data isolation by organization_id)
├── Admin Hub (emanuelavina.com) - Manages content for all churches
└── Church Sites (CNE, etc.) - Display content filtered by their org_id
```

---

## Step 1: Set Up Supabase Database

### 1.1 Run the Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **+ New query**
4. Copy the entire contents of `supabase/schema.sql` from this project
5. Paste it into the SQL editor
6. Click **Run** to execute

This will create all necessary tables with proper Row Level Security (RLS) policies.

### 1.2 Get Your Supabase Credentials

You'll need these values:
- **Project URL**: Found in **Project Settings** → **API** → **Project URL**
- **Anon Key**: Found in **Project Settings** → **API** → **anon/public** key
- **Service Role Key**: Found in **Project Settings** → **API** → **service_role** key (⚠️ Keep this secret!)

---

## Step 2: Deploy the Clerk Webhook

The webhook automatically creates a church record in Supabase when you create a new organization in Clerk.

### 2.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 2.2 Login to Supabase

```bash
supabase login
```

### 2.3 Link Your Project

Replace `<your-project-ref>` with your Supabase project reference ID (found in your project URL):

```bash
cd /path/to/centro-de-nueva-esperanza
supabase link --project-ref <your-project-ref>
```

### 2.4 Deploy the Webhook Function

```bash
supabase functions deploy clerk-webhook --no-verify-jwt
```

After deployment, you'll get a URL like:
```
https://<your-project-ref>.supabase.co/functions/v1/clerk-webhook
```

**Save this URL** - you'll need it for Clerk configuration.

### 2.5 Set Environment Variables for the Function

1. Go to your Supabase dashboard
2. Navigate to **Edge Functions** (in the left sidebar)
3. Click on the **clerk-webhook** function
4. Go to **Secrets** tab
5. Add these three secrets:

| Secret Name | Value | Where to Find |
|-------------|-------|---------------|
| `CLERK_WEBHOOK_SECRET` | (You'll get this in Step 3) | Clerk Dashboard |
| `SUPABASE_URL` | Your project URL | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service_role key | Supabase → Settings → API |

---

## Step 3: Configure Clerk Webhook

### 3.1 Create the Webhook Endpoint

1. Go to your **Clerk Dashboard** (https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks** in the left sidebar
4. Click **+ Add Endpoint**
5. Enter the webhook URL from Step 2.4:
   ```
   https://<your-project-ref>.supabase.co/functions/v1/clerk-webhook
   ```
6. Under **Subscribe to events**, select:
   - ✅ `organization.created`
7. Click **Create**

### 3.2 Get the Signing Secret

1. After creating the webhook, Clerk will show you a **Signing Secret**
2. **Copy this secret immediately** (you won't be able to see it again)
3. Go back to Supabase → Edge Functions → clerk-webhook → Secrets
4. Add/update the `CLERK_WEBHOOK_SECRET` with this value

---

## Step 4: Set Up Individual Church Sites (Vercel)

Each church site needs to be deployed to Vercel with its own `VITE_CHURCH_ORG_ID`.

### 4.1 Create a New Organization in Clerk

1. Go to Clerk Dashboard
2. Create a new organization for the church
3. **Copy the Organization ID** (format: `org_xxxxxxxxxxxxx`)

The webhook will automatically create a record in Supabase's `church_info` table!

### 4.2 Deploy Church Site to Vercel

1. Push your church site code to GitHub
2. Import the project in Vercel
3. Set these environment variables in Vercel:

| Variable | Value | Example |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | `eyJhbGc...` |
| `VITE_CHURCH_ORG_ID` | The Clerk org ID for this church | `org_38agxTQYvbrRSYd2jdxcfL5DGXf` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key | `pk_test_...` |

4. Deploy the site

### 4.3 Verify the Church Record

1. Go to Supabase → Table Editor
2. Open the `church_info` table
3. You should see a record with your `organization_id`
4. Update the church details (name, address, phone, etc.) as needed

---

## Step 5: Set Up Admin Hub (emanuelavina.com)

The admin hub is where you'll manage content for ALL churches.

### 5.1 Create Admin Dashboard Project

You have two options:

**Option A: Use the existing admin-dashboard.html**
1. Update the Supabase credentials in the file
2. Host it on Vercel as a static site

**Option B: Build a proper Next.js admin dashboard** (Recommended)

I can help you build a full Next.js admin dashboard with:
- Clerk authentication (admin users only)
- Church selector dropdown
- Content management for all tables (sermons, events, announcements, etc.)
- File uploads for images/media
- Modern UI with shadcn/ui

Would you like me to create this?

### 5.2 Admin Dashboard Features

The admin should be able to:
- ✅ Select which church they're managing
- ✅ Add/edit/delete sermons
- ✅ Add/edit/delete events
- ✅ Add/edit/delete announcements
- ✅ Manage prayer requests
- ✅ Upload music playlists
- ✅ Set livestream URLs
- ✅ Create games (trivia, word search)
- ✅ Upload gallery images

---

## Step 6: Test the Complete Flow

### 6.1 Test Organization Creation

1. Create a new organization in Clerk
2. Check Supabase `church_info` table - should auto-populate
3. Deploy a new church site with that org_id
4. Verify the site loads correctly

### 6.2 Test Content Management

1. Log into admin hub (emanuelavina.com)
2. Select a church from the dropdown
3. Add a sermon/event/announcement
4. Go to that church's public site
5. Verify the content appears

### 6.3 Test Data Isolation

1. Create content for Church A
2. View Church B's site
3. Verify Church A's content does NOT appear on Church B

---

## Current Status & Next Steps

### ✅ Completed
- Database schema with all tables and RLS policies
- Clerk webhook for automatic church creation
- Church site (CNE) properly filters by organization_id

### 🔄 Your Action Items

1. **Run the database schema** in Supabase SQL Editor (Step 1.1)
2. **Deploy the webhook** using Supabase CLI (Step 2)
3. **Configure Clerk webhook** with the URL and get signing secret (Step 3)
4. **Update environment variables** in Supabase Edge Functions (Step 2.5)
5. **Test by creating a new org** in Clerk and verify it appears in Supabase

### 🚀 Recommended Next Steps

After the webhook is working:
1. Let me build you a proper Next.js admin dashboard for emanuelavina.com
2. Add file upload capabilities (Supabase Storage) for images/media
3. Set up email notifications for new content
4. Add analytics to track which churches are most active

---

## Troubleshooting

### Webhook not creating church records?
- Check Supabase Edge Functions logs
- Verify the `CLERK_WEBHOOK_SECRET` matches exactly
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly

### Church site not showing data?
- Verify `VITE_CHURCH_ORG_ID` matches exactly (case-sensitive)
- Check browser console for errors
- Verify the church record exists in `church_info` table

### RLS blocking queries?
- The schema uses public read access, so this shouldn't happen
- If it does, check that RLS policies were created correctly

---

## Security Notes

⚠️ **NEVER expose the Service Role Key in frontend code**
- Only use it in the admin dashboard backend or Edge Functions
- Church sites should only use the `anon` key

⚠️ **Clerk Webhook Secret**
- Keep this secret secure
- Rotate it if compromised

⚠️ **Organization IDs**
- These are safe to expose (they're in the frontend)
- They act as public identifiers, not security credentials

---

## Support

If you encounter issues:
1. Check Supabase Edge Functions logs
2. Check browser console on church sites
3. Verify all environment variables are set correctly
4. Test the webhook manually using curl or Postman
