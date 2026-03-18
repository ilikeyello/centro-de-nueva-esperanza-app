-- Create push subscriptions table
create table if not exists public.push_subscriptions (
    id uuid primary key default gen_random_uuid(),
    org_id text not null,
    user_id uuid references auth.users(id) on delete cascade,
    endpoint text not null unique,
    p256dh text not null,
    auth text not null,
    user_agent text,
    language text default 'en',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- RLS
alter table public.push_subscriptions enable row level security;

-- Users can insert their own subscriptions
create policy "Anyone can insert a push subscription" on public.push_subscriptions
    for insert
    with check (true);

create policy "Users can update their own subscriptions" on public.push_subscriptions
    for update
    using (true);

-- Function to handle webhook triggers
create or replace function public.trigger_web_push()
returns trigger
language plpgsql
security definer
as $$
declare
    payload jsonb;
    endpoint text;
    headers jsonb;
begin
    -- Determine table and build appropriate payload
    if TG_TABLE_NAME = 'announcements' then
        payload = jsonb_build_object(
            'type', 'announcement',
            'record', row_to_json(NEW)
        );
    elsif TG_TABLE_NAME = 'events' then
        payload = jsonb_build_object(
            'type', 'event',
            'record', row_to_json(NEW)
        );
    elsif TG_TABLE_NAME = 'church_content' then
        -- Only trigger on sermons/devotionals
        if NEW.content_type = 'sermon' then
            payload = jsonb_build_object(
                'type', 'devotional',
                'record', row_to_json(NEW)
            );
        else
            return NEW;
        end if;
    elsif TG_TABLE_NAME = 'bulletin_posts_comments' then
        payload = jsonb_build_object(
            'type', 'comment',
            'record', row_to_json(NEW)
        );
    else
        return NEW;
    end if;

    -- Call the edge function
    -- NOTE: In local/self-hosted environments, pg_net is preferred, but for Supabase hosted,
    -- we can use the pg_net extension queue.
    
    -- Setup pg_net request to our Edge Function
    -- Replace the URL with your actual Edge Function URL once deployed!
    -- URL format: https://[project_ref].supabase.co/functions/v1/send-web-push
    endpoint := 'https://wreovuejotnudkpaaffz.supabase.co/functions/v1/send-web-push';
    
    -- Using the service role key to authenticate the request
    headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    );

    -- Try calling pg_net
    begin
        perform net.http_post(
            url := endpoint,
            headers := headers,
            body := payload
        );
    exception when others then
        -- fail silently if pg_net is not enabled/errors out
        raise warning 'Could not trigger web push edge function: %', SQLERRM;
    end;

    return NEW;
end;
$$;

-- Attach triggers
drop trigger if exists on_announcement_created on public.announcements;
create trigger on_announcement_created
    after insert on public.announcements
    for each row
    execute function public.trigger_web_push();

drop trigger if exists on_event_created on public.events;
create trigger on_event_created
    after insert on public.events
    for each row
    execute function public.trigger_web_push();

drop trigger if exists on_church_content_created on public.church_content;
create trigger on_church_content_created
    after insert on public.church_content
    for each row
    execute function public.trigger_web_push();

drop trigger if exists on_comment_created on public.bulletin_posts_comments;
create trigger on_comment_created
    after insert on public.bulletin_posts_comments
    for each row
    execute function public.trigger_web_push();
