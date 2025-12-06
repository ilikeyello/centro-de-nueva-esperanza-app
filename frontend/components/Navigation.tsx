import { useEffect, useRef, useState } from "react";
import {
  Home,
  Megaphone,
  Play,
  Gamepad2,
  Languages,
  MessageCircle,
  Minimize2,
  Maximize2,
  Bell,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { usePlayer } from "../contexts/PlayerContext";
import { cn } from "@/lib/utils";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { t, language, toggleLanguage } = useLanguage();
  const {
    currentTrack: youtubeTrackUrl,
    isMinimized,
    toggleMinimize,
    closePlayer: closeYouTubePlayer,
    playlistUrl,
    playlistIndex,
  } = usePlayer();

  // Convert YouTube playlist URL to embed format for iframe
  const getEmbedUrl = (url: string | null) => {
    if (!url) return url;
    
    // If already in embed format, return as-is
    if (url.includes('youtube.com/embed/videoseries')) {
      return url;
    }
    
    // Extract playlist ID and session ID from regular YouTube playlist URL
    const listMatch = url.match(/[?&]list=([^&]+)/);
    const siMatch = url.match(/[?&]si=([^&]+)/);
    
    if (listMatch) {
      const playlistId = listMatch[1];
      const sessionId = siMatch ? siMatch[1] : '';
      
      // Create embed URL matching YouTube's exact format
      let embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
      if (sessionId) {
        embedUrl += `&si=${sessionId}`;
      }
      
      return embedUrl;
    }
    
    return url;
  };

  const embedUrl = getEmbedUrl(youtubeTrackUrl);

  const playerRef = useRef<any | null>(null);
  const [playerReady, setPlayerReady] = useState(false);

  const [desktopPlayerPosition, setDesktopPlayerPosition] = useState({ top: 160, right: 16 });
  const [dragState, setDragState] = useState<{
    startX: number;
    startY: number;
    startTop: number;
    startRight: number;
  } | null>(null);

  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (event: MouseEvent) => {
      const dx = event.clientX - dragState.startX;
      const dy = event.clientY - dragState.startY;

      setDesktopPlayerPosition({
        top: dragState.startTop + dy,
        right: dragState.startRight - dx,
      });
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState]);

  // Create/destroy the global YouTube IFrame Player instance
  useEffect(() => {
    if (typeof window === "undefined") return;

    const w = window as any;

    // When there is no active track and no playlist index, tear down the player
    if (!youtubeTrackUrl && playlistIndex == null) {
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
      }
      playerRef.current = null;
      setPlayerReady(false);
      return;
    }

    const createPlayer = () => {
      if (!w.YT || !w.YT.Player) return;
      if (playerRef.current) return;
      const container = document.getElementById("global-music-player");
      if (!container) return;

      playerRef.current = new w.YT.Player("global-music-player", {
        height: "100%",
        width: "100%",
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            setPlayerReady(true);
          },
        },
      });
    };

    if (w.YT && w.YT.Player) {
      createPlayer();
    } else {
      const prevReady = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        if (typeof prevReady === "function") prevReady();
        createPlayer();
      };

      const existingScript = document.querySelector(
        "script[src='https://www.youtube.com/iframe_api']"
      );
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
    }
  }, [youtubeTrackUrl, playlistIndex]);

  useEffect(() => {
    if (!playerRef.current) return;
    if (typeof window === "undefined") return;
    if (!playerReady) return;

    const player = playerRef.current as any;

    if (playlistIndex != null && playlistUrl) {
      let playlistId: string | null = null;
      try {
        const match = playlistUrl.match(/[?&]list=([^&]+)/);
        playlistId = match ? match[1] : null;
      } catch {
        playlistId = null;
      }

      if (playlistId) {
        try {
          // Use the object form of cuePlaylist which explicitly specifies
          // that we're loading a playlist by ID, then start playback.
          player.cuePlaylist({
            listType: "playlist",
            list: playlistId,
            index: playlistIndex,
          });
          player.playVideo();
          return;
        } catch {
        }
      }
    }

    if (youtubeTrackUrl) {
      try {
        player.loadVideoByUrl(youtubeTrackUrl);
        if (typeof player.playVideo === "function") {
          player.playVideo();
        }
      } catch {
      }
    }
  }, [youtubeTrackUrl, playlistIndex, playlistUrl, playerReady]);

  const handleDesktopPlayerMouseDown = (event: any) => {
    if (window.innerWidth < 768) {
      return;
    }

    event.preventDefault();

    setDragState({
      startX: event.clientX,
      startY: event.clientY,
      startTop: desktopPlayerPosition.top,
      startRight: desktopPlayerPosition.right,
    });
  };

  const navItems = [
    { id: "home", icon: Home, labelEn: "Home", labelEs: "Inicio" },
    { id: "media", icon: Play, labelEn: "Media", labelEs: "Medios" },
    { id: "news", icon: Megaphone, labelEn: "News", labelEs: "Noticias" },
    { id: "bulletin", icon: MessageCircle, labelEn: "Bulletin", labelEs: "Tablón" },
    { id: "games", icon: Gamepad2, labelEn: "Games", labelEs: "Juegos" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur transition-transform md:sticky md:top-0 md:border-b md:border-t-0">
      <div
        className={cn("container mx-auto py-0")}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom) - 20px, 2px)" }}
      >
        <div className="flex w-full flex-col gap-1 md:flex-col-reverse">
          <div className="flex w-full items-center justify-between gap-1 px-3 py-2 md:justify-center md:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-lg px-2 py-1.5 text-[0.75rem] transition-colors md:flex-initial md:flex-row md:gap-2 md:px-3 md:py-2 md:text-sm nav-button",
                    isActive
                      ? "text-red-500"
                      : "text-neutral-400 hover:text-neutral-200"
                  )}
                >
                  <Icon className={cn("h-6 w-6 md:h-5 md:w-5", isActive && "text-red-500")} />
                  <span className="text-xs font-medium whitespace-nowrap md:text-sm">
                    {t(item.labelEn, item.labelEs)}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={toggleLanguage}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-lg px-2 py-1.5 text-[0.75rem] text-neutral-400 transition-colors hover:text-neutral-200 md:flex-initial md:flex-row md:gap-2 md:px-3 md:py-2 md:text-sm nav-button",
                "border border-transparent md:border-neutral-700 md:bg-neutral-900"
              )}
              aria-label={language === "en" ? "Switch to Spanish" : "Cambiar a inglés"}
            >
              <Languages className="h-6 w-6 md:h-5 md:w-5" />
              <span className="text-xs font-medium md:text-sm">{language === "en" ? "ESP" : "ENG"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Single floating YouTube overlay (used on all screen sizes) */}
      {youtubeTrackUrl && (
        <div
          className={cn(
            "fixed z-60 w-80 transition-all",
            isMinimized && "pointer-events-none opacity-0"
          )}
          style={{ top: desktopPlayerPosition.top, right: desktopPlayerPosition.right }}
        >
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/90 shadow-xl">
            <div
              className="flex items-center justify-between px-3 pt-2 cursor-move"
              onMouseDown={handleDesktopPlayerMouseDown}
            >
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                {t("Music", "Música")}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMinimize}
                  className="rounded-full border border-neutral-700 px-2 py-0.5 text-[0.7rem] text-neutral-300 hover:border-neutral-500 hover:text-neutral-50"
                  aria-label={t("Minimize music player", "Minimizar reproductor de música")}
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={closeYouTubePlayer}
                  className="rounded-full border border-neutral-700 px-2 py-0.5 text-[0.7rem] text-neutral-300 hover:border-red-500 hover:text-red-400"
                  aria-label={t("Close music player", "Cerrar reproductor de música")}
                >
                  ×
                </button>
              </div>
            </div>
            <div
              className={cn(
                "mt-2 w-full overflow-hidden transition-all",
                isMinimized ? "h-0" : "aspect-video"
              )}
            >
              <div id="global-music-player" className="h-full w-full" />
            </div>
          </div>
        </div>
      )}

      {youtubeTrackUrl && isMinimized && (
        <button
          type="button"
          onClick={toggleMinimize}
          className="hidden md:flex fixed right-4 bottom-4 z-50 items-center gap-1 rounded-full border border-neutral-700 bg-neutral-900/90 px-3 py-1 text-[0.7rem] text-neutral-300 shadow-lg hover:border-neutral-500 hover:text-neutral-50"
          aria-label={t("Expand YouTube player", "Expandir reproductor de YouTube")}
        >
          <Play className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">Music</span>
        </button>
      )}

    </nav>
  );
}
