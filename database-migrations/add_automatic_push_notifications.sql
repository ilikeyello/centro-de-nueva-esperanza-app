-- =====================================================
-- AUTOMATIC PUSH NOTIFICATIONS SYSTEM
-- =====================================================
-- This migration adds database triggers to automatically send push notifications
-- for: announcements, events, devotionals, livestreams, and bulletin replies

-- =====================================================
-- 1. CREATE FUNCTION TO SEND PUSH NOTIFICATIONS
-- =====================================================
CREATE OR REPLACE FUNCTION notify_push_subscribers(
  p_org_id TEXT,
  p_title TEXT,
  p_body TEXT,
  p_url TEXT DEFAULT '/',
  p_language TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_supabase_url TEXT;
  v_supabase_anon_key TEXT;
  v_response TEXT;
BEGIN
  -- Get Supabase URL and anon key from environment
  -- These should be set in your Supabase project settings
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_supabase_anon_key := current_setting('app.settings.supabase_anon_key', true);
  
  IF v_supabase_url IS NULL OR v_supabase_anon_key IS NULL THEN
    RAISE WARNING 'Supabase URL or anon key not configured';
    RETURN;
  END IF;

  -- Call the edge function using pg_net extension
  PERFORM
    net.http_post(
      url := v_supabase_url || '/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_supabase_anon_key
      ),
      body := jsonb_build_object(
        'orgId', p_org_id,
        'title', p_title,
        'body', p_body,
        'url', p_url,
        'icon', '/icon-192x192.png'
      )
    );
    
  RAISE NOTICE 'Push notification queued: % - %', p_title, p_body;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to send push notification: %', SQLERRM;
END;
$$;

-- =====================================================
-- 2. TRIGGER FOR NEW ANNOUNCEMENTS
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_announcement_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Send notification for new announcement
  PERFORM notify_push_subscribers(
    NEW.organization_id,
    'New Announcement',
    COALESCE(NEW.title_en, NEW.title_es),
    '/announcements'
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_announcement_created ON announcements;
CREATE TRIGGER on_announcement_created
  AFTER INSERT ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION trigger_announcement_notification();

-- =====================================================
-- 3. TRIGGER FOR NEW EVENTS
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_event_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Send notification for new event
  PERFORM notify_push_subscribers(
    NEW.organization_id,
    'New Event',
    COALESCE(NEW.title_en, NEW.title_es) || ' - ' || TO_CHAR(NEW.event_date, 'Mon DD, YYYY'),
    '/events'
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_event_created ON events;
CREATE TRIGGER on_event_created
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION trigger_event_notification();

-- =====================================================
-- 4. TRIGGER FOR NEW DEVOTIONALS (SERMONS)
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_devotional_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Send notification for new devotional/sermon
  PERFORM notify_push_subscribers(
    NEW.organization_id,
    'New Devotional',
    NEW.title,
    '/devotionals'
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_sermon_created ON sermons;
CREATE TRIGGER on_sermon_created
  AFTER INSERT ON sermons
  FOR EACH ROW
  EXECUTE FUNCTION trigger_devotional_notification();

-- =====================================================
-- 5. TRIGGER FOR LIVESTREAM GOING LIVE
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_livestream_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only send notification when livestream changes from not live to live
  IF NEW.is_live = true AND (OLD.is_live IS NULL OR OLD.is_live = false) THEN
    PERFORM notify_push_subscribers(
      NEW.organization_id,
      'We''re Live!',
      COALESCE(NEW.title, 'Join us for our live service'),
      '/livestream'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_livestream_live ON livestreams;
CREATE TRIGGER on_livestream_live
  AFTER INSERT OR UPDATE OF is_live ON livestreams
  FOR EACH ROW
  EXECUTE FUNCTION trigger_livestream_notification();

-- =====================================================
-- 6. TRIGGER FOR BULLETIN POST REPLIES
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_bulletin_reply_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_post_author_id TEXT;
  v_post_title TEXT;
BEGIN
  -- Get the original post's author and title
  SELECT author_id, title INTO v_post_author_id, v_post_title
  FROM bulletin_posts
  WHERE id = NEW.post_id;
  
  -- Only notify if someone else replied (not the author replying to their own post)
  IF v_post_author_id IS NOT NULL AND v_post_author_id != NEW.author_id THEN
    PERFORM notify_push_subscribers(
      NEW.organization_id,
      'New Reply to Your Post',
      'Someone replied to "' || v_post_title || '"',
      '/bulletin'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_bulletin_comment_created ON bulletin_comments;
CREATE TRIGGER on_bulletin_comment_created
  AFTER INSERT ON bulletin_comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_bulletin_reply_notification();

-- =====================================================
-- NOTES
-- =====================================================
-- To enable these triggers, you need to:
-- 1. Install the pg_net extension: CREATE EXTENSION IF NOT EXISTS pg_net;
-- 2. Set the Supabase URL and anon key in your project settings
-- 3. Deploy the send-push-notification edge function
-- 4. Make sure VAPID keys are set in edge function secrets
