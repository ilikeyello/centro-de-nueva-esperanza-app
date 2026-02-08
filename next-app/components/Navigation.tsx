"use client";

import { useEffect, useRef, useState } from "react";
import {
  Home,
  Megaphone,
  Play,
  Pause,
  SkipForward,
  Gamepad2,
  Languages,
  MessageCircle,
  Minimize2,
  Maximize2,
  BookOpen,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

function pageFromPath(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/bible")) return "bible";
  if (pathname.startsWith("/media")) return "media";
  if (pathname.startsWith("/news")) return "news";
  if (pathname.startsWith("/bulletin")) return "bulletin";
  if (pathname.startsWith("/games")) return "games";
  return "home";
}

function pathFromPage(page: string): string {
  switch (page) {
    case "home":
      return "/";
    case "bible":
      return "/bible";
    case "media":
      return "/media";
    case "news":
      return "/news";
    case "bulletin":
      return "/bulletin";
    case "games":
      return "/games";
    default:
      return "/";
  }
}

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const currentPage = pageFromPath(pathname);

  const { t, language, toggleLanguage } = useLanguage();
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
  } = usePlayer();

  const getEmbedUrl = (url: string | null) => {
    if (!url) return url;
    if (url.includes("youtube.com/embed/videoseries")) {
      return url;
    }

    const listMatch = url.match(/[?&]list=([^&]+)/);
    const siMatch = url.match(/[?&]si=([^&]+)/);

    if (listMatch) {
      const playlistId = listMatch[1];
      const sessionId = siMatch ? siMatch[1] : "";

      let embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
      if (sessionId) {
        embedUrl += `&si=${sessionId}`;
      }

      return embedUrl;
    }

    return url;
  };

  const handleNavigate = (page: string) => {
    const path = pathFromPage(page);
    router.push(path);
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }
  };

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

  const embedUrl = getEmbedUrl(youtubeTrackUrl);

  const playerRef = useRef<any | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const lastLayoutIsDesktopRef = useRef<boolean | null>(null);

  const [desktopPlayerPosition, setDesktopPlayerPosition] = useState({ top: 160, right: 16 });
  const [dragState, setDragState] = useState<{
    startX: number;
    startY: number;
    startTop: number;
    startRight: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const w = window as any;

    const prevIsDesktop = lastLayoutIsDesktopRef.current;
    lastLayoutIsDesktopRef.current = isDesktop;
    const layoutChanged = prevIsDesktop !== null && prevIsDesktop !== isDesktop;

    if (!youtubeTrackUrl) {
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

    if (layoutChanged && playerRef.current && typeof playerRef.current.destroy === "function") {
      try {
        playerRef.current.destroy();
      } catch {
        // ignore
      }
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
        },
        events: {
          onReady: () => {
            setPlayerReady(true);
          },
          onStateChange: (event: any) => {
            const YT = w.YT;
            if (!YT || !YT.PlayerState) return;
            if (event.data === YT.PlayerState.ENDED) {
              playNextInQueue();
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
    if (!playerRef.current) return;
    if (typeof window === "undefined") return;
    if (!playerReady) return;

    const player = playerRef.current as any;

    if (embedUrl) {
      try {
        if (typeof player.loadVideoByUrl === "function") {
          player.loadVideoByUrl(embedUrl);
        }
        if (typeof player.playVideo === "function") {
          player.playVideo();
        }
      } catch {
        // ignore
      }
    }
  }, [embedUrl, playerReady]);

  useEffect(() => {
    if (!playerRef.current) return;
    if (!playerReady) return;
    if (!youtubeTrackUrl) return;
    if (!isPlaying) return;

    const player = playerRef.current as any;
    try {
      if (typeof player.playVideo === "function") {
        player.playVideo();
      }
    } catch {
      // ignore
    }
  }, [isPlaying, playerReady, youtubeTrackUrl]);

  const handleDesktopPlayerMouseDown = (event: any) => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
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
    { id: "bible", icon: BookOpen, labelEn: "Bible", labelEs: "Biblia" },
    { id: "media", icon: Play, labelEn: "Media", labelEs: "Medios" },
    { id: "news", icon: Megaphone, labelEn: "News", labelEs: "Noticias" },
    { id: "bulletin", icon: MessageCircle, labelEn: "Bulletin", labelEs: "Tablón" },
    { id: "games", icon: Gamepad2, labelEn: "Games", labelEs: "Juegos" },
  ];

  const shouldScrollTitle = !!currentTrackTitle && currentTrackTitle.length > 24;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur transition-transform md:sticky md:top-0 md:border-b md:border-t-0">
      <div
        className={cn("container mx-auto py-0")}
        style={{ paddingBottom: "max(env(safe-area-inset-bottom) - 20px, 2px)" }}
      >
        <div className="flex w-full flex-col gap-1 md:flex-col-reverse">
          {youtubeTrackUrl && isMinimized && (
            <div className="flex items-center justify-between px-3 pt-1.5 md:hidden">
              <div className="flex w-full items-center justify-between rounded-2xl bg-neutral-900 px-3 py-1 text-[0.75rem] shadow-inner">
                <div className="min-w-0 flex-1 max-w-[65%]">
                  {currentTrackTitle && (
                    <div className="max-w-full text-[0.7rem] text-neutral-100 marquee-container">
                      {shouldScrollTitle ? (
                        <div className="marquee-track">
                          <span className="marquee-item">{currentTrackTitle}</span>
                          <span className="marquee-item" aria-hidden="true">
                            {currentTrackTitle}
                          </span>
                          <span className="marquee-item" aria-hidden="true">
                            {currentTrackTitle}
                          </span>
                        </div>
                      ) : (
                        <span className="marquee-item truncate">{currentTrackTitle}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="ml-2 flex flex-shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={isPlaying ? handlePauseClick : handlePlayClick}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/90 text-neutral-200 hover:border-neutral-500 hover:text-neutral-50"
                    aria-label={
                      isPlaying ? t("Pause music", "Pausar música") : t("Play music", "Reproducir música")
                    }
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleNextClick}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/90 text-neutral-200 hover:border-neutral-500 hover:text-neutral-50"
                    aria-label={t("Next song", "Siguiente canción")}
                  >
                    <SkipForward className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleMinimize}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/90 text-neutral-200 hover:border-neutral-500 hover:text-neutral-50"
                    aria-label={t("Expand music player", "Expandir reproductor de música")}
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {youtubeTrackUrl && !isDesktop && (
            <div className={cn("px-3 pt-1.5 md:hidden", isMinimized && "hidden")}>
              <div className="flex items-center justify-between rounded-2xl bg-neutral-900 px-3 py-1.5 text-[0.75rem] shadow-inner">
                <div className="min-w-0 flex-1 pr-2">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    {t("Music", "Música")}
                  </span>
                  {currentTrackTitle && (
                    <div className="mt-0.5 max-w-full text-[0.7rem] text-neutral-100 marquee-container">
                      {shouldScrollTitle ? (
                        <div className="marquee-track">
                          <span className="marquee-item">{currentTrackTitle}</span>
                          <span className="marquee-item" aria-hidden="true">
                            {currentTrackTitle}
                          </span>
                          <span className="marquee-item" aria-hidden="true">
                            {currentTrackTitle}
                          </span>
                        </div>
                      ) : (
                        <span className="marquee-item truncate">{currentTrackTitle}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={isPlaying ? handlePauseClick : handlePlayClick}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/90 text-neutral-200 hover:border-neutral-500 hover:text-neutral-50"
                    aria-label={
                      isPlaying ? t("Pause music", "Pausar música") : t("Play music", "Reproducir música")
                    }
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleNextClick}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/90 text-neutral-200 hover:border-neutral-500 hover:text-neutral-50"
                    aria-label={t("Next song", "Siguiente canción")}
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleMinimize}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/90 text-neutral-200 hover:border-neutral-500 hover:text-neutral-50"
                    aria-label={t("Minimize music player", "Minimizar reproductor de música")}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={closeYouTubePlayer}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/90 text-neutral-200 hover:border-red-500 hover:text-red-400"
                    aria-label={t("Close music player", "Cerrar reproductor de música")}
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="mt-2 h-40 w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/90">
                <div id="global-music-player" className="h-full w-full" />
              </div>
            </div>
          )}

          <div className="flex w-full items-center justify-between gap-1 px-3 py-2 md:justify-center md:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={cn(
                    "flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-lg px-2 py-1.5 text-[0.75rem] transition-colors md:flex-initial md:flex-row md:gap-2 md:px-3 md:py-2 md:text-sm nav-button",
                    isActive ? "text-red-500" : "text-neutral-400 hover:text-neutral-200"
                  )}
                >
                  <Icon className={cn("h-6 w-6 md:h-5 md:w-5", isActive && "text-red-500")} />
                  <span className="text-xs font-medium whitespace-nowrap md:text-sm">
                    {t(item.labelEn, item.labelEs)}
                  </span>
                </button>
              );
            })}

            {isDesktop && (
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
            )}
          </div>
        </div>
      </div>

      {youtubeTrackUrl && isDesktop && (
        <div
          className={cn(
            "z-60 transition-all",
            isDesktop ? "fixed w-80" : "fixed bottom-16 left-2 right-2 w-auto",
            isMinimized && "pointer-events-none opacity-0"
          )}
          style={isDesktop ? { top: desktopPlayerPosition.top, right: desktopPlayerPosition.right } : undefined}
        >
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/90 shadow-xl">
            <div
              className={cn("flex items-center justify-between gap-3 px-3 pt-2", isDesktop && "cursor-move")}
              onMouseDown={isDesktop ? handleDesktopPlayerMouseDown : undefined}
            >
              <div className="min-w-0 flex-1">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  {t("Music", "Música")}
                </span>
                {currentTrackTitle && (
                  <div className="mt-0.5 max-w-full text-[0.7rem] text-neutral-100 marquee-container">
                    {shouldScrollTitle ? (
                      <div className="marquee-track">
                        <span className="marquee-item">{currentTrackTitle}</span>
                        <span className="marquee-item" aria-hidden="true">
                          {currentTrackTitle}
                        </span>
                        <span className="marquee-item" aria-hidden="true">
                          {currentTrackTitle}
                        </span>
                      </div>
                    ) : (
                      <span className="marquee-item truncate">{currentTrackTitle}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={isPlaying ? handlePauseClick : handlePlayClick}
                  className="rounded-full border border-neutral-700 px-2 py-0.5 text-[0.7rem] text-neutral-300 hover:border-neutral-500 hover:text-neutral-50"
                  aria-label={isPlaying ? t("Pause music", "Pausar música") : t("Play music", "Reproducir música")}
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleNextClick}
                  className="rounded-full border border-neutral-700 px-2 py-0.5 text-[0.7rem] text-neutral-300 hover:border-neutral-500 hover:text-neutral-50"
                  aria-label={t("Next song", "Siguiente canción")}
                >
                  <SkipForward className="h-3.5 w-3.5" />
                </button>
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
            <div className={cn("mt-2 w-full overflow-hidden transition-all", isMinimized ? "h-0" : "aspect-video")}>
              <div id="global-music-player" className="h-full w-full" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
