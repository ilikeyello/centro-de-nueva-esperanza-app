"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getLivestreamFromMainSite,
  getMusicTracksFromMainSite,
  type LivestreamInfo,
  type MusicTrack,
} from "../lib/mainSiteData";

interface PlayerContextType {
  tracks: MusicTrack[];
  queue: MusicTrack[];
  queueIndex: number | null;
  currentTrack: MusicTrack | null;
  currentPlaybackId: string | null;
  currentTrackTitle: string | null;
  currentTrackArtist: string | null;
  isPlaying: boolean;
  isMinimized: boolean;
  playTrackList: (tracks: MusicTrack[], startIndex: number) => void;
  playNextInQueue: () => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  toggleMinimize: () => void;
  closePlayer: () => void;

  livestreamPlaybackId: string | null;
  livestreamTitle: string | null;
  livestreamScheduledStart: string | null;
  livestreamIsLive: boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [queue, setQueue] = useState<MusicTrack[]>([]);
  const [queueIndex, setQueueIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const [livestreamPlaybackId, setLivestreamPlaybackId] = useState<string | null>(null);
  const [livestreamTitle, setLivestreamTitle] = useState<string | null>(null);
  const [livestreamScheduledStart, setLivestreamScheduledStart] = useState<string | null>(null);
  const [livestreamIsLive, setLivestreamIsLive] = useState(false);

  const currentTrack = queueIndex != null ? queue[queueIndex] ?? null : null;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const info: LivestreamInfo = await getLivestreamFromMainSite();
        if (cancelled) return;
        setLivestreamPlaybackId(info.playbackId);
        setLivestreamTitle(info.title ?? null);
        setLivestreamScheduledStart(info.scheduledStart ?? null);
        setLivestreamIsLive(Boolean(info.isLive));
      } catch {
        /* ignore */
      }
    };
    load();
    const id = window.setInterval(load, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getMusicTracksFromMainSite();
        if (!cancelled) setTracks(list);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const playTrackList = useCallback((list: MusicTrack[], startIndex: number) => {
    if (!list.length) return;
    const idx = Math.min(Math.max(0, startIndex), list.length - 1);
    setQueue(list);
    setQueueIndex(idx);
    setIsPlaying(true);
    setIsMinimized(false);
  }, []);

  const playNextInQueue = useCallback(() => {
    setQueueIndex((prev) => {
      if (prev == null || queue.length === 0) return prev;
      return prev + 1 >= queue.length ? 0 : prev + 1;
    });
    setIsPlaying(true);
  }, [queue.length]);

  const pauseTrack = useCallback(() => setIsPlaying(false), []);
  const resumeTrack = useCallback(() => {
    if (currentTrack) setIsPlaying(true);
  }, [currentTrack]);
  const toggleMinimize = useCallback(() => setIsMinimized((p) => !p), []);
  const closePlayer = useCallback(() => {
    setQueue([]);
    setQueueIndex(null);
    setIsPlaying(false);
    setIsMinimized(false);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        tracks,
        queue,
        queueIndex,
        currentTrack,
        currentPlaybackId: currentTrack?.playbackId ?? null,
        currentTrackTitle: currentTrack?.title ?? null,
        currentTrackArtist: currentTrack?.artist ?? null,
        isPlaying,
        isMinimized,
        playTrackList,
        playNextInQueue,
        pauseTrack,
        resumeTrack,
        toggleMinimize,
        closePlayer,
        livestreamPlaybackId,
        livestreamTitle,
        livestreamScheduledStart,
        livestreamIsLive,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
}
