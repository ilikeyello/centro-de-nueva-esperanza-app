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
  // ── Worship music (Mux audio) ───────────────────────────────────────────
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
  playTrackById: (id: string) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  playNextInQueue: () => void;
  playPrevInQueue: () => void;
  toggleMinimize: () => void;
  closePlayer: () => void;

  // ── Livestream (Mux live) ───────────────────────────────────────────────
  livestreamPlaybackId: string | null;
  livestreamTitle: string | null;
  livestreamScheduledStart: string | null;
  livestreamIsLive: boolean;

  // Picture-in-picture chrome state (shared between Media page and Navigation)
  isLivestreamPipMinimized: boolean;
  setLivestreamPipMinimized: (val: boolean) => void;
  hasInteractedWithLivestream: boolean;
  setHasInteractedWithLivestream: (val: boolean) => void;
  isLivestreamPipDismissed: boolean;
  setLivestreamPipDismissed: (val: boolean) => void;
  isLivestreamPlaying: boolean;
  setIsLivestreamPlaying: (val: boolean) => void;
  shouldShowLivestreamPip: boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  // Worship music state
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [queue, setQueue] = useState<MusicTrack[]>([]);
  const [queueIndex, setQueueIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Livestream state
  const [livestreamPlaybackId, setLivestreamPlaybackId] = useState<string | null>(null);
  const [livestreamTitle, setLivestreamTitle] = useState<string | null>(null);
  const [livestreamScheduledStart, setLivestreamScheduledStart] = useState<string | null>(null);
  const [livestreamIsLive, setLivestreamIsLive] = useState<boolean>(false);

  const [isLivestreamPipMinimized, setLivestreamPipMinimized] = useState(false);
  const [hasInteractedWithLivestream, setHasInteractedWithLivestream] = useState(false);
  const [isLivestreamPipDismissed, setLivestreamPipDismissed] = useState(false);
  const [isLivestreamPlaying, setIsLivestreamPlaying] = useState(false);

  const currentTrack = queueIndex != null ? queue[queueIndex] ?? null : null;

  // Load livestream info on mount and poll so "live" status stays fresh.
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
        /* keep previous state */
      }
    };
    load();
    const id = window.setInterval(load, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  // Load worship tracks on mount.
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

  const playTrackById = useCallback(
    (id: string) => {
      const idx = tracks.findIndex((t) => t.id === id);
      if (idx >= 0) playTrackList(tracks, idx);
    },
    [tracks, playTrackList]
  );

  const playNextInQueue = useCallback(() => {
    setQueueIndex((prev) => {
      if (prev == null || queue.length === 0) return prev;
      return prev + 1 >= queue.length ? 0 : prev + 1;
    });
    setIsPlaying(true);
  }, [queue.length]);

  const playPrevInQueue = useCallback(() => {
    setQueueIndex((prev) => {
      if (prev == null || queue.length === 0) return prev;
      return prev - 1 < 0 ? queue.length - 1 : prev - 1;
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

  const shouldShowLivestreamPip = hasInteractedWithLivestream && !isLivestreamPipDismissed;

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
        playTrackById,
        pauseTrack,
        resumeTrack,
        playNextInQueue,
        playPrevInQueue,
        toggleMinimize,
        closePlayer,
        livestreamPlaybackId,
        livestreamTitle,
        livestreamScheduledStart,
        livestreamIsLive,
        isLivestreamPipMinimized,
        setLivestreamPipMinimized,
        hasInteractedWithLivestream,
        setHasInteractedWithLivestream,
        isLivestreamPipDismissed,
        setLivestreamPipDismissed,
        isLivestreamPlaying,
        setIsLivestreamPlaying,
        shouldShowLivestreamPip,
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
