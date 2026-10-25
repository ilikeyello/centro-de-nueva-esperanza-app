import { useCallback, useEffect, useRef, useState } from "react";
import {
  Home,
  Megaphone,
  Play,
  Pause,
  SkipForward,
  MessageCircle,
  Minimize2,
  Maximize2,
  X,
  BookOpen,
  Music,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { usePlayer } from "../contexts/PlayerContext";
import { cn } from "@/lib/utils";
import { UGC_ENABLED } from "@/lib/featureFlags";


// <mux-player> web component is registered globally via the CDN script in index.html.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MuxPlayerEl = "mux-player" as any;

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  swipePageIndex?: number;   // index of current page in the swipe order (-1 if not in order)
  swipePageCount?: number;   // total number of swipeable pages
  /** The active page's scroll container — used for expand/collapse behavior. */
  scrollContainer?: HTMLElement | null;
}

export function Navigation({ currentPage, onNavigate, swipePageIndex = -1, swipePageCount = 5, scrollContainer }: NavigationProps) {
  const { t } = useLanguage();
  const {
    currentPlaybackId,
    currentTrackTitle,
    isPlaying,
    isMinimized,
    toggleMinimize,
    closePlayer,
    pauseTrack,
    resumeTrack,
    playNextInQueue,
  } = usePlayer();

  // Persistent <mux-player> audio engine (hidden). Lives at the nav root so it
  // stays mounted across page navigation and the music never stops.
  const audioRef = useRef<HTMLElement | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [playerActuallyPlaying, setPlayerActuallyPlaying] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const wasExpandedAtTouchRef = useRef(true);
  const forceExpandedRef = useRef(false);
  const justNavigatedRef = useRef(false);

  // ── Auto-hide nav: compact (icons only) vs expanded (icons + labels) ──────
  const [navExpanded, setNavExpanded] = useState(true);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMusicPlayerOpen = !!currentPlaybackId && !isMinimized;
  // The livestream no longer has a navbar mini-player (it lives on the
  // Media page's Live tab); only the music player keeps the bar expanded.
  const forceExpanded     = isMusicPlayerOpen;

  const scheduleCollapse = useCallback(() => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = setTimeout(() => {
      if (!forceExpanded) setNavExpanded(false);
    }, 3000);
  }, [forceExpanded]);

  const expandNav = useCallback(() => {
    setNavExpanded(true);
    scheduleCollapse();
  }, [scheduleCollapse]);

  const prevForceExpandedRef = useRef(false);
  useEffect(() => {
    if (forceExpanded) {
      setNavExpanded(true);
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
      prevForceExpandedRef.current = true;
    } else if (prevForceExpandedRef.current) {
      prevForceExpandedRef.current = false;
      scheduleCollapse();
    }
  }, [forceExpanded, scheduleCollapse]);

  useEffect(() => {
    scheduleCollapse();
    return () => { if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { forceExpandedRef.current = forceExpanded; }, [forceExpanded]);

  useEffect(() => {
    justNavigatedRef.current = true;
    const t = setTimeout(() => { justNavigatedRef.current = false; }, 400);
    return () => clearTimeout(t);
  }, [currentPage]);

  useEffect(() => {
    if (isDesktop) return;
    const target = scrollContainer ?? null;
    if (!target) return;
    let lastY = target.scrollTop;
    const onScroll = () => {
      const y = target.scrollTop;
      if (y < lastY - 4 && !justNavigatedRef.current) {
        expandNav();
      } else if (y > lastY + 8 && !forceExpandedRef.current) {
        if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
        setNavExpanded(false);
      }
      lastY = y;
    };
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [isDesktop, expandNav, scrollContainer]);

  const [desktopPlayerPosition, setDesktopPlayerPosition] = useState({ top: 160, right: 16 });
  const [dragState, setDragState] = useState<{
    startX: number;
    startY: number;
    startTop: number;
    startRight: number;
  } | null>(null);

  const handlePlayClick = () => resumeTrack();
  const handlePauseClick = () => pauseTrack();
  const handleNextClick = () => playNextInQueue();

  useEffect(() => {
    const target = scrollContainer ?? null;
    const getScrollY = () => target ? target.scrollTop : 0;
    const handleScroll = () => {
      setIsScrolled(getScrollY() > 20);
    };
    handleScroll();
    if (target) {
      target.addEventListener("scroll", handleScroll, { passive: true });
      return () => target.removeEventListener("scroll", handleScroll);
    }
  }, [scrollContainer]);

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

  // ── Mux audio engine: bind media events once ──────────────────────────────
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onEnded = () => playNextInQueue();
    const onPlaying = () => { setPlayerActuallyPlaying(true); setPlayerReady(true); };
    const onPause = () => setPlayerActuallyPlaying(false);
    const onLoaded = () => setPlayerReady(true);
    el.addEventListener("ended", onEnded);
    el.addEventListener("playing", onPlaying);
    el.addEventListener("pause", onPause);
    el.addEventListener("loadedmetadata", onLoaded);
    return () => {
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("playing", onPlaying);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [playNextInQueue]);

  // Load a new track when the playback id changes.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el = audioRef.current as any;
    if (!el) return;
    setPlayerReady(false);
    setPlayerActuallyPlaying(false);
    if (currentPlaybackId) {
      el.playbackId = currentPlaybackId;
      if (isPlaying) {
        Promise.resolve(el.play?.()).catch(() => {});
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlaybackId]);

  // Reflect play/pause intent onto the engine.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el = audioRef.current as any;
    if (!el || !currentPlaybackId) return;
    if (isPlaying) Promise.resolve(el.play?.()).catch(() => {});
    else el.pause?.();
  }, [isPlaying, currentPlaybackId]);

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
    // Bulletin (user-generated content) hidden while UGC is disabled. See featureFlags.ts.
    ...(UGC_ENABLED
      ? [{ id: "bulletin", icon: MessageCircle, labelEn: "Bulletin", labelEs: "Tablón" }]
      : []),
  ];

  const shouldScrollTitle = !!currentTrackTitle && currentTrackTitle.length > 24;

  const titleContent = currentTrackTitle ? (
    <div className="max-w-full text-[0.7rem] text-[--ink-mid] marquee-container">
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

  // Album-art placeholder shown in place of the old video frame for audio tracks.
  const albumArt = (
    <div className="relative h-full w-full gpu-layer flex items-center justify-center bg-[#262626]">
      {!playerActuallyPlaying && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#262626]">
          <div className="h-6 w-6 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
        </div>
      )}
      <div className="flex flex-col items-center gap-2 text-white/70">
        <Music className="h-10 w-10" />
        <span className="px-4 text-center text-xs text-white/60 line-clamp-2">{currentTrackTitle}</span>
      </div>
    </div>
  );

  const playerControlBtn = (onClick: () => void, label: string, icon: React.ReactNode, variant?: "close") => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border text-[--ink-mid] transition-colors",
        variant === "close"
          ? "border-[--border-color] bg-[--surface]/90 hover:border-[--terra] hover:text-[--terra]"
          : "border-[--border-color] bg-[--surface]/90 hover:border-[--ink-light] hover:text-[--ink-dark]"
      )}
      aria-label={label}
    >
      {icon}
    </button>
  );

  // ── Glass lens on the tab bar: press it and slide it across the icons ──
  // Same feel as the Media page tabs: lifts on press, follows the finger 1:1,
  // stretches with speed, springs onto the nearest icon on release. Taps on
  // icons still go through the buttons below; page swipes still drive the
  // lens from AppInner.
  const tabsRef = useRef<HTMLDivElement>(null);
  const lensDrag = useRef<{
    startX: number; startLeft: number; lastX: number; lastT: number; velocity: number;
    left: number; moved: boolean; pointerId: number; padH: number; tabW: number;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [lensHover, setLensHover] = useState<number | null>(null);
  const LENS_SPRING = "left 0.4s cubic-bezier(0.25, 1.35, 0.45, 1), width 0.3s ease, scale 0.4s cubic-bezier(0.25, 1.35, 0.45, 1)";

  const getLens = () => tabsRef.current?.querySelector<HTMLElement>("[data-swipe-pill]") ?? null;

  const onTabsPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isDesktop || !navExpanded || swipePageIndex < 0) return;
    const lens = getLens();
    const tabs = tabsRef.current;
    if (!lens || !tabs) return;
    const r = lens.getBoundingClientRect();
    // Only a press that starts on the lens picks it up; anywhere else is a tap.
    if (event.clientX < r.left || event.clientX > r.right) return;
    const padH = 12;
    const tabW = (tabs.offsetWidth - padH * 2) / navItems.length;
    lensDrag.current = {
      startX: event.clientX, startLeft: lens.offsetLeft, lastX: event.clientX, lastT: performance.now(),
      velocity: 0, left: lens.offsetLeft, moved: false, pointerId: event.pointerId, padH, tabW,
    };
    lens.style.transition = LENS_SPRING;
    lens.style.scale = "1.1";
  };

  const onTabsPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const g = lensDrag.current;
    const lens = getLens();
    if (!g || !lens) return;
    const dx = event.clientX - g.startX;
    if (!g.moved) {
      if (Math.abs(dx) < 5) return;
      g.moved = true;
      try { event.currentTarget.setPointerCapture(g.pointerId); } catch { /* ignore */ }
    }
    const now = performance.now();
    g.velocity = g.velocity * 0.7 + ((event.clientX - g.lastX) / Math.max(1, now - g.lastT)) * 0.3;
    g.lastX = event.clientX;
    g.lastT = now;
    const min = g.padH;
    const max = g.padH + g.tabW * (navItems.length - 1);
    let left = g.startLeft + dx;
    if (left < min) left = min + (left - min) * 0.3;
    if (left > max) left = max + (left - max) * 0.3;
    g.left = left;
    const stretch = Math.min(Math.abs(g.velocity) * 0.18, 0.28);
    lens.style.transition = "none";
    lens.style.left = `${left}px`;
    lens.style.scale = `${1.1 + stretch} ${1.1 - stretch * 0.35}`;
    const over = Math.max(0, Math.min(navItems.length - 1, Math.round((left - g.padH) / g.tabW)));
    setLensHover((cur) => (cur === over ? cur : over));
  };

  const onTabsPointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const g = lensDrag.current;
    lensDrag.current = null;
    setLensHover(null);
    const lens = getLens();
    if (!g || !lens) return;
    try { event.currentTarget.releasePointerCapture(g.pointerId); } catch { /* ignore */ }
    if (!g.moved) {
      // Just a press on the current tab: settle back down.
      lens.style.transition = LENS_SPRING;
      lens.style.scale = "1";
      return;
    }
    const projected = g.left + g.velocity * 80;
    const target = Math.max(0, Math.min(navItems.length - 1, Math.round((projected - g.padH) / g.tabW)));
    lens.style.transition = LENS_SPRING;
    lens.style.left = `${g.padH + target * g.tabW}px`;
    lens.style.width = `${g.tabW}px`;
    lens.style.scale = "1";
    // Tell AppInner the lens is already on its way (don't restart it from the old tab).
    lens.dataset.dragged = "1";
    // The pointer-up would also "click" whatever icon is under the finger.
    suppressClickRef.current = true;
    window.setTimeout(() => { suppressClickRef.current = false; }, 50);
    const item = navItems[target];
    if (item && item.id !== currentPage) onNavigate(item.id);
    else window.setTimeout(() => { delete lens.dataset.dragged; }, 600);
  };

  return (
    <nav
      onTouchStart={!isDesktop ? () => {
        wasExpandedAtTouchRef.current = navExpanded;
        expandNav();
      } : undefined}
      style={{
        ...(!isDesktop ? {
          bottom: "max(calc(env(safe-area-inset-bottom) + 8px), 12px)",
          left: '50%',
          right: 'auto',
          transform: 'translateX(-50%) translateZ(0)',
          // Collapsed width scales with the icon count (~46px each) so the mini bar
          // is no longer than it needs to be. Expands to near-full width when open.
          width: navExpanded ? 'calc(100% - 24px)' : `${navItems.length * 46}px`,
          // Gentler overshoot (1.56 -> 1.25) so the mini bar still bounces but doesn't
          // briefly shrink past its target and let the last icon poke outside.
          transition: 'width 0.4s cubic-bezier(0.34, 1.25, 0.64, 1), background-color 0.3s ease, border-color 0.3s ease',
        } : {
          paddingTop: 'env(safe-area-inset-top)',
        }),
        // Glass tint and edge come from .liquid-glass (index.css). Only the
        // desktop home-hero state needs an inline override to go clear.
        ...(isTransparent && isDesktop ? { backgroundColor: "transparent", borderColor: "transparent" } : {}),
      }}
      className={cn(
        "fixed bottom-0 z-50",
        "rounded-[2rem] border",
        !(isTransparent && isDesktop) && "liquid-glass",
        // Mini (icons-only) bar: extra see-through so it stays out of the way.
        !isDesktop && !navExpanded && "nav-mini",
        "md:left-0 md:right-0 md:mx-0 md:rounded-none md:bottom-auto md:top-0 md:w-full md:transition-all md:duration-300",
        isTransparent
          ? "md:border-t-0 md:border-x-0 md:border-b-transparent md:shadow-none"
          : "md:border-t-0 md:border-x-0 md:border-b md:shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
      )}
    >
      <div
        className={cn("container mx-auto py-0")}
        style={!isDesktop && !navExpanded ? { paddingLeft: 0, paddingRight: 0 } : undefined}
      >
        <div className="flex w-full flex-col gap-1 md:flex-col-reverse">

          {/* ===== MOBILE MUSIC PLAYER (above nav tabs) ===== */}
          {currentPlaybackId && !isDesktop && (
            <div className={cn(
              "music-player-dark px-3 md:hidden",
              (navExpanded || !isMinimized) && "pt-1.5"
            )}>
              {(navExpanded || !isMinimized) && (isMinimized ? (
                <div className="flex w-full items-center justify-between rounded-2xl bg-[--surface] px-3 py-1.5 shadow-md">
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
                <div className="flex items-center justify-between rounded-t-2xl bg-[--surface] px-3 py-1.5 shadow-inner">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[--ink-light]">
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
                    {playerControlBtn(closePlayer, t("Close", "Cerrar"), <X className="h-4 w-4" />, "close")}
                  </div>
                </div>
              ))}
              {/* Album art frame — clipped to 0 when minimized. */}
              <div
                className={cn(
                  "relative w-full overflow-hidden transition-all gpu-layer",
                  isMinimized
                    ? "h-0 border-0"
                    : "h-40 rounded-b-2xl border-x border-b border-[--border-color]"
                )}
                style={{ backgroundColor: isMinimized ? undefined : "#262626" }}
              >
                <div className="relative h-40 w-full gpu-layer">
                  {!playerReady && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#262626]">
                      <div className="h-6 w-6 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                    </div>
                  )}
                  {albumArt}
                </div>
              </div>
            </div>
          )}

          {/* ===== DESKTOP MINIMIZED BAR (integrated in navbar) ===== */}
          {currentPlaybackId && isDesktop && isMinimized && (
            <div className="music-player-dark hidden md:block px-3 py-1">
              <div className="flex items-center justify-center gap-3 rounded-xl bg-[--surface] px-4 py-1.5 shadow-sm">
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
                  {playerControlBtn(closePlayer, t("Close", "Cerrar"), <X className="h-3.5 w-3.5" />, "close")}
                </div>
              </div>
            </div>
          )}

          {/* ===== NAV TABS ===== */}
          <div
            id="mobile-nav-tabs"
            ref={tabsRef}
            onPointerDown={onTabsPointerDown}
            onPointerMove={onTabsPointerMove}
            onPointerUp={onTabsPointerEnd}
            onPointerCancel={onTabsPointerEnd}
            className="relative flex w-full items-center justify-between md:justify-center md:gap-2 md:py-2"
            style={{
              padding: isDesktop ? undefined : navExpanded ? '8px 12px' : '5px 4px',
              transition: 'padding 0.25s ease',
            }}
          >
            {!isDesktop && swipePageIndex >= 0 && (() => {
              const padH = navExpanded ? 12 : 4;
              return (
                <div
                  data-swipe-pill
                  className="glass-tabs-lens nav-lens pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    // Divide by the actual number of nav buttons so the pill stays aligned
                    // even when tap-only items (e.g. Give) are present beyond the swipe pages.
                    width: `calc((100% - ${padH * 2}px) / ${navItems.length})`,
                    left: `calc(${padH}px + ${swipePageIndex} * (100% - ${padH * 2}px) / ${navItems.length})`,
                    height: 'calc(100% - 8px)',
                    transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.25s ease',
                  }}
                />
              );
            })()}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = lensHover != null ? navItems[lensHover]?.id === item.id : currentPage === item.id;
              const compact = !isDesktop && !navExpanded;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (suppressClickRef.current) return;
                    if (!isDesktop && !wasExpandedAtTouchRef.current) {
                      wasExpandedAtTouchRef.current = true;
                      return;
                    }
                    onNavigate(item.id);
                  }}
                  className={cn(
                    "flex min-w-0 flex-1 items-center justify-center transition-all duration-250 nav-button",
                    "md:flex-initial md:rounded-lg md:text-sm"
                  )}
                >
                  <div
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-xl transition-all duration-250",
                      "md:flex-row md:gap-2 md:px-4 md:py-2",
                      isActive
                        ? cn("text-sage", "md:bg-sage/15")
                        : cn("text-[--ink-dark] md:text-ink-mid", "md:hover:text-sage md:hover:bg-sage-light"),
                      isTransparent && isActive && "md:text-white md:bg-white/20",
                      isTransparent && !isActive && "md:text-white/80"
                    )}
                    style={{
                      padding: isDesktop ? undefined : compact ? '5px 7px' : '6px 12px',
                      gap: isDesktop ? undefined : compact ? '0px' : '4px',
                      transition: 'padding 0.25s ease, gap 0.25s ease',
                    }}
                  >
                    <div className="relative">
                      <Icon strokeWidth={isActive ? 2.3 : 2} className={cn("flex-shrink-0 transition-all duration-250", compact ? "h-[18px] w-[18px]" : "h-[22px] w-[22px]")} />
                      {item.id === 'media' && compact && (
                        !!currentPlaybackId && isMinimized
                      ) && (
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_4px_rgba(239,68,68,0.9)]" />
                      )}
                    </div>
                    <span
                      className="nav-label text-xs font-medium whitespace-nowrap overflow-hidden transition-all duration-250"
                      style={{
                        maxHeight: compact ? '0px' : '20px',
                        maxWidth: compact ? '0px' : '80px',
                        opacity: compact ? 0 : 1,
                      }}
                    >
                      {t(item.labelEn, item.labelEs)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP FLOATING PLAYER ===== */}
      {currentPlaybackId && isDesktop && (
        <div
          className={cn(
            "music-player-dark fixed z-[60] w-80 transition-all duration-200",
            isMinimized && "pointer-events-none invisible"
          )}
          style={{ top: desktopPlayerPosition.top, right: desktopPlayerPosition.right }}
        >
          <div className="overflow-hidden rounded-xl border border-[--border-color] bg-[--surface] shadow-xl" style={{ backgroundColor: "#262626" }}>
            <div
              className="flex cursor-move items-center justify-between gap-3 px-3 pt-2"
              onMouseDown={handleDesktopPlayerMouseDown}
            >
              <div className="min-w-0 flex-1">
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[--ink-light]">
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
                {playerControlBtn(closePlayer, t("Close", "Cerrar"), <X className="h-3.5 w-3.5" />, "close")}
              </div>
            </div>
            <div className="mt-2 aspect-video w-full overflow-hidden relative gpu-layer">
              {albumArt}
            </div>
          </div>
        </div>
      )}

      {/* ===== PERSISTENT HIDDEN MUX AUDIO ENGINE — never unmounts, so audio keeps playing ===== */}
      <MuxPlayerEl
        ref={audioRef}
        audio=""
        stream-type="on-demand"
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
        aria-hidden="true"
      />
    </nav>
  );
}
