# Automatic Push Notifications

Everything below is already deployed and running. This file describes how it
works and how to check on it, not a setup checklist.

## What sends a notification

| Trigger | Notification | Tapping it opens |
|---|---|---|
| New announcement | Nuevo Anuncio / New Announcement | That announcement, scrolled to and highlighted |
| New event | Nuevo Evento / New Event | That event, scrolled to and highlighted |
| New sermon / devotional | Nuevo Devocional / New Devotional | Media page |
| Livestream goes live | ¡Estamos en Vivo! / We're Live! | Media page |
| Daily verse, 7:00 AM Mountain | Versículo del Día / Verse of the Day | The verse popup |
| Reply to your bulletin post | Nueva Respuesta… / New Reply… | Bulletin |

Language comes from the `language` column on the device's row in
`device_push_tokens`, which the app writes at registration and updates whenever
the user toggles language. Anything that isn't explicitly `en` is treated as
`es`, so Spanish is the default.

## How it fits together

```
Admin creates content
  └─ AFTER INSERT/UPDATE trigger  →  public.notify_auto()
       └─ net.http_post (async)   →  edge function `auto-notify`
            ├─ web push  → push_subscriptions (VAPID)
            └─ APNs      → device_push_tokens where platform = 'ios'

pg_cron 'daily-verse-of-the-day' (hourly)
  └─ net.http_post → auto-notify {"type":"SCHEDULED","table":"verses_of_the_day"}
       └─ sends only when it is 07:00 in America/Denver
```

### Why the cron runs hourly

pg_cron schedules in UTC, and 7 AM Denver is 13:00 UTC in summer, 14:00 in
winter. Rather than chase DST, the job fires every hour and the edge function
decides. The `notification_sends` unique index on
`(org_id, kind, ref_key)` is the lock that keeps it to one verse per day — a
retried or duplicated hour simply fails the insert and returns early.

## APNs environments

A device token is only valid against the APNs environment the build was signed
for: **sandbox** for Xcode builds, **production** for TestFlight and the App
Store. This fleet is a mix of both (currently 28 production, 11 sandbox), so
`auto-notify` tries production first, falls back to sandbox on
`BadDeviceToken`, and stores the winner in `device_push_tokens.apns_env` so the
retry only happens once per device.

Do not reintroduce a single hardcoded host or an `APNS_SANDBOX` flag — that is
what silently cut off most of the fleet before.

## Required secrets

Set under Project Settings → Edge Functions → Secrets:

```
APNS_KEY          # contents of the AuthKey_XXXXX.p8, including BEGIN/END lines
APNS_KEY_ID       # the 10-char key id from Apple Developer
APNS_TEAM_ID      # your 10-char Apple team id
APNS_BUNDLE_ID    # defaults to com.centronuevaesperanza.app
VAPID_PUBLIC_KEY  # web push
VAPID_PRIVATE_KEY
VAPID_SUBJECT     # mailto:...
```

## Checking on it

`auto-notify` has a probe that reports which secrets are present (never their
values), the church-local date and hour, and the iOS token count:

```sql
select net.http_post(
  url     => 'https://wreovuejotnudkpaaffz.supabase.co/functions/v1/auto-notify',
  headers => jsonb_build_object('Content-Type','application/json',
                                'Authorization','Bearer <ANON_KEY>'),
  body    => jsonb_build_object('diag', true)
);
-- then, a second or two later:
select status_code, content from net._http_response order by id desc limit 1;
```

To test a real send without touching anyone's phone, post a payload with an
`organization_id` that has no devices in `device_push_tokens` — the branch runs
end to end and returns its counts, but reaches zero real users.

**Careful:** `{"type":"SCHEDULED","table":"verses_of_the_day","force":true}`
ignores both the 7 AM gate and the org filter — it sends the daily verse to
every registered device immediately. Only use it if that is what you want.

## Things that were broken before, worth not repeating

- The `events` and `sermons` triggers shipped with a literal
  `Bearer [YOUR API KEY]`, so every new event and devotional got a 401 from the
  edge function and nobody was notified. All triggers now share one function,
  `public.notify_auto()`, so there is a single place for the key.
- APNs was hardcoded to sandbox, cutting off every TestFlight/App Store device.
- A fresh APNs JWT was minted per device. Apple rejects providers that mint
  more than one token per 20 minutes (`429 TooManyProviderTokenUpdates`), so a
  fan-out past a handful of phones throttled itself. The JWT is now built once
  and cached for 45 minutes.
- Livestreams only notified on UPDATE, so a stream created already in the live
  state never sent anything. Both INSERT and UPDATE are handled now, with
  `WHEN` clauses so unrelated column churn doesn't wake the function.
