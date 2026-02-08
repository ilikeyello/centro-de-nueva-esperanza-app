import { useEffect, useRef, useState } from "react";
import {
  Home,
  Megaphone,
  Play,
  Pause,
  SkipForward,
  Gamepad2,
  MessageCircle,
  Minimize2,
  Maximize2,
  X,
  BookOpen,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { usePlayer } from "../contexts/PlayerContext";
import { cn } from "@/lib/utils";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { t } = useLanguage();
  const {
    currentTrack: youtubeTrackUrl,
    currentTrackTitle,
    isPlaying,
    isMinimized,
    toggleMinimize,
    closePlayer: closeYouTubePlayer,
    pauseTrack,
    resumeTrack,
    playNextInQueue,
    youtubePlayerRef,
    setCurrentPlaylistVideoIds,
    setCurrentPlaylistActiveIndex,
  } = usePlayer();

  const playerRef = youtubePlayerRef;
  const [playerReady, setPlayerReady] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastLayoutIsDesktopRef = useRef<boolean | null>(null);
  const lastPlaylistIdsRef = useRef<string>("");

  const [desktopPlayerPosition, setDesktopPlayerPosition] = useState({ top: 160, right: 16 });
  const [dragState, setDragState] = useState<{
    startX: number;
    startY: number;
    startTop: number;
    startRight: number;
  } | null>(null);

  const handlePlayClick = () => {
    if (!playerRef.current) return;
    const player = playerRef.current as any;
    try {
      if (typeof player.playVideo === "function") {
        player.playVideo();
      }
    } catch {}
    resumeTrack();
  };

  const handlePauseClick = () => {
    if (!playerRef.current) return;
    const player = playerRef.current as any;
    try {
      if (typeof player.pauseVideo === "function") {
        player.pauseVideo();
      }
    } catch {}
    pauseTrack();
  };

  const handleNextClick = () => {
    playNextInQueue();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
    updateIsDesktop();
    window.addEventListener("resize", updateIsDesktop);
    return () => window.removeEventListener("resize", updateIsDesktop);
  }, []);

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
    const handleMouseUp = () => setDragState(null);
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
    const prevIsDesktop = lastLayoutIsDesktopRef.current;
    lastLayoutIsDesktopRef.current = isDesktop;
    const layoutChanged = prevIsDesktop !== null && prevIsDesktop !== isDesktop;

    if (!youtubeTrackUrl) {
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        try { playerRef.current.destroy(); } catch {}
      }
      playerRef.current = null;
      setPlayerReady(false);
      return;
    }

    if (layoutChanged && playerRef.current && typeof playerRef.current.destroy === "function") {
      try { playerRef.current.destroy(); } catch {}
      playerRef.current = null;
      setPlayerReady(false);
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
          playsinline: 1,
        },
        events: {
          onReady: () => setPlayerReady(true),
          onStateChange: (event: any) => {
            const YT = w.YT;
            if (!YT || !YT.PlayerState) return;
            if (event.data === YT.PlayerState.ENDED) {
              playNextInQueue();
            }
            // Capture playlist video IDs once the player starts playing
            if (event.data === YT.PlayerState.PLAYING && event.target) {
              try {
                const playlist = event.target.getPlaylist?.();
                if (Array.isArray(playlist) && playlist.length > 0) {
                  const key = playlist.join(",");
                  if (key !== lastPlaylistIdsRef.current) {
                    lastPlaylistIdsRef.current = key;
                    setCurrentPlaylistVideoIds(playlist);
                  }
                }
                const idx = event.target.getPlaylistIndex?.();
                if (typeof idx === "number" && idx >= 0) {
                  setCurrentPlaylistActiveIndex(idx);
                }
              } catch {}
            }
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
  }, [youtubeTrackUrl, playNextInQueue, isDesktop]);

  useEffect(() => {
    if (!playerRef.current || !playerReady || !youtubeTrackUrl) return;

    const player = playerRef.current as any;
    try {
      if (youtubeTrackUrl.includes("list=")) {
        const listMatch = youtubeTrackUrl.match(/list=([^&]+)/);
        if (listMatch && listMatch[1] && typeof player.loadPlaylist === "function") {
          player.loadPlaylist({ list: listMatch[1], listType: "playlist" });
          return;
        }
      }
      if (typeof player.loadVideoById === "function") {
        player.loadVideoById(youtubeTrackUrl);
      }
      if (typeof player.playVideo === "function") {
        player.playVideo();
      }
    } catch {}
  }, [youtubeTrackUrl, playerReady]);

  useEffect(() => {
    if (!playerRef.current || !playerReady || !youtubeTrackUrl || !isPlaying) return;
    const player = playerRef.current as any;
    try {
      if (typeof player.playVideo === "function") player.playVideo();
    } catch {}
  }, [isPlaying, playerReady, youtubeTrackUrl]);

  const handleDesktopPlayerMouseDown = (event: React.MouseEvent) => {
    if (window.innerWidth < 768) return;
    event.preventDefault();
    setDragState({
      startX: event.clientX,
      startY: event.clientY,
      startTop: desktopPlayerPosition.top,
      startRight: desktopPlayerPosition.right,
    });
  };

  const isHome = currentPage === "home";
  const isTransparent = isHome && !isScrolled && isDesktop;

  const navItems = [
    { id: "home", icon: Home, labelEn: "Home", labelEs: "Inicio" },
    { id: "bible", icon: BookOpen, labelEn: "Bible", labelEs: "Biblia" },
    { id: "media", icon: Play, labelEn: "Media", labelEs: "Medios" },
    { id: "news", icon: Megaphone, labelEn: "News", labelEs: "Noticias" },
    { id: "bulletin", icon: MessageCircle, labelEn: "Bulletin", labelEs: "Tablón" },
    { id: "games", icon: Gamepad2, labelEn: "Games", labelEs: "Juegos" },
  ];

  const shouldScrollTitle = !!currentTrackTitle && currentTrackTitle.length > 24;

  const titleContent = currentTrackTitle ? (
    <div className="max-w-full text-[0.7rem] text-neutral-100 marquee-container">
      {shouldScrollTitle ? (
        <div className="marquee-track">
          <span className="marquee-item">{currentTrackTitle}</span>
          <span className="marquee-item" aria-hidden="true">{currentTrackTitle}</span>
          <span className="marquee-item" aria-hidden="true">{currentTrackTitle}</span>
        </div>
      ) : (
        <span className="marquee-item truncate">{currentTrackTitle}</span>
      )}
    </div>
  ) : null;

  const playerControlBtn = (onClick: () => void, label: string, icon: React.ReactNode, variant?: "close") => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border text-neutral-200 transition-colors",
        variant === "close"
          ? "border-neutral-700 bg-neutral-900/90 hover:border-red-500 hover:text-red-400"
          : "border-neutral-700 bg-neutral-900/90 hover:border-neutral-500 hover:text-neutral-50"
      )}
      aria-label={label}
    >
      {icon}
    </button>
  );

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-300 bg-white shadow-lg transition-all duration-300 md:sticky md:top-0 md:border-t-0",
        isTransparent
          ? "md:bg-transparent md:border-transparent md:shadow-none"
          : "md:bg-warm-cream/95 md:backdrop-blur-sm md:border-b md:border-neutral-300 md:shadow-sm"
      )}
    >
      <div
        className={cn("container mx-auto py-0")}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom) - 20px, 2px)" }}
      >
        <div className="flex w-full flex-col gap-1 md:flex-col-reverse">

          {/* ===== MOBILE PLAYER (above nav tabs) ===== */}
          {youtubeTrackUrl && !isDesktop && (
            <div className="music-player-dark px-3 pt-1.5 md:hidden">
              {/* Minimized pill */}
              {isMinimized ? (
                <div className="flex w-full items-center justify-between rounded-2xl bg-neutral-900 px-3 py-1.5 shadow-md">
                  <div className="min-w-0 flex-1 max-w-[60%]">
                    {titleContent}
                  </div>
                  <div className="ml-2 flex flex-shrink-0 items-center gap-1">
                    {playerControlBtn(
                      isPlaying ? handlePauseClick : handlePlayClick,
                      isPlaying ? t("Pause", "Pausar") : t("Play", "Reproducir"),
                      isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />
                    )}
                    {playerControlBtn(handleNextClick, t("Next", "Siguiente"), <SkipForward className="h-3.5 w-3.5" />)}
                    {playerControlBtn(toggleMinimize, t("Expand", "Expandir"), <Maximize2 className="h-3.5 w-3.5" />)}
                  </div>
                </div>
              ) : (
                <>
                  {/* Expanded controls */}
                  <div className="flex items-center justify-between rounded-t-2xl bg-neutral-900 px-3 py-1.5 shadow-inner">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                        {t("Music", "Música")}
                      </span>
                      <div className="mt-0.5">{titleContent}</div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      {playerControlBtn(
                        isPlaying ? handlePauseClick : handlePlayClick,
                        isPlaying ? t("Pause", "Pausar") : t("Play", "Reproducir"),
                        isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />
                      )}
                      {playerControlBtn(handleNextClick, t("Next", "Siguiente"), <SkipForward className="h-4 w-4" />)}
                      {playerControlBtn(toggleMinimize, t("Minimize", "Minimizar"), <Minimize2 className="h-4 w-4" />)}
                      {playerControlBtn(closeYouTubePlayer, t("Close", "Cerrar"), <X className="h-4 w-4" />, "close")}
                    </div>
                  </div>
                  {/* Player iframe container */}
                  <div className="h-40 w-full overflow-hidden rounded-b-2xl border-x border-b border-neutral-800" style={{ backgroundColor: "#262626" }}>
                    <div id="global-music-player" className="h-full w-full" />
                  </div>
                </>
              )}
            </div>
          )}

          {/* ===== DESKTOP MINIMIZED BAR (integrated in navbar) ===== */}
          {youtubeTrackUrl && isDesktop && isMinimized && (
            <div className="music-player-dark hidden md:block px-3 py-1">
              <div className="flex items-center justify-center gap-3 rounded-xl bg-neutral-900 px-4 py-1.5 shadow-sm">
                <div className="min-w-0 max-w-[14rem]">
                  {titleContent}
                </div>
                <div className="flex items-center gap-1.5">
                  {playerControlBtn(
                    isPlaying ? handlePauseClick : handlePlayClick,
                    isPlaying ? t("Pause", "Pausar") : t("Play", "Reproducir"),
                    isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />
                  )}
                  {playerControlBtn(handleNextClick, t("Next", "Siguiente"), <SkipForward className="h-3.5 w-3.5" />)}
                  {playerControlBtn(toggleMinimize, t("Expand", "Expandir"), <Maximize2 className="h-3.5 w-3.5" />)}
                  {playerControlBtn(closeYouTubePlayer, t("Close", "Cerrar"), <X className="h-3.5 w-3.5" />, "close")}
                </div>
              </div>
            </div>
          )}

          {/* ===== NAV TABS ===== */}
          <div className="flex w-full items-center justify-between gap-1 px-3 py-2 md:justify-center md:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-lg px-3 py-2 text-[0.8rem] font-medium transition-all md:flex-initial md:flex-row md:gap-2 md:px-4 md:py-2 md:text-sm nav-button",
                    isActive
                      ? "text-warm-red bg-warm-red/15 border-2 border-warm-red/30 shadow-sm"
                      : isTransparent
                        ? "!text-white hover:text-warm-red hover:bg-warm-red/5 border-2 border-transparent"
                        : "text-neutral-700 hover:text-warm-red hover:bg-warm-red/5 border-2 border-transparent"
                  )}
                >
                  <Icon className={cn("h-5 w-5 md:h-5 md:w-5", isActive && "text-warm-red", isTransparent && !isActive && "!text-white")} />
                  <span className={cn("text-xs font-medium whitespace-nowrap md:text-sm", isActive ? "text-warm-red" : isTransparent && "!text-white")}>
                    {t(item.labelEn, item.labelEs)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP FLOATING PLAYER (expanded) ===== */}
      {youtubeTrackUrl && isDesktop && !isMinimized && (
        <div
          className="music-player-dark fixed z-[60] w-80 transition-all"
          style={{ top: desktopPlayerPosition.top, right: desktopPlayerPosition.right }}
        >
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-xl" style={{ backgroundColor: "#262626" }}>
            <div
              className="flex cursor-move items-center justify-between gap-3 px-3 pt-2"
              onMouseDown={handleDesktopPlayerMouseDown}
            >
              <div className="min-w-0 flex-1">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  {t("Music", "Música")}
                </span>
                <div className="mt-0.5">{titleContent}</div>
              </div>
              <div className="flex items-center gap-1.5">
                {playerControlBtn(
                  isPlaying ? handlePauseClick : handlePlayClick,
                  isPlaying ? t("Pause", "Pausar") : t("Play", "Reproducir"),
                  isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />
                )}
                {playerControlBtn(handleNextClick, t("Next", "Siguiente"), <SkipForward className="h-3.5 w-3.5" />)}
                {playerControlBtn(toggleMinimize, t("Minimize", "Minimizar"), <Minimize2 className="h-3.5 w-3.5" />)}
                {playerControlBtn(closeYouTubePlayer, t("Close", "Cerrar"), <X className="h-3.5 w-3.5" />, "close")}
              </div>
            </div>
            <div className="mt-2 aspect-video w-full overflow-hidden">
              <div id="global-music-player" className="h-full w-full" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
