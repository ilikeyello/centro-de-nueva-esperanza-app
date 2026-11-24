/**
 * Live service state — what part of the service is on right now.
 *
 * OBS (through the dock at emanuelavina.com/obs-dock.html and the
 * obs-live-control edge function) writes one row per church to
 * live_service_state. The livestream page listens to it and changes the
 * button under the player: song title during worship, Give during the
 * offering/announcements, Go to Verse during the sermon.
 *
 * Each change carries a show_at time a few seconds in the future, because
 * the video runs behind real life. We hold the change until then so the
 * button matches what viewers are watching.
 */
import { useEffect, useRef, useState } from "react";
import { supabase, churchOrgId } from "./mainSiteData";

export type LiveMode = "off" | "worship" | "offering" | "sermon";

export interface LiveVerse {
  book: string;
  chapter: number;
  verse: number | null;
  endVerse: number | null;
}

export interface LiveServiceState {
  mode: LiveMode;
  songTitle: string | null;
  verse: LiveVerse | null;
}

interface LiveServiceRow {
  mode: string;
  song_title: string | null;
  verse: LiveVerse | null;
  show_at: string;
}

const OFF: LiveServiceState = { mode: "off", songTitle: null, verse: null };

function toState(row: LiveServiceRow | null | undefined): LiveServiceState {
  if (!row) return OFF;
  const mode = (["worship", "offering", "sermon"] as const).includes(row.mode as never)
    ? (row.mode as LiveMode)
    : "off";
  return { mode, songTitle: row.song_title ?? null, verse: row.verse ?? null };
}

/** Listens only while `enabled` (the stream is live), so idle screens keep no connection open. */
export function useLiveServiceState(enabled: boolean): LiveServiceState {
  const [state, setState] = useState<LiveServiceState>(OFF);
  const timerRef = useRef<number | null>(null);
  const latestRef = useRef<string>("");

  useEffect(() => {
    if (!enabled || !churchOrgId) {
      setState(OFF);
      return;
    }
    let cancelled = false;

    const apply = (row: LiveServiceRow | null) => {
      if (cancelled) return;
      const key = row ? `${row.show_at}|${row.mode}|${row.song_title}|${JSON.stringify(row.verse)}` : "";
      latestRef.current = key;
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
      timerRef.current = null;
      const wait = row ? new Date(row.show_at).getTime() - Date.now() : 0;
      if (wait > 0 && wait < 120_000) {
        timerRef.current = window.setTimeout(() => {
          // A newer change may have arrived while we waited.
          if (!cancelled && latestRef.current === key) setState(toState(row));
        }, wait);
      } else {
        setState(toState(row));
      }
    };

    const load = async () => {
      const { data } = await supabase
        .from("live_service_state")
        .select("mode, song_title, verse, show_at")
        .eq("organization_id", churchOrgId)
        .maybeSingle();
      apply((data as LiveServiceRow | null) ?? null);
    };

    void load();

    const channel = supabase
      .channel(`live-service-${churchOrgId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_service_state",
          filter: `organization_id=eq.${churchOrgId}`,
        },
        (payload) => apply((payload.new as LiveServiceRow) ?? null)
      )
      .subscribe();

    // Phones drop the realtime connection in the background; catch up on return.
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
      timerRef.current = null;
      document.removeEventListener("visibilitychange", onVisible);
      void supabase.removeChannel(channel);
    };
  }, [enabled]);

  return state;
}
