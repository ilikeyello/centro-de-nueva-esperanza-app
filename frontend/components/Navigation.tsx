import { useEffect, useState } from "react";
import {
  Home,
  Megaphone,
  Play,
  Gamepad2,
  Languages,
  MessageCircle,
  Minimize2,
  Maximize2,
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
  } = usePlayer();

  // Convert YouTube playlist URL to embed format for iframe
  const getEmbedUrl = (url: string | null) => {
    console.log('Original URL:', url);
    
    if (!url) return url;
    
    // If already in embed format, ensure it has required parameters
    if (url.includes('youtube.com/embed/videoseries')) {
      // Add required parameters for YouTube embed
      const separator = url.includes('?') ? '&' : '?';
      const result = `${url}${separator}enablejsapi=1&origin=${window.location.origin}&widgetid=1`;
      console.log('Already embed URL, result:', result);
      return result;
    }
    
    // Extract playlist ID from regular YouTube playlist URL
    const match = url.match(/[?&]list=([^&]+)/);
    if (match) {
      const playlistId = match[1];
      const result = `https://www.youtube.com/embed/videoseries?list=${playlistId}&enablejsapi=1&origin=${window.location.origin}&widgetid=1`;
      console.log('Converted to embed URL, result:', result);
      return result;
    }
    
    console.log('No playlist ID found, returning original:', url);
    return url;
  };

  const embedUrl = getEmbedUrl(youtubeTrackUrl);

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
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex w-full flex-col gap-1 md:flex-col-reverse">
          {/* Mobile nav-embedded YouTube player */}
          {youtubeTrackUrl && (
            <div className="px-3 pt-2 md:hidden">
              <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/90">
                <div className="flex items-center justify-between px-3 pt-2">
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    {t("Music", "Música")}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleMinimize}
                      className="rounded-full border border-neutral-700 px-2 py-0.5 text-[0.7rem] text-neutral-300 hover:border-neutral-500 hover:text-neutral-50"
                      aria-label={t(
                        isMinimized ? "Expand music player" : "Minimize music player",
                        isMinimized ? "Expandir reproductor de música" : "Minimizar reproductor de música"
                      )}
                    >
                      {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
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
                  <iframe
                    src={embedUrl || ''}
                    title="YouTube player"
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex w-full items-center justify-between gap-1 px-3 py-3 md:justify-center md:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[0.7rem] transition-colors md:flex-initial md:flex-row md:gap-2 md:px-3 md:py-2 md:text-sm",
                    isActive
                      ? "text-red-500"
                      : "text-neutral-400 hover:text-neutral-200"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "text-red-500")} />
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
                "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[0.7rem] text-neutral-400 transition-colors hover:text-neutral-200 md:flex-initial md:flex-row md:gap-2 md:px-3 md:py-2 md:text-sm",
                "border border-transparent md:border-neutral-700 md:bg-neutral-900"
              )}
              aria-label={language === "en" ? "Switch to Spanish" : "Cambiar a inglés"}
            >
              <Languages className="h-5 w-5" />
              <span className="text-xs font-medium md:text-sm">{language === "en" ? "ESP" : "ENG"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop floating YouTube overlays (outside navbar) */}
      {youtubeTrackUrl && (
        <div
          className={cn(
            "hidden md:block fixed z-40 w-80 transition-all",
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
              <iframe
                src={embedUrl || ''}
                title="YouTube player"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
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
