import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "../../contexts/LanguageContext";
import { Calendar, ChevronDown, ChevronUp, Loader2, Music, Pause, Play, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayer } from "../../contexts/PlayerContext";
import { useBackend } from "../../hooks/useBackend";
import { cn } from "@/lib/utils";
import { YouTubePlayer, extractYouTubeVideoId } from "../YouTubePlayer";

interface SermonItem {
  id: number;
  title: string;
  youtubeUrl: string;
  createdAt: string;
  description?: string;
}

interface MediaProps {
  onStartMusic?: () => void;
  isMediaPage?: boolean;
}

export function Media({ onStartMusic, isMediaPage = true }: MediaProps) {
  const { language, t } = useLanguage();
  const backend = useBackend();
  const [sermons, setSermons] = useState<SermonItem[]>([]);
  const [selectedSermonId, setSelectedSermonId] = useState<number | null>(null);
  const [loadingSermons, setLoadingSermons] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mobilePipBottom, setMobilePipBottom] = useState(96);
  const [desktopPipPosition, setDesktopPipPosition] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<{
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
  } | null>(null);

  const wasMediaPageRef = useRef<boolean>(isMediaPage);
  const lastPageChangeRef = useRef<number>(Date.now());
  useEffect(() => {
    lastPageChangeRef.current = Date.now();
  }, [isMediaPage]);

  const {
    playPlaylistByUrl,
    playlists,
    isPlayingYouTubePlaylist,
    currentPlaylistVideos,
    currentPlaylistActiveIndex,
    playVideoAtIndex,
    currentTrack,
    isPlaying,
    livestreamUrl,
    livestreamTitle,
    livestreamIsLive,
    isLivestreamPipMinimized: isPipMinimized,
    setLivestreamPipMinimized: setIsPipMinimized,
    hasInteractedWithLivestream,
    setHasInteractedWithLivestream,
    isLivestreamPipDismissed: isPipDismissed,
    setLivestreamPipDismissed: setIsPipDismissed,
    setIsLivestreamPlaying,
    shouldShowLivestreamPip,
  } = usePlayer();
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(null);

  // Build a static iframe URL for the livestream. We deliberately skip the
  // YouTube IFrame JS API here: the API auto-injects `origin=<window.origin>`
  // into the embed URL, and inside Capacitor that becomes `capacitor://localhost`,
  // which YouTube rejects for *live* embeds with "Video unavailable. Watch on
  // YouTube." A plain iframe on youtube-nocookie.com works in WKWebView.
  const livestreamEmbedSrc = useMemo(() => {
    if (!livestreamUrl) return "";
    try {
      const u = new URL(livestreamUrl);
      const parts = u.pathname.split("/").filter(Boolean);
      const videoId = parts[0] === "embed" ? parts[1] : "";
      if (!videoId) return "";
      return `https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&controls=1&modestbranding=1&rel=0`;
    } catch {
      return "";
    }
  }, [livestreamUrl]);

  useEffect(() => {
    const loadSermons = async () => {
      try {
        setLoadingSermons(true);
        const { sermons } = await backend.listSermons();
        // Transform Supabase sermons to SermonItem format
        const transformedSermons: SermonItem[] = sermons.map((sermon: any) => ({
          id: sermon.id,
          title: sermon.title,
          youtubeUrl: sermon.youtube_url || sermon.youtubeUrl,
          createdAt: sermon.created_at || sermon.createdAt,
          description: sermon.description
        }));
        setSermons(transformedSermons);
        if (transformedSermons.length > 0) {
          setSelectedSermonId(transformedSermons[0].id);
        }
      } catch {
        // ignore, show empty state
      } finally {
        setLoadingSermons(false);
      }
    };

    loadSermons();
  }, [backend]);

  // Detect first interaction with the livestream iframe so the PIP can pop out
  // on navigation. Clicks inside an iframe steal focus from the parent window,
  // which fires `window.blur` — a reliable proxy for "user tapped play".
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!livestreamIsLive || !livestreamEmbedSrc) return;
    if (hasInteractedWithLivestream) return;

    const handleBlur = () => {
      if (document.activeElement?.tagName === "IFRAME") {
        setHasInteractedWithLivestream(true);
        setIsLivestreamPlaying(true);
      }
    };

    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [
    livestreamIsLive,
    livestreamEmbedSrc,
    hasInteractedWithLivestream,
    setHasInteractedWithLivestream,
    setIsLivestreamPlaying,
  ]);

  const selectedSermon = useMemo(() => {
    if (!Array.isArray(sermons) || sermons.length === 0) return null;
    if (selectedSermonId == null) return sermons[0];
    return sermons.find((s) => s.id === selectedSermonId) ?? sermons[0];
  }, [sermons, selectedSermonId]);

  const isDev = import.meta.env.DEV;
  const devSampleSermon: SermonItem | null = isDev
    ? {
        id: -1,
        title: "Sample Devotional (Local Only)",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        createdAt: new Date().toISOString(),
      }
    : null;

  const effectiveSelectedSermon = selectedSermon ?? devSampleSermon;

  const getEmbedUrl = (url: string) => {
    console.log('getEmbedUrl input:', url);
    
    // Return empty string if no URL provided
    if (!url || url.trim() === '') {
      console.log('getEmbedUrl: empty URL, returning empty string');
      return '';
    }
    
    try {
      const u = new URL(url);
      
      // Handle YouTube live channel embed URLs
      if (u.pathname.includes('/embed/live_stream') && u.searchParams.get('channel')) {
        const channelId = u.searchParams.get('channel');
        const result = `https://www.youtube.com/embed/live_stream?channel=${channelId}&enablejsapi=1&playsinline=1`;
        console.log('getEmbedUrl output (channel live):', result);
        return result;
      }
      
      // Handle YouTube channel URLs (convert to live stream embed)
      if (u.pathname.includes('/channel/') || u.pathname.includes('/c/') || u.pathname.includes('/@')) {
        let channelId = '';
        if (u.pathname.includes('/channel/')) {
          channelId = u.pathname.split('/channel/')[1]?.split('?')[0] || '';
        } else if (u.pathname.includes('/c/')) {
          channelId = u.pathname.split('/c/')[1]?.split('?')[0] || '';
        } else if (u.pathname.includes('/@')) {
          channelId = u.pathname.split('/@')[1]?.split('?')[0] || '';
        }
        
        if (channelId) {
          // Try multiple channel live stream formats
          const formats = [
            `https://www.youtube.com/embed/live_stream?channel=${channelId}&enablejsapi=1&playsinline=1`,
            `https://www.youtube.com/embed/${channelId}?live=1&enablejsapi=1&playsinline=1`,
            `https://www.youtube.com/embed/live_stream?channel=${channelId}&enablejsapi=1&playsinline=1`
          ];
          
          console.log('getEmbedUrl output (channel live formats):', formats[0]);
          return formats[0]; // Use the first format
        }
      }
      
      // Handle regular YouTube URLs
      // Use youtube-nocookie.com and omit enablejsapi=1 to avoid embed error 153
      // in WKWebView (capacitor://localhost is not a valid postMessage origin).
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.replace('/', '');
        const result = `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&controls=1&modestbranding=1&rel=0`;
        console.log('getEmbedUrl output (youtu.be):', result);
        return result;
      }
      if (u.searchParams.get('v')) {
        const id = u.searchParams.get('v');
        const result = `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&controls=1&modestbranding=1&rel=0`;
        console.log('getEmbedUrl output (watch):', result);
        return result;
      }
      if (u.pathname.includes('/live/')) {
        const id = u.pathname.split('/live/')[1]?.split('?')[0];
        const result = `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&controls=1&modestbranding=1&rel=0`;
        console.log('getEmbedUrl output (live):', result);
        return result;
      }
      if (u.pathname.includes('/embed/')) {
        // Rewrite to nocookie host and strip enablejsapi to keep WKWebView happy.
        const id = u.pathname.split('/embed/')[1]?.split('/')[0]?.split('?')[0];
        if (id) {
          const result = `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&controls=1&modestbranding=1&rel=0`;
          console.log('getEmbedUrl output (embed):', result);
          return result;
        }
      }
      
      console.log('getEmbedUrl output (fallback):', url);
      return url;
    } catch (error) {
      console.error('getEmbedUrl error:', error);
      return url;
    }
  };

  // Removed periodic refresh to avoid overriding main-site value

  // (Removed autoplay attempt tied to legacy window calculation)

  // Track Mobile Nav Tabs offset to align PIP accurately above navbar.
  // A ResizeObserver keeps it in sync as the navbar grows/shrinks (expand,
  // minimize/restore) so the floating iframe always sits exactly over the
  // navbar placeholder — otherwise a stale offset reveals the grey placeholder.
  useEffect(() => {
    if (isDesktop || isMediaPage) return;

    const updatePosition = () => {
      const tabs = document.getElementById("mobile-nav-tabs");
      if (tabs) {
         const rect = tabs.getBoundingClientRect();
         const distFromBottom = window.innerHeight - rect.top;
         setMobilePipBottom(distFromBottom);
      }
    };

    // Initial and a follow-up after layout settles.
    updatePosition();
    const t = setTimeout(updatePosition, 100);
    window.addEventListener("resize", updatePosition);

    // Observe the navbar (its container) so any height change re-aligns the PIP.
    const nav = document.getElementById("mobile-nav-tabs")?.closest("nav") ?? null;
    let ro: ResizeObserver | null = null;
    if (nav && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updatePosition);
      ro.observe(nav);
    }

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", updatePosition);
      if (ro) ro.disconnect();
    };
  }, [isDesktop, isMediaPage, isPipMinimized]);

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
      setDesktopPipPosition({
        x: dragState.startOffsetX + dx,
        y: dragState.startOffsetY + dy,
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

  const handleDragStart = (event: React.MouseEvent) => {
    if (window.innerWidth < 768) return;
    event.preventDefault();
    setDragState({
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: desktopPipPosition.x,
      startOffsetY: desktopPipPosition.y,
    });
  };

  // Reset PIP dismissal if returning to Media page
  useEffect(() => {
    if (isMediaPage) {
      setIsPipDismissed(false);
    }
    
    // Always update the ref after the logic runs
    wasMediaPageRef.current = isMediaPage;
  }, [isMediaPage, setIsPipDismissed]);

  // Interaction is now tracked strictly by the PLAYING status in onStateChange
  // to ensure the PIP only pops out if the user has actually started the stream.

  // Ghost Mode: We NEVER return null here. 
  // If we return null, the component unmounts and the YouTube iframe dies.
  // Visibility is handled by CSS classes on the wrappers below.


  return (
    <div className={cn(
      isMediaPage ? "mx-auto py-8 container px-4 space-y-10 relative" : "fixed inset-0 pointer-events-none z-[60]"
    )}>
      {/* 1. PERSISTENT PLAYER BOX (Strategically isolated for DOM stability) */}
      <div
        className={cn(
          "transform",
          // Only animate when the PIP is actually supposed to be visible.
          // If nothing is playing and the user tabs away, skip the transition so
          // the div doesn't flash as a floating overlay for 300 ms before hiding.
          (isMediaPage || shouldShowLivestreamPip) && "transition-all duration-300",
          isMediaPage
            ? "overflow-hidden rounded-2xl border border-[--border-color] bg-[--surface] shadow-xl relative aspect-video"
            : cn(
                "music-player-dark fixed z-[60] overflow-hidden pointer-events-auto",
                isDesktop
                  ? "bottom-24 right-4 rounded-xl origin-bottom-right shadow-2xl border border-[--border-color]"
                  : "left-3 right-3 rounded-b-2xl origin-bottom shadow-none border-none"
              ),
          (!isMediaPage && !shouldShowLivestreamPip) && "opacity-0 pointer-events-none invisible"
        )}
        style={isMediaPage ? {} : {
           transform: isDesktop && (desktopPipPosition.x !== 0 || desktopPipPosition.y !== 0) ? `translate(${desktopPipPosition.x}px, ${desktopPipPosition.y}px)` : undefined,
           width: isPipMinimized ? "18rem" : (isDesktop ? "20rem" : undefined),
           bottom: !isDesktop ? `${mobilePipBottom + 4}px` : undefined,
        }}
      >
        <div 
          className={cn(
            "flex items-center justify-between border-b border-[--border-color] px-3 py-2", 
            isDesktop && "cursor-move",
            (isMediaPage || !isDesktop) && "hidden"
          )}
          style={(!isMediaPage && isDesktop) ? { backgroundColor: "var(--surface)" } : {}}
          onMouseDown={handleDragStart}
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[--ink-light]">
              {t("Live Now", "En Vivo")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsPipMinimized(!isPipMinimized)}
              className="rounded hover:bg-[--surface-mid] p-1 text-[--ink-mid] transition-colors hover:text-white"
              aria-label={isPipMinimized ? "Expand" : "Minimize"}
            >
              {isPipMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPipDismissed(true);
                setHasInteractedWithLivestream(false);
              }}
              className="rounded hover:bg-[--surface-mid] p-1 text-[--ink-mid] transition-colors hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className={cn(
          "relative bg-black transition-all w-full gpu-layer",
          isMediaPage ? "aspect-video h-full" : cn(
            "overflow-hidden",
            isDesktop ? "aspect-video" : "h-40"
          ),
          // Minimize by CLIPPING the box to zero height — never resize the iframe
          // stage below. Resizing a YouTube iframe to 0 and back blanks it grey
          // in WKWebView. The stage keeps its height so audio + video survive.
          (!isMediaPage && isPipMinimized) && "!h-0 border-0 overflow-hidden opacity-0 pointer-events-none"
        )}>
          <div className={cn(
            "absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[--surface] px-6 text-center",
            (!livestreamIsLive && isMediaPage) ? "" : "hidden"
          )}>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[--sage]">
              {livestreamTitle || t("Livestream", "Transmisión en vivo")}
            </p>
            <p className="text-2xl font-bold text-[--ink-dark] sm:text-3xl">
              {t("Tune in Sundays at 3:00 PM", "Conéctate los domingos a las 3:00 PM")}
            </p>
          </div>
          {/* Stable-height stage: stays sized even while the box above clips to 0
              on minimize, so the iframe is never resized (which would blank it). */}
          <div className={cn("w-full gpu-layer", isMediaPage || isDesktop ? "h-full" : "h-40")}>
            {livestreamEmbedSrc && (
              <iframe
                id="cne-livestream-player"
                src={livestreamEmbedSrc}
                title={livestreamTitle || "Livestream"}
                className={cn(
                  "h-full w-full border-0",
                  (!livestreamIsLive && isMediaPage) && "invisible"
                )}
                // Hide the `capacitor://localhost` referer from YouTube so the
                // HTML5 player doesn't trip "error 153" (invalid embed origin)
                // on live broadcasts in WKWebView.
                referrerPolicy="no-referrer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </div>

      {/* 2. THE PAGE CONTENT BOX (Hidden when tabbing out) */}
      <section className={cn(isMediaPage ? "space-y-6" : "hidden")}>
        <div className={cn(isMediaPage ? "grid gap-6 md:grid-cols-3" : "hidden")}>
          <div className={cn("space-y-4", !isMediaPage && "hidden")}>
            <div className="flex items-center gap-2 text-[--sage]">
              <Play className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                {t("Watch Live", "Ver en Vivo")}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[--ink-dark] sm:text-4xl">
              {t("Experience CNE Online", "Experimenta CNE en Línea")}
            </h1>
            <p className="text-[--ink-mid]">
              {t(
                "Join us for our weekly services and special events. When we go live, the stream will begin automatically.",
                "Únete a nosotros para nuestros servicios semanales y eventos especiales. Cuando estemos en vivo, la transmisión comenzará automáticamente."
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a
                  href="#music"
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (onStartMusic) {
                      onStartMusic();
                    }
                  }}
                >
                  <Music className="h-4 w-4" />
                  {t("Listen to Music", "Escuchar Música")}
                </a>
              </Button>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[--border-color] bg-[--surface] p-4 shadow-sm">
              <Calendar className="h-5 w-5 text-[--sage]" />
              <div>
                <p className="text-sm font-semibold text-[--ink-dark]">
                  {t("Live Sundays at 3:30 PM", "En vivo los domingos a las 3:30 PM")}
                </p>
                <p className="text-sm text-[--ink-mid]">
                  {t(
                    "Arrive a few minutes early to chat and pray together.",
                    "Llega unos minutos antes para conversar y orar juntos."
                  )}
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className={cn("space-y-6", !isMediaPage && "hidden")}>
        <div>
          <h2 className="text-2xl font-bold text-[--ink-dark]">
            {t("Devotionals", "Devocionales")}
          </h2>
          <p className="text-[--ink-mid]">
            {t(
              "Catch up on previous devotionals and share them with friends.",
              "Ponte al día con los devocionales anteriores y compártelos con amigos."
            )}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-none bg-transparent shadow-none md:col-span-2">
            <CardHeader>
              <CardTitle className="text-[--ink-dark]">
                {effectiveSelectedSermon
                  ? effectiveSelectedSermon.title
                  : t("No devotional selected", "Ningún devocional seleccionado")}
              </CardTitle>
              {!loadingSermons && effectiveSelectedSermon && effectiveSelectedSermon.description && (
                <p className="text-sm text-[--ink-mid] leading-relaxed mt-2">
                  {effectiveSelectedSermon.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative aspect-video overflow-hidden rounded-2xl">
                {loadingSermons && !selectedSermon && (
                  <div className="flex h-full items-center justify-center text-xs text-[--ink-light]">
                    {t("Loading sermons...", "Cargando sermones...")}
                  </div>
                )}
                {!loadingSermons && effectiveSelectedSermon && (() => {
                  const videoId = extractYouTubeVideoId(effectiveSelectedSermon.youtubeUrl);
                  return videoId ? (
                    <YouTubePlayer
                      key={videoId}
                      videoId={videoId}
                      title={effectiveSelectedSermon.title}
                      className="absolute inset-0 h-full w-full"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[--ink-light]">
                      {t("Video unavailable.", "Video no disponible.")}
                    </div>
                  );
                })()}
                {!loadingSermons && !effectiveSelectedSermon && (
                  <div className="flex h-full items-center justify-center text-xs text-[--ink-light]">
                    {t("No devotionals available yet.", "Todavía no hay devocionales disponibles.")}
                  </div>
                )}
              </div>
              {!loadingSermons && effectiveSelectedSermon && (
                <p className="text-xs text-[--ink-light]">
                  {t(
                    "Tap a devotional from the list to watch a different message.",
                    "Toca un devocional de la lista para ver un mensaje diferente."
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-[--border-color] bg-[--surface]">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-[--ink-dark]">
                {t("All Devotionals", "Todos los Devocionales")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 space-y-1 overflow-y-auto text-xs">
                {loadingSermons && (
                  <p className="text-[--ink-light]">
                    {t("Loading sermons...", "Cargando sermones...")}
                  </p>
                )}
                {!loadingSermons && sermons.length === 0 && (
                  <p className="text-[--ink-light]">
                    {t("No devotionals available yet.", "Todavía no hay devocionales disponibles.")}
                  </p>
                )}
                {!loadingSermons && sermons.length > 0 && (
                  <ul className="space-y-1">
                    {sermons.map((sermon) => {
                      const isActive = selectedSermon?.id === sermon.id;
                      return (
                        <li key={sermon.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedSermonId(sermon.id)}
                            className={`flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left transition-colors ${
                              isActive
                                ? "border-l-2 border-[--sage-mid] shadow-sm"
                                : "border border-transparent text-[--ink-dark] hover:border-[--border-color]"
                            }`}
                            style={{ 
                              backgroundColor: isActive ? "var(--sage)" : "var(--surface)",
                              color: isActive ? "var(--background)" : "inherit"
                            }}
                          >
                            <span className="truncate text-[0.8rem] font-medium">{sermon.title}</span>
                            <span className={`mt-0.5 text-[0.65rem] ${isActive ? "opacity-70" : "text-[--ink-mid]"}`}>
                              {new Date(sermon.createdAt).toLocaleDateString(
                                language === "en" ? "en-US" : "es-MX",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="music" className={cn("space-y-6", !isMediaPage && "hidden")}>
        <div>
          <h2 className="text-2xl font-bold text-[--ink-dark]">
            {t("Music & Worship", "Música y Adoración")}
          </h2>
          <p className="text-[--ink-mid]">
            {t(
              "Listen to curated worship playlists that we love to sing together.",
              "Escucha listas de reproducción de adoración que nos encanta cantar juntos."
            )}
          </p>
        </div>

        {playlists.length === 0 && (
          <div className="rounded-xl border border-[--border-color] bg-[--surface] p-6 text-center">
            <Music className="mx-auto mb-2 h-8 w-8 text-[--ink-mid]" />
            <p className="text-sm text-[--ink-light]">
              {t("No playlists available yet.", "Todavía no hay listas de reproducción disponibles.")}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {playlists.map((playlist) => {
            const isExpanded = expandedPlaylistId === playlist.id;
            const isThisPlaylistPlaying =
              isPlayingYouTubePlaylist &&
              currentTrack?.includes("list=") &&
              playlist.url.includes(
                currentTrack.match(/list=([^&]+)/)?.[1] || "__none__"
              );

            return (
              <Card
                key={playlist.id}
                className="overflow-hidden border-[--border-color] bg-[--surface] transition-colors"
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-[--surface]"
                  onClick={() =>
                    setExpandedPlaylistId(isExpanded ? null : playlist.id)
                  }
                >
                  <div
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-white shadow-lg"
                    style={{ backgroundColor: 'var(--sage)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      playPlaylistByUrl(playlist.url, playlist.title);
                      setExpandedPlaylistId(playlist.id);
                      if (onStartMusic) onStartMusic();
                    }}
                    role="button"
                    aria-label={t(
                      `Play ${playlist.title}`,
                      `Reproducir ${playlist.title}`
                    )}
                  >
                    {isThisPlaylistPlaying && isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[--ink-dark]">
                      {playlist.title}
                    </p>
                    <p className="text-xs text-[--ink-light]">
                      {isThisPlaylistPlaying
                        ? t("Now Playing", "Reproduciendo")
                        : t("YouTube Playlist", "Lista de YouTube")}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 flex-shrink-0 text-[--ink-light]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 flex-shrink-0 text-[--ink-light]" />
                  )}
                </button>

                  {isExpanded && (
                    <div className="border-t border-[--border-color] px-4 pb-4 pt-2">
                    {!isThisPlaylistPlaying && (
                      <button
                        type="button"
                        className="mb-3 w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: 'var(--sage)' }}
                        onClick={() => {
                          playPlaylistByUrl(playlist.url, playlist.title);
                          if (onStartMusic) onStartMusic();
                        }}
                      >
                        <Play className="mr-2 inline h-4 w-4" />
                        {t("Play Playlist", "Reproducir Lista")}
                      </button>
                    )}

                    {isThisPlaylistPlaying &&
                    currentPlaylistVideos.length > 0 ? (
                      <ul className="max-h-72 space-y-1 overflow-y-auto">
                        {currentPlaylistVideos.map((video, idx) => {
                          const isActive =
                            idx === currentPlaylistActiveIndex;
                          return (
                            <li key={video.videoId}>
                              <button
                                type="button"
                                onClick={() => playVideoAtIndex(idx)}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                  isActive
                                    ? "border-l-2 border-[--sage-mid] shadow-sm"
                                    : "border border-transparent text-[--ink-mid] hover:text-[--ink-dark]"
                                }`}
                                style={{ 
                                  backgroundColor: isActive ? "var(--sage)" : "transparent",
                                  color: isActive ? "var(--background)" : "inherit"
                                }}
                              >
                                <span className="w-6 flex-shrink-0 text-center text-xs text-[--ink-light]">
                                  {isActive && isPlaying ? (
                                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-[--sage] animate-pulse" />
                                  ) : (
                                    idx + 1
                                  )}
                                </span>
                                <span className="min-w-0 flex-1 truncate">
                                  {video.loading ? (
                                    <span className="inline-flex items-center gap-1.5 text-[--ink-light]">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      {t("Loading...", "Cargando...")}
                                    </span>
                                  ) : (
                                    video.title
                                  )}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : isThisPlaylistPlaying ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-sm text-[--ink-light]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t(
                          "Loading playlist songs...",
                          "Cargando canciones de la lista..."
                        )}
                      </div>
                    ) : (
                      <p className="py-2 text-center text-xs text-[--ink-light]">
                        {t(
                          "Press play to see all songs",
                          "Presiona reproducir para ver todas las canciones"
                        )}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
