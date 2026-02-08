import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { getLivestreamFromMainSite, getAllMusicPlaylistsFromMainSite, type LivestreamInfo, type MusicPlaylistFromMainSite } from "../lib/mainSiteData";

function normalizeLivestreamUrl(raw: string, fallback: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return fallback;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();

    let videoId: string | null = null;

    if (host.includes("youtu.be")) {
      videoId = url.pathname.replace("/", "");
    } else if (host.includes("youtube.com")) {
      if (url.pathname.startsWith("/live/")) {
        const parts = url.pathname.split("/").filter(Boolean);
        videoId = parts[parts.length - 1] ?? null;
      } else if (url.pathname.startsWith("/watch")) {
        videoId = url.searchParams.get("v");
      } else if (url.pathname.startsWith("/embed/")) {
        const parts = url.pathname.split("/").filter(Boolean);
        videoId = parts[parts.length - 1] ?? null;
      }
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
    }

    if (!trimmed.includes("enablejsapi=1")) {
      const separator = trimmed.includes("?") ? "&" : "?";
      return `${trimmed}${separator}enablejsapi=1`;
    }

    return trimmed;
  } catch {
    return fallback;
  }
}

function normalizePlaylistUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    
    // Check for list param
    const listId = url.searchParams.get("list");
    if (listId) {
      return `https://www.youtube.com/embed/videoseries?list=${listId}`;
    }

    // If it's already an embed URL, return as is
    if (url.pathname.includes("/embed/")) {
      return trimmed;
    }

    // Fallback: return original if we can't parse a list ID
    return trimmed;
  } catch {
    return trimmed;
  }
}

interface PlayerContextType {
  currentTrack: string | null;
  currentTrackTitle: string | null;
  currentTrackArtist: string | null;
  isPlaying: boolean;
  isMinimized: boolean;
  playlistUrl: string;
  playlists: MusicPlaylistFromMainSite[];
  isPlayingYouTubePlaylist: boolean;
  livestreamUrl: string;
  livestreamTitle: string | null;
  livestreamScheduledStart: string | null;
  livestreamIsLive: boolean;
  playlistIndex: number | null;
  playlistShuffle: boolean;
  queue: string[];
  queueIndex: number | null;
  queueMeta: { title: string; artist?: string }[];
  youtubePlayerRef: React.MutableRefObject<any>;
  playTrack: (url: string) => void;
  playPlaylistByUrl: (url: string, title?: string) => void;
  playPlaylistFromIndex: (index: number) => void;
  playPlaylistShuffle: () => void;
  startQueue: (
    urls: string[],
    startIndex: number,
    meta?: { title: string; artist?: string }[]
  ) => void;
  playNextInQueue: () => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  toggleMinimize: () => void;
  closePlayer: () => void;
  setPlaylistUrl: (url: string) => void;
  setLivestreamUrl: (url: string) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [currentTrackTitle, setCurrentTrackTitle] = useState<string | null>(null);
  const [currentTrackArtist, setCurrentTrackArtist] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [playlistIndex, setPlaylistIndex] = useState<number | null>(null);
  const [playlistShuffle, setPlaylistShuffle] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);
  const [queueIndex, setQueueIndex] = useState<number | null>(null);
  const [queueMeta, setQueueMeta] = useState<{ title: string; artist?: string }[]>([]);

  const defaultPlaylistUrl =
    "https://www.youtube.com/embed/videoseries?si=dfPffkXPjZujh10p&list=PLN4iKuxWow6_WegcKkHFaYbj6xHDeA7fW";

  const defaultLivestreamUrl =
    "https://www.youtube.com/embed/HF7qrZR1rDA?enablejsapi=1";

  const [playlists, setPlaylists] = useState<MusicPlaylistFromMainSite[]>([]);
  const [isPlayingYouTubePlaylist, setIsPlayingYouTubePlaylist] = useState(false);
  const youtubePlayerRef = useRef<any>(null);

  const [playlistUrl, setPlaylistUrlState] = useState<string>(() => {
    if (typeof window === "undefined") return defaultPlaylistUrl;
    try {
      const stored = window.localStorage.getItem("cne_music_playlist_url");
      return stored && stored.trim().length > 0 ? stored : defaultPlaylistUrl;
    } catch {
      return defaultPlaylistUrl;
    }
  });

  const [livestreamUrl, setLivestreamUrlState] = useState<string>("");
  const [livestreamTitle, setLivestreamTitle] = useState<string | null>(null);
  const [livestreamScheduledStart, setLivestreamScheduledStart] = useState<string | null>(null);
  const [livestreamIsLive, setLivestreamIsLive] = useState<boolean>(false);

  // Load livestream URL from main site Supabase on mount (only once)
  useEffect(() => {
    let cancelled = false;

    const applyInfo = (info: LivestreamInfo | null) => {
      if (!info) return;
      const urlVal = info.url || "";
      const normalized = urlVal ? normalizeLivestreamUrl(urlVal, defaultLivestreamUrl) : "";
      setLivestreamUrlState(normalized || defaultLivestreamUrl);
      setLivestreamTitle(info.title ?? null);
      setLivestreamScheduledStart(info.scheduledStart ?? null);
      setLivestreamIsLive(Boolean(info.isLive));
    };

    const loadLivestreamUrl = async () => {
      try {
        const info: LivestreamInfo = await getLivestreamFromMainSite();
        if (cancelled) return;
        if (info?.url) {
          applyInfo(info);
        } else {
          console.warn("No livestream URL found for org; falling back to default");
          applyInfo({ url: defaultLivestreamUrl, isLive: false });
        }
      } catch {
        // Ignore errors, fall back to localStorage/default
      }
    };

    loadLivestreamUrl();

    const intervalId = window.setInterval(loadLivestreamUrl, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  // Load all playlists from backend on mount
  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const allPlaylists = await getAllMusicPlaylistsFromMainSite();
        setPlaylists(allPlaylists);
        if (allPlaylists.length > 0) {
          const url = normalizePlaylistUrl(allPlaylists[0].url);
          setPlaylistUrlState(url);
          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem("cne_music_playlist_url", url);
            }
          } catch {
            // ignore storage errors
          }
        }
      } catch {
        // Ignore errors, fall back to localStorage/default
      }
    };

    loadPlaylists();
  }, []);

  const playTrack = (url: string) => {
    setCurrentTrack(url);
    setCurrentTrackTitle(null);
    setCurrentTrackArtist(null);
    setPlaylistIndex(null);
    setPlaylistShuffle(false);
    setIsPlayingYouTubePlaylist(false);
    setQueue([]);
    setQueueIndex(null);
    setQueueMeta([]);
    setIsPlaying(true);
    setIsMinimized(false);
  };

  const playPlaylistByUrl = (url: string, title?: string) => {
    const normalized = normalizePlaylistUrl(url);
    setPlaylistUrlState(normalized);
    setCurrentTrack(normalized);
    setCurrentTrackTitle(title || null);
    setCurrentTrackArtist(null);
    setPlaylistIndex(0);
    setPlaylistShuffle(false);
    setIsPlayingYouTubePlaylist(true);
    setQueue([]);
    setQueueIndex(null);
    setQueueMeta([]);
    setIsPlaying(true);
    setIsMinimized(false);
  };

  const playPlaylistFromIndex = (index: number) => {
    const safeIndex = Number.isFinite(index) && index >= 0 ? Math.floor(index) : 0;
    setPlaylistShuffle(false);
    setPlaylistIndex(safeIndex);
    setCurrentTrack(playlistUrl);
    setCurrentTrackTitle(null);
    setCurrentTrackArtist(null);
    setIsPlayingYouTubePlaylist(true);
    setIsPlaying(true);
    setIsMinimized(false);
  };

  const playPlaylistShuffle = () => {
    setPlaylistShuffle(true);
    setPlaylistIndex(0);
    setCurrentTrack(playlistUrl);
    setCurrentTrackTitle(null);
    setCurrentTrackArtist(null);
    setIsPlayingYouTubePlaylist(true);
    setIsPlaying(true);
    setIsMinimized(false);
  };

  const startQueue = (
    urls: string[],
    startIndex: number,
    meta?: { title: string; artist?: string }[]
  ) => {
    const safeUrls = Array.isArray(urls) ? urls.filter((u) => typeof u === "string" && u.trim().length > 0) : [];
    if (safeUrls.length === 0) {
      return;
    }

    const maxIndex = safeUrls.length - 1;
    const clampedIndex = Math.min(Math.max(0, Math.floor(startIndex || 0)), maxIndex);

    const normalizedMeta: { title: string; artist?: string }[] = Array.isArray(meta) && meta.length
      ? meta.map((m) => ({
          title: typeof m.title === "string" ? m.title : "",
          artist: typeof m.artist === "string" ? m.artist : "",
        }))
      : safeUrls.map(() => ({ title: "", artist: "" }));

    setQueue(safeUrls);
    setQueueMeta(normalizedMeta);
    setQueueIndex(clampedIndex);
    setPlaylistIndex(null);
    setPlaylistShuffle(false);
    setCurrentTrack(safeUrls[clampedIndex]);
    const metaForTrack = normalizedMeta[clampedIndex];
    setCurrentTrackTitle(metaForTrack?.title || null);
    setCurrentTrackArtist(metaForTrack?.artist || null);
    setIsPlaying(true);
    setIsMinimized(false);
  };

  const playNextInQueue = useCallback(() => {
    // If playing a YouTube playlist, use the YouTube player's nextVideo()
    if (isPlayingYouTubePlaylist && youtubePlayerRef.current) {
      try {
        const player = youtubePlayerRef.current;
        if (typeof player.nextVideo === "function") {
          player.nextVideo();
          return;
        }
      } catch {
        // fall through to queue-based logic
      }
    }

    if (!queue || queue.length === 0) return;
    if (queueIndex == null) return;

    const nextIndex = queueIndex + 1 >= queue.length ? 0 : queueIndex + 1;

    setQueueIndex(nextIndex);
    setCurrentTrack(queue[nextIndex]);
    const metaForTrack = queueMeta[nextIndex];
    setCurrentTrackTitle(metaForTrack?.title || null);
    setCurrentTrackArtist(metaForTrack?.artist || null);
    setIsPlaying(true);
  }, [isPlayingYouTubePlaylist, queue, queueIndex, queueMeta]);

  const pauseTrack = () => setIsPlaying(false);

   const resumeTrack = () => {
    if (!currentTrack) return;
    setIsPlaying(true);
  };

  const toggleMinimize = () => setIsMinimized((prev) => !prev);

  const closePlayer = () => {
    setCurrentTrack(null);
    setCurrentTrackTitle(null);
    setCurrentTrackArtist(null);
    setPlaylistIndex(null);
    setPlaylistShuffle(false);
    setIsPlayingYouTubePlaylist(false);
    setQueue([]);
    setQueueIndex(null);
    setQueueMeta([]);
    setIsPlaying(false);
    setIsMinimized(false);
  };

  const setPlaylistUrl = (url: string) => {
    const trimmed = url.trim();
    // Allow empty URLs - don't fallback to default
    setPlaylistUrlState(trimmed);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("cne_music_playlist_url", trimmed);
      }
    } catch {
      // ignore storage errors
    }
  };

  const setLivestreamUrl = (url: string) => {
    const trimmed = url.trim();
    // Allow empty URLs - don't fallback to default
    setLivestreamUrlState(trimmed);
    // Manual set does not assert live state; will be refreshed by polling
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        currentTrackTitle,
        currentTrackArtist,
        isPlaying,
        isMinimized,
        playlistUrl,
        playlists,
        isPlayingYouTubePlaylist,
        youtubePlayerRef,
        livestreamUrl,
        livestreamTitle,
        livestreamScheduledStart,
        livestreamIsLive,
        playlistIndex,
        playlistShuffle,
        queue,
        queueIndex,
        queueMeta,
        playTrack,
        playPlaylistByUrl,
        playPlaylistFromIndex,
        playPlaylistShuffle,
        startQueue,
        playNextInQueue,
        pauseTrack,
        resumeTrack,
        toggleMinimize,
        closePlayer,
        setPlaylistUrl,
        setLivestreamUrl,
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
