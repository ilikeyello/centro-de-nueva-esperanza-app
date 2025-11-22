import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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

interface PlayerContextType {
  currentTrack: string | null;
  isPlaying: boolean;
  isMinimized: boolean;
  playlistUrl: string;
  livestreamUrl: string;
  playTrack: (url: string) => void;
  pauseTrack: () => void;
  toggleMinimize: () => void;
  closePlayer: () => void;
  setPlaylistUrl: (url: string) => void;
  setLivestreamUrl: (url: string) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const defaultPlaylistUrl =
    "https://www.youtube.com/embed/videoseries?si=dfPffkXPjZujh10p&list=PLN4iKuxWow6_WegcKkHFaYbj6xHDeA7fW";

  const defaultLivestreamUrl =
    "https://www.youtube.com/embed/HF7qrZR1rDA?enablejsapi=1";

  const [playlistUrl, setPlaylistUrlState] = useState<string>(() => {
    if (typeof window === "undefined") return defaultPlaylistUrl;
    try {
      const stored = window.localStorage.getItem("cne_music_playlist_url");
      return stored && stored.trim().length > 0 ? stored : defaultPlaylistUrl;
    } catch {
      return defaultPlaylistUrl;
    }
  });

  const [livestreamUrl, setLivestreamUrlState] = useState<string>(() => {
    if (typeof window === "undefined") return defaultLivestreamUrl;
    try {
      const stored = window.localStorage.getItem("cne_livestream_url");
      if (stored && stored.trim().length > 0) {
        return normalizeLivestreamUrl(stored, defaultLivestreamUrl);
      }
      return defaultLivestreamUrl;
    } catch {
      return defaultLivestreamUrl;
    }
  });

  // Load livestream URL from backend on mount
  useEffect(() => {
    const loadLivestreamUrl = async () => {
      try {
        const base = import.meta.env.DEV
          ? "http://127.0.0.1:4000"
          : "https://prod-cne-sh82.encr.app";
        const res = await fetch(`${base}/livestream`);
        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            const normalizedUrl = normalizeLivestreamUrl(data.url, defaultLivestreamUrl);
            setLivestreamUrlState(normalizedUrl);
            // Also update localStorage for fallback
            try {
              if (typeof window !== "undefined") {
                window.localStorage.setItem("cne_livestream_url", normalizedUrl);
              }
            } catch {
              // ignore storage errors
            }
          }
        }
      } catch {
        // Ignore errors, fall back to localStorage/default
      }
    };

    loadLivestreamUrl();
  }, []);

  // Load playlist URL from backend on mount (only once)
  useEffect(() => {
    const loadPlaylistUrl = async () => {
      try {
        const base = import.meta.env.DEV
          ? "http://127.0.0.1:4000"
          : "https://prod-cne-sh82.encr.app";
        const res = await fetch(`${base}/playlist`);
        if (res.ok) {
          const data = await res.json();
          if (data.url) {
            setPlaylistUrlState(data.url);
            // Also update localStorage for fallback
            try {
              if (typeof window !== "undefined") {
                window.localStorage.setItem("cne_music_playlist_url", data.url);
              }
            } catch {
              // ignore storage errors
            }
          }
        }
      } catch {
        // Ignore errors, fall back to localStorage/default
      }
    };

    loadPlaylistUrl();
  }, []);

  const playTrack = (url: string) => {
    setCurrentTrack(url);
    setIsPlaying(true);
    setIsMinimized(false);
  };

  const pauseTrack = () => setIsPlaying(false);

  const toggleMinimize = () => setIsMinimized((prev) => !prev);

  const closePlayer = () => {
    setCurrentTrack(null);
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
    const value = normalizeLivestreamUrl(url, defaultLivestreamUrl);
    setLivestreamUrlState(value);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("cne_livestream_url", value);
      }
    } catch {
      // ignore storage errors
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isMinimized,
        playlistUrl,
        livestreamUrl,
        playTrack,
        pauseTrack,
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
