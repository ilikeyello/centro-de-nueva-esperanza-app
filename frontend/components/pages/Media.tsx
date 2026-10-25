import { Card } from "@/components/ui/card";
import { useLanguage } from "../../contexts/LanguageContext";
import { Calendar, ChevronDown, ChevronUp, Clapperboard, Music, Pause, Play, Radio, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayer } from "../../contexts/PlayerContext";
import { useBackend } from "../../hooks/useBackend";
import { cn } from "@/lib/utils";
import { MuxPlayer } from "../MuxPlayer";
import { muxPoster } from "../../lib/mux";
import { Capacitor } from "@capacitor/core";
import { GlassTabs } from "../GlassTabs";
import { Bible } from "./Bible";

type MediaTab = "live" | "sermons" | "music";

interface SermonItem {
  id: number;
  title: string;
  muxPlaybackId: string | null;
  createdAt: string;
  description?: string;
  /** 'livestream' = auto-saved broadcast recording, 'upload' = admin devotional. */
  source?: "upload" | "livestream" | null;
  sermonDate?: string | null;
}

interface MediaProps {
  onStartMusic?: () => void;
  isMediaPage?: boolean;
}

export function Media({ onStartMusic, isMediaPage = true }: MediaProps) {
  const { language, t } = useLanguage();
  const backend = useBackend();
  const [tab, setTab] = useState<MediaTab>("live");
  const rootRef = useRef<HTMLDivElement>(null);
  const sermonsRef = useRef<HTMLElement>(null);
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
          source: s.source ?? null,
          sermonDate: s.sermonDate ?? null,
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

  // Sermons come from two places; the subheading tells them apart at a glance.
  const sourceLabel = (source?: string | null) =>
    source === "livestream"
      ? t("Livestream", "Transmisión en Vivo")
      : t("Devotional", "Devocional");

  /** A 'YYYY-MM-DD' sermon_date parses as UTC and can shift a day back, so build it locally. */
  const sermonDate = (sermon: SermonItem) => {
    const raw = sermon.sermonDate ?? sermon.createdAt;
    const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    return ymd ? new Date(+ymd[1], +ymd[2] - 1, +ymd[3]) : new Date(raw);
  };

  const formatSermonDate = (sermon: SermonItem) =>
    sermonDate(sermon).toLocaleDateString(language === "en" ? "en-US" : "es-MX", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

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
  // The floating livestream mini-player (above the navbar) is retired: the
  // livestream lives on the Live tab. Off the Media page the box stays
  // mounted but hidden, and anything playing is paused (see below).
  const showLivestreamPip = false;
  void shouldShowLivestreamPip;
  const renderLivePlayer = showLivePlayer && (isMediaPage || !isWebDesktop);

  const mediaTabs = [
    { id: "live", label: t("Live", "En Vivo"), icon: Radio },
    { id: "sermons", label: t("Sermons", "Sermones"), icon: Clapperboard },
    { id: "music", label: t("Music", "Música"), icon: Music },
  ];

  /** Switch tabs: pause any video left behind, and start the new tab at the top. */
  const selectTab = (next: string) => {
    const nextTab = next as MediaTab;
    if (nextTab === tab) return;
    const root = rootRef.current;
    root?.querySelectorAll("mux-player").forEach((el) => {
      const staysVisible =
        el.closest(`[data-media-panel="${nextTab}"]`) || (nextTab === "live" && el.closest("[data-live-box]"));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!staysVisible) (el as any).pause?.();
    });
    setTab(nextTab);
    let scroller: HTMLElement | null = root?.parentElement ?? null;
    while (scroller) {
      const oy = getComputedStyle(scroller).overflowY;
      if (oy === "auto" || oy === "scroll") break;
      scroller = scroller.parentElement;
    }
    if (scroller) scroller.scrollTop = 0;
  };

  // Where the pinned video should sit: right under the status bar. Browsers
  // disagree on whether a sticky offset counts the scroll area's top padding
  // (the status-bar inset), so start with the platform's usual answer and,
  // the first time the video actually pins, measure and correct it.
  const [stickyTop, setStickyTop] = useState<string | number>(
    Capacitor.getPlatform() === "android" ? "env(safe-area-inset-top)" : 0
  );
  const calibratedRef = useRef(false);
  useEffect(() => {
    if (!isMediaPage || isWebDesktop || tab === "music") return;
    const root = rootRef.current;
    const box = root?.querySelector<HTMLElement>(
      tab === "live" ? "[data-live-box]" : '[data-media-panel="sermons"] [data-sticky-player]'
    );
    let scroller: HTMLElement | null = root?.parentElement ?? null;
    while (scroller) {
      const oy = getComputedStyle(scroller).overflowY;
      if (oy === "auto" || oy === "scroll") break;
      scroller = scroller.parentElement;
    }
    if (!box || !scroller) return;
    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;top:0;height:env(safe-area-inset-top);visibility:hidden;pointer-events:none";
    document.body.appendChild(probe);
    const safeTop = probe.getBoundingClientRect().height;
    probe.remove();
    const onScroll = () => {
      if (calibratedRef.current || scroller!.scrollTop < 400) return;
      const actual = box.getBoundingClientRect().top;
      const current = typeof stickyTop === "number" ? stickyTop : safeTop;
      calibratedRef.current = true;
      if (Math.abs(actual - safeTop) > 2) setStickyTop(Math.max(0, current + (safeTop - actual)));
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller!.removeEventListener("scroll", onScroll);
  }, [isMediaPage, isWebDesktop, tab, stickyTop]);

  // Leaving the Media page: pause the livestream and any sermon video so
  // nothing keeps playing out of sight. (Music has its own player and keeps going.)
  useEffect(() => {
    if (isMediaPage) return;
    rootRef.current?.querySelectorAll("mux-player").forEach((el) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (el as any).pause?.();
    });
  }, [isMediaPage]);

  // Other pages can ask for a tab (Home's "View Media" / "Live Now" -> Live).
  useEffect(() => {
    const onSetTab = (event: Event) => {
      const detail = (event as CustomEvent<MediaTab>).detail;
      if (detail === "live" || detail === "sermons" || detail === "music") setTab(detail);
    };
    window.addEventListener("cne-media-tab", onSetTab);
    return () => window.removeEventListener("cne-media-tab", onSetTab);
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn(
        isMediaPage ? "relative mx-auto pb-8 md:container md:px-4" : "fixed inset-0 pointer-events-none z-[60]",
        // Clear the fixed desktop navbar (web big screens only).
        isMediaPage && isWebDesktop && "pt-20"
      )}
    >
      {/* Frosted strip behind the status bar on the tabs with a pinned video
          (Live, Sermons), so content scrolling up past the video never shows
          through behind the clock. The Music tab has nothing pinned. */}
      {isMediaPage && !isWebDesktop && tab !== "music" && (
        <div
          aria-hidden="true"
          className="media-statusbar-cover pointer-events-none fixed inset-x-0 top-0 z-40"
          style={{ height: "env(safe-area-inset-top)" }}
        />
      )}

      {/* Tab selector — scrolls away with the page. */}
        {isMediaPage && (
          <div className="px-4 pb-3 pt-1">
            <GlassTabs tabs={mediaTabs} value={tab} onChange={selectTab} />
          </div>
        )}

        {/* 1. PERSISTENT LIVESTREAM BOX (doubles as floating PIP off the Media page) */}
        <div
          data-live-box
          className={cn(
            "transform",
            (isMediaPage || showLivestreamPip) && "transition-all duration-300",
            isMediaPage
              ? cn(
                  // Full width on phones; a framed player on big screens.
                  "relative aspect-video w-full overflow-hidden bg-black md:rounded-2xl md:border md:border-[--border-color] md:shadow-xl",
                  tab !== "live" && "hidden"
                )
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
          style={isMediaPage ? {
          // The video scrolls up with the tab selector, then stays pinned at
          // the top while the Bible below keeps scrolling.
          position: "sticky",
          // The scroll area already has the status-bar inset as top padding,
          // and Safari/WKWebView measures sticky offsets from inside that
          // padding — so iOS pins at 0 (right under the status bar). Android's
          // WebView measures from the outer edge, so it needs the inset.
          top: isWebDesktop ? "5rem" : stickyTop,
          zIndex: 30,
        } : {
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

      {isMediaPage && (
        <>
          {/* LIVE — title under the stream, then a mini Bible to follow along */}
          <div data-media-panel="live" className={cn(tab !== "live" && "hidden")}>
            <div className="px-4 pb-2 pt-4 md:px-0">
              <h1 className="text-2xl font-bold text-[--ink-dark]">
                {livestreamTitle || t("CNE Livestream", "Transmisión CNE")}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-[--ink-mid]">
                {showLivePlayer ? (
                  <>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    {t("Live now", "En vivo ahora")}
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 text-[--sage]" />
                    {t("Live Sundays at 3:30 PM", "En vivo los domingos a las 3:30 PM")}
                  </>
                )}
              </p>
            </div>
            <Bible compact />
          </div>

          {/* SERMONS — the player pins to the top like the livestream; past
              sermons below as YouTube-style cards (thumbnail, title, date). */}
          <section
            ref={sermonsRef}
            data-media-panel="sermons"
            className={cn("pb-28 md:pb-20", tab !== "sermons" && "hidden")}
          >
            <div
              data-sticky-player
              className="relative aspect-video w-full overflow-hidden bg-black md:rounded-2xl md:border md:border-[--border-color] md:shadow-xl"
              style={{ position: "sticky", top: isWebDesktop ? "5rem" : stickyTop, zIndex: 30 }}
            >
              {loadingSermons && (
                <div className="flex h-full items-center justify-center text-xs text-white/70">
                  {t("Loading sermons...", "Cargando sermones...")}
                </div>
              )}
              {!loadingSermons && selectedSermon?.muxPlaybackId && (
                <MuxPlayer
                  key={selectedSermon.muxPlaybackId}
                  playbackId={selectedSermon.muxPlaybackId}
                  streamType="on-demand"
                  title={selectedSermon.title}
                  poster={muxPoster(selectedSermon.muxPlaybackId, { width: 1280 })}
                  className="absolute inset-0 h-full w-full"
                />
              )}
              {!loadingSermons && !selectedSermon && (
                <div className="flex h-full items-center justify-center text-xs text-white/70">
                  {t("No sermons available yet.", "Todavía no hay sermones disponibles.")}
                </div>
              )}
            </div>

            {/* Now playing */}
            {!loadingSermons && selectedSermon && (
              <div className="px-4 pt-4 md:px-0">
                <h1 className="text-xl font-bold leading-snug text-[--ink-dark]">{selectedSermon.title}</h1>
                <p className="mt-1 text-sm text-[--ink-mid]">
                  <span className="font-semibold text-[--sage]">{sourceLabel(selectedSermon.source)}</span>
                  <span className="mx-1.5 text-[--ink-light]">·</span>
                  {formatSermonDate(selectedSermon)}
                </p>
                {selectedSermon.description && (
                  <p className="mt-3 text-sm leading-relaxed text-[--ink-mid]">{selectedSermon.description}</p>
                )}
              </div>
            )}

            {/* All sermons */}
            {!loadingSermons && sermons.length > 0 && (
              <div className="px-4 pt-6 md:px-0">
                <h2 className="mb-3 text-lg font-bold text-[--ink-dark]">{t("All Sermons", "Todos los Sermones")}</h2>
                <div className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                  {sermons.map((sermon) => {
                    const isActive = selectedSermon?.id === sermon.id;
                    return (
                      <button
                        key={sermon.id}
                        type="button"
                        onClick={() => {
                          setSelectedSermonId(sermon.id);
                          // Bring the player + "now playing" details back into view.
                          const section = sermonsRef.current;
                          let scroller: HTMLElement | null = section?.parentElement ?? null;
                          while (scroller) {
                            const oy = getComputedStyle(scroller).overflowY;
                            if (oy === "auto" || oy === "scroll") break;
                            scroller = scroller.parentElement;
                          }
                          if (section && scroller) {
                            const top =
                              section.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
                            scroller.scrollTo({ top: Math.max(0, top - 4), behavior: "smooth" });
                          }
                        }}
                        className="sermon-card group block w-full text-left [-webkit-tap-highlight-color:transparent]"
                      >
                        <div
                          className={cn(
                            "relative aspect-video w-full overflow-hidden rounded-xl bg-[--surface-mid]",
                            isActive && "ring-2 ring-[--sage] ring-offset-2 ring-offset-[--background]"
                          )}
                        >
                          {sermon.muxPlaybackId ? (
                            <img
                              src={muxPoster(sermon.muxPlaybackId, { width: 640 })}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-300 group-active:scale-[0.98]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Clapperboard className="h-8 w-8 text-[--ink-light]" />
                            </div>
                          )}
                          {isActive ? (
                            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-semibold text-white">
                              <Play className="h-3 w-3 fill-current" />
                              {t("Now playing", "Reproduciendo")}
                            </span>
                          ) : (
                            <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white">
                                <Play className="h-5 w-5 fill-current" />
                              </span>
                            </span>
                          )}
                        </div>
                        <p className="mt-2 line-clamp-2 text-[0.95rem] font-semibold leading-snug text-[--ink-dark]">
                          {sermon.title}
                        </p>
                        <p className="mt-0.5 text-xs text-[--ink-mid]">
                          <span className="font-semibold text-[--sage]">{sourceLabel(sermon.source)}</span>
                          <span className="mx-1 text-[--ink-light]">·</span>
                          {formatSermonDate(sermon)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* MUSIC & WORSHIP */}
          <section id="music" data-media-panel="music" className={cn("space-y-6 px-4 pb-24 pt-4 md:px-0", tab !== "music" && "hidden")}>
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
          <div className="glass-card rounded-xl border border-[--border-color] bg-[--surface] p-6 text-center">
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
        </>
      )}
    </div>
  );
}
