import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "../../contexts/LanguageContext";
import { Calendar, ChevronDown, ChevronUp, Music, Pause, Play, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayer } from "../../contexts/PlayerContext";
import { useBackend } from "../../hooks/useBackend";
import { cn } from "@/lib/utils";
import { MuxPlayer } from "../MuxPlayer";
import { Capacitor } from "@capacitor/core";

interface SermonItem {
  id: number;
  title: string;
  muxPlaybackId: string | null;
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

  const lastPageChangeRef = useRef<number>(Date.now());
  useEffect(() => {
    lastPageChangeRef.current = Date.now();
  }, [isMediaPage]);

  const {
    tracks,
    playTrackList,
    currentTrack,
    isPlaying,
    livestreamPlaybackId,
    livestreamTitle,
    livestreamIsLive,
    isLivestreamPipMinimized: isPipMinimized,
    setLivestreamPipMinimized: setIsPipMinimized,
    setHasInteractedWithLivestream,
    isLivestreamPipDismissed: isPipDismissed,
    setLivestreamPipDismissed: setIsPipDismissed,
    setIsLivestreamPlaying,
    shouldShowLivestreamPip,
  } = usePlayer();

  useEffect(() => {
    const loadSermons = async () => {
      try {
        setLoadingSermons(true);
        const { sermons } = await backend.listSermons();
        const transformed: SermonItem[] = sermons.map((s: any) => ({
          id: s.id,
          title: s.title,
          muxPlaybackId: s.muxPlaybackId ?? null,
          createdAt: s.createdAt,
          description: s.description,
        }));
        setSermons(transformed);
        if (transformed.length > 0) setSelectedSermonId(transformed[0].id);
      } catch {
        // ignore, show empty state
      } finally {
        setLoadingSermons(false);
      }
    };
    loadSermons();
  }, [backend]);

  const selectedSermon = useMemo(() => {
    if (!Array.isArray(sermons) || sermons.length === 0) return null;
    if (selectedSermonId == null) return sermons[0];
    return sermons.find((s) => s.id === selectedSermonId) ?? sermons[0];
  }, [sermons, selectedSermonId]);

  // ── PIP positioning (mobile) ──────────────────────────────────────────────
  useEffect(() => {
    if (isDesktop || isMediaPage) return;
    const updatePosition = () => {
      const tabs = document.getElementById("mobile-nav-tabs");
      if (tabs) {
        const rect = tabs.getBoundingClientRect();
        setMobilePipBottom(window.innerHeight - rect.top);
      }
    };
    updatePosition();
    const timer = setTimeout(updatePosition, 100);
    window.addEventListener("resize", updatePosition);
    const nav = document.getElementById("mobile-nav-tabs")?.closest("nav") ?? null;
    let ro: ResizeObserver | null = null;
    if (nav && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updatePosition);
      ro.observe(nav);
    }
    return () => {
      clearTimeout(timer);
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
      setDesktopPipPosition({ x: dragState.startOffsetX + dx, y: dragState.startOffsetY + dy });
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

  // Reset PIP dismissal when returning to Media page.
  useEffect(() => {
    if (isMediaPage) setIsPipDismissed(false);
  }, [isMediaPage, setIsPipDismissed]);

  const showLivePlayer = Boolean(livestreamIsLive && livestreamPlaybackId);

  // Web-only, big-screen behavior (never affects the native iOS/Android app or
  // mobile web). On desktop web we (1) size the Media-page livestream a little
  // smaller and lower it off the navbar, and (2) drop the custom floating
  // mini-player entirely — mux-player exposes its own native picture-in-picture,
  // so the livestream only renders on the Media page and unmounts when you leave.
  const isWeb = Capacitor.getPlatform() === "web";
  const isWebDesktop = isWeb && isDesktop;
  const showLivestreamPip = shouldShowLivestreamPip && !isWebDesktop;
  const renderLivePlayer = showLivePlayer && (isMediaPage || !isWebDesktop);

  return (
    <div className={cn(
      isMediaPage ? "mx-auto py-8 container px-4 space-y-10 relative" : "fixed inset-0 pointer-events-none z-[60]",
      // Lower the Media page below the fixed desktop navbar (web big screens only).
      isMediaPage && isWebDesktop && "!pt-24"
    )}>
      {/* 1. PERSISTENT LIVESTREAM BOX (doubles as floating PIP off the Media page) */}
      <div
        className={cn(
          "transform",
          (isMediaPage || showLivestreamPip) && "transition-all duration-300",
          isMediaPage
            ? "overflow-hidden rounded-2xl border border-[--border-color] bg-[--surface] shadow-xl relative aspect-video"
            : cn(
                "music-player-dark fixed z-[60] overflow-hidden pointer-events-auto",
                isDesktop
                  ? "bottom-24 right-4 rounded-xl origin-bottom-right shadow-2xl border border-[--border-color]"
                  : "left-3 right-3 rounded-b-2xl origin-bottom shadow-none border-none"
              ),
          (!isMediaPage && !showLivestreamPip) && "opacity-0 pointer-events-none invisible",
          // Shrink & center the livestream on the Media page (web big screens only).
          isMediaPage && isWebDesktop && "max-w-4xl mx-auto"
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
          (!isMediaPage && isPipMinimized) && "!h-0 border-0 overflow-hidden opacity-0 pointer-events-none"
        )}>
          {/* Offline placeholder */}
          <div className={cn(
            "absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[--surface] px-6 text-center",
            (!showLivePlayer && isMediaPage) ? "" : "hidden"
          )}>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[--sage]">
              {livestreamTitle || t("Livestream", "Transmisión en vivo")}
            </p>
            <p className="text-2xl font-bold text-[--ink-dark] sm:text-3xl">
              {t("Tune in Sundays at 3:00 PM", "Conéctate los domingos a las 3:00 PM")}
            </p>
          </div>
          {renderLivePlayer && (
            <div className="h-full w-full">
              <MuxPlayer
                playbackId={livestreamPlaybackId!}
                streamType="live"
                title={livestreamTitle || "Livestream"}
                className={cn("h-full w-full", isMediaPage ? "aspect-video" : "")}
                onPlay={() => {
                  setHasInteractedWithLivestream(true);
                  setIsLivestreamPlaying(true);
                }}
                onPause={() => setIsLivestreamPlaying(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. PAGE CONTENT (hidden when in PIP overlay mode) */}
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
                  onClick={() => { if (onStartMusic) onStartMusic(); }}
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

      {/* 3. DEVOTIONALS */}
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
                {selectedSermon
                  ? selectedSermon.title
                  : t("No devotional selected", "Ningún devocional seleccionado")}
              </CardTitle>
              {!loadingSermons && selectedSermon?.description && (
                <p className="text-sm text-[--ink-mid] leading-relaxed mt-2">
                  {selectedSermon.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
                {loadingSermons && (
                  <div className="flex h-full items-center justify-center text-xs text-[--ink-light]">
                    {t("Loading devotionals...", "Cargando devocionales...")}
                  </div>
                )}
                {!loadingSermons && selectedSermon?.muxPlaybackId && (
                  <MuxPlayer
                    key={selectedSermon.muxPlaybackId}
                    playbackId={selectedSermon.muxPlaybackId}
                    streamType="on-demand"
                    title={selectedSermon.title}
                    className="absolute inset-0 h-full w-full"
                  />
                )}
                {!loadingSermons && !selectedSermon && (
                  <div className="flex h-full items-center justify-center text-xs text-[--ink-light]">
                    {t("No devotionals available yet.", "Todavía no hay devocionales disponibles.")}
                  </div>
                )}
              </div>
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
                  <p className="text-[--ink-light]">{t("Loading...", "Cargando...")}</p>
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
                              color: isActive ? "var(--background)" : "inherit",
                            }}
                          >
                            <span className="truncate text-[0.8rem] font-medium">{sermon.title}</span>
                            <span className={`mt-0.5 text-[0.65rem] ${isActive ? "opacity-70" : "text-[--ink-mid]"}`}>
                              {new Date(sermon.createdAt).toLocaleDateString(
                                language === "en" ? "en-US" : "es-MX",
                                { month: "short", day: "numeric", year: "numeric" }
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

      {/* 4. MUSIC & WORSHIP */}
      <section id="music" className={cn("space-y-6", !isMediaPage && "hidden")}>
        <div>
          <h2 className="text-2xl font-bold text-[--ink-dark]">
            {t("Music & Worship", "Música y Adoración")}
          </h2>
          <p className="text-[--ink-mid]">
            {t(
              "Listen to worship songs we love to sing together.",
              "Escucha canciones de adoración que nos encanta cantar juntos."
            )}
          </p>
        </div>

        {tracks.length === 0 ? (
          <div className="rounded-xl border border-[--border-color] bg-[--surface] p-6 text-center">
            <Music className="mx-auto mb-2 h-8 w-8 text-[--ink-mid]" />
            <p className="text-sm text-[--ink-light]">
              {t("No worship tracks available yet.", "Todavía no hay canciones de adoración disponibles.")}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tracks.map((track, index) => {
              const isThisPlaying = currentTrack?.id === track.id;
              return (
                <Card
                  key={track.id}
                  className="overflow-hidden border-[--border-color] bg-[--surface]"
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-[--surface-mid]"
                    onClick={() => {
                      playTrackList(tracks, index);
                      if (onStartMusic) onStartMusic();
                    }}
                  >
                    <div
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-white shadow-lg"
                      style={{ backgroundColor: "var(--sage)" }}
                      aria-hidden
                    >
                      {isThisPlaying && isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[--ink-dark]">
                        {track.title}
                      </p>
                      <p className="text-xs text-[--ink-light]">
                        {isThisPlaying
                          ? t("Now Playing", "Reproduciendo")
                          : track.artist || t("Worship", "Adoración")}
                      </p>
                    </div>
                  </button>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
