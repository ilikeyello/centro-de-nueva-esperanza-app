#!/bin/bash

echo "🔔 Push Notification Deployment Script"
echo "========================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI is not installed."
    echo ""
    echo "Please install it first:"
    echo "  npm install -g supabase"
    echo ""
    echo "Or use the Supabase Dashboard method instead (see PUSH_NOTIFICATION_SETUP.md)"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if logged in
if ! supabase projects list &> /dev/null
then
    echo "❌ Not logged in to Supabase"
    echo ""
    echo "Please login first:"
    echo "  supabase login"
    exit 1
fi

echo "✅ Logged in to Supabase"
echo ""

# Deploy the edge function
echo "📦 Deploying send-push-notification edge function..."
supabase functions deploy send-push-notification

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Edge function deployed successfully!"
    echo ""
    echo "⚠️  IMPORTANT: Don't forget to set the environment variables in Supabase Dashboard:"
    echo ""
    echo "1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/settings/functions"
    echo "2. Add these secrets:"
    echo ""
    echo "   VAPID_PUBLIC_KEY=BBrkeboelGXOYj8h4wRqnldwBSAMnJiFFuCu4rrMXwyFWnpWwqMHtsoVVLCJ3J5auGInGcdzs-K_M8GO18JR8LQ"
    echo "   VAPID_PRIVATE_KEY=QaPAX2TgRCqWoW9KAfEDUnKLaqsmvRhN4XpYzaqYwCw"
    echo "   VAPID_SUBJECT=mailto:your-email@example.com"
    echo ""
    echo "See PUSH_NOTIFICATION_SETUP.md for detailed instructions."
else
    echo ""
    echo "❌ Deployment failed. Please check the error above."
    echo ""
    echo "Alternative: Use the Supabase Dashboard to deploy manually."
    echo "See PUSH_NOTIFICATION_SETUP.md for instructions."
    exit 1
fi
