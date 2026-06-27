import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Navigation } from "./Navigation";
import { Home } from "./pages/Home";
import { News } from "./pages/News";
import { BulletinBoard } from "./pages/BulletinBoard";
import { Donations } from "./pages/Donations";
import { Media } from "./pages/Media";
import { Games } from "./pages/Games";
import { TriviaGamePage } from "./pages/TriviaGamePage";
import { WordSearchGamePage } from "./pages/WordSearchGamePage";
import { GraveyardShiftGamePage } from "./pages/GraveyardShiftGamePage";
import { Contact } from "./pages/Contact";
import { NewHere } from "./pages/NewHere";
import { AdminUpload } from "./pages/AdminUpload";
import { Bible } from "./pages/Bible";
import { NotificationSettings } from "./notifications/NotificationSettings";
import { PushNotificationPrompt } from "./PushNotificationPrompt";
import { InstallPrompt } from "./InstallPrompt";
import { useNotificationChecker } from "../hooks/useNotificationChecker";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "../contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { UGC_ENABLED } from "@/lib/featureFlags";


// ── Types ────────────────────────────────────────────────────────────────────

type Page =
  | "home"
  | "bible"
  | "media"
  | "bulletin"
  | "news"
  | "donations"
  | "contact"
  | "games"
  | "triviaGame"
  | "wordSearchGame"
  | "graveyardShiftGame"
  | "newHere"
  | "adminUpload"
  | "notifications";

/** Pages in the horizontal pager, in order. */
// "bulletin" (user-generated content) is excluded while UGC is disabled. See featureFlags.ts.
const SWIPE_PAGES: Page[] = (["home", "bible", "media", "news", "bulletin"] as Page[])
  .filter((p) => UGC_ENABLED || p !== "bulletin");

/** Index of the Media page — its wrapper holds the always-mounted livestream PIP iframe. */
const MEDIA_INDEX = SWIPE_PAGES.indexOf("media");

/**
 * Whether the media wrapper should ride the swipe transform for a drag frame.
 * The wrapper holds the always-mounted livestream PIP iframe. Transforming it
 * makes any YouTube iframe inside blank to grey on iOS, so we only transform it
 * when the Media page is the current page OR is the page being dragged toward.
 * For inter-page swipes that don't touch Media, the fixed PIP then stays put.
 */
function mediaNeedsTransformForDrag(idx: number, dx: number) {
  return (
    idx === MEDIA_INDEX ||
    (idx === MEDIA_INDEX - 1 && dx < 0) ||
    (idx === MEDIA_INDEX + 1 && dx > 0)
  );
}

/** Pages that render as an overlay on top of the pager. */
type OverlayPage =
  | "donations"
  | "contact"
  | "games"
  | "triviaGame"
  | "wordSearchGame"
  | "graveyardShiftGame"
  | "newHere"
  | "adminUpload"
  | "notifications";


// ── Imperative nav-pill helpers ───────────────────────────────────────────────
// All pill mutations bypass React state so they run on every touchmove frame
// without triggering re-renders.

function getPillElements() {
  const navTabs = document.getElementById("mobile-nav-tabs");
  const pill    = document.querySelector("[data-swipe-pill]") as HTMLElement | null;
  return { navTabs, pill };
}

function getPillMetrics(navTabs: HTMLElement) {
  const navW = navTabs.offsetWidth;
  // Mirrors Navigation.tsx: expanded → padding 8px 12px, compact → 5px 4px
  const padH = navW > 280 ? 12 : 4;
  const tabW = (navW - padH * 2) / SWIPE_PAGES.length;
  return { padH, tabW };
}

/**
 * Animate pill to a specific tab.
 * Always resets width so any stretch collapses to normal.
 * Does NOT clear styles afterwards — React's re-render overwrites them naturally.
 */
function setPillToIndex(targetIdx: number, transition = "") {
  const { navTabs, pill } = getPillElements();
  if (!navTabs || !pill) return;
  const { padH, tabW } = getPillMetrics(navTabs);
  pill.style.transition = transition || "none";
  pill.style.left  = `${padH + targetIdx * tabW}px`;
  pill.style.width = `${tabW}px`;
}

/**
 * Drag the pill with a leading-edge / trailing-edge stretch:
 *
 *  Swiping LEFT  (dx < 0, going to higher-index tab):
 *    • Right edge races ahead (2× speed), left edge lags (1× speed).
 *    • Pill stretches rightward toward the destination.
 *
 *  Swiping RIGHT (dx > 0, going to lower-index tab):
 *    • Left edge races ahead, right edge lags.
 *    • Pill stretches leftward toward the destination.
 *
 *  t = 0   → pill on current tab, normal width.
 *  t = 0.5 → maximum stretch (~1.5× width).
 *  t = 1   → pill arrived at destination, normal width.
 */
function setPillDrag(currentIdx: number, dx: number) {
  const { navTabs, pill } = getPillElements();
  if (!navTabs || !pill || dx === 0) return;
  const { padH, tabW } = getPillMetrics(navTabs);

  const W      = window.innerWidth;
  const t      = Math.abs(dx) / W;
  const leadT  = Math.min(t * 2, 1);   // leading edge: 2× speed, capped at 1
  const trailT = Math.min(t,     1);   // trailing edge: normal speed

  const normalLeft = padH + currentIdx * tabW;
  pill.style.transition = "none";

  if (dx < 0) {
    // Swiping LEFT → going to HIGHER index → pill stretches RIGHT
    pill.style.left  = `${normalLeft + trailT * tabW}px`;
    pill.style.width = `${tabW + (leadT - trailT) * tabW}px`;
  } else {
    // Swiping RIGHT → going to LOWER index → pill stretches LEFT
    pill.style.left  = `${normalLeft - leadT * tabW}px`;
    pill.style.width = `${tabW + (leadT - trailT) * tabW}px`;
  }
}

/**
 * Only clear the CSS transition property.
 * We intentionally leave left/width set — React's next re-render overwrites
 * those with the correct CSS calc values, so clearing them here would race
 * with React and briefly show no left/width (pill disappears).
 */
function clearPillTransition() {
  const { pill } = getPillElements();
  if (pill) pill.style.transition = "";
}

/** Spring the pill back to the current tab with a bouncy easing. */
function snapPillBack(currentIdx: number) {
  const { navTabs, pill } = getPillElements();
  if (!navTabs || !pill) return;
  const { padH, tabW } = getPillMetrics(navTabs);
  const spring = "0.4s cubic-bezier(0.34,1.56,0.64,1)";
  pill.style.transition = `left ${spring}, width ${spring}`;
  pill.style.left  = `${padH + currentIdx * tabW}px`;
  pill.style.width = `${tabW}px`;
  setTimeout(clearPillTransition, 420);
}


// ── Component ────────────────────────────────────────────────────────────────

export function AppInner() {
  // ── State ─────────────────────────────────────────────────────────────────
  /** Index into SWIPE_PAGES for the currently visible swipe page. */
  const [swipeIndex, setSwipeIndex] = useState(0);
  /** When non-null, a full-screen overlay page is shown above the pager. */
  const [overlayPage, setOverlayPage] = useState<OverlayPage | null>(null);
  /** Tracks which swipe page's Media content is rendered full-screen.
   *  Allows deferring unmounting/hiding the Media page until the transition finishes. */
  const [renderedSwipeIndex, setRenderedSwipeIndex] = useState(0);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const rootRef         = useRef<HTMLDivElement>(null);
  const viewportRef     = useRef<HTMLDivElement>(null);
  const trackRef        = useRef<HTMLDivElement>(null);
  const pageRefs        = useRef<(HTMLDivElement | null)[]>([]);
  const mediaWrapperRef = useRef<HTMLDivElement>(null);

  /** When true, the swipe touch handler is animating the track — prevents the
   *  layout effect from also animating (which would conflict). */
  const swipeAnimatingRef = useRef(false);

  // Refs so handleNavigate has a stable identity (no deps on mutable values).
  const swipeIndexRef = useRef(swipeIndex);
  swipeIndexRef.current = swipeIndex;

  const renderedSwipeIndexRef = useRef(renderedSwipeIndex);
  renderedSwipeIndexRef.current = renderedSwipeIndex;

  const prevSwipeIndexRef = useRef(0);
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Navigate ──────────────────────────────────────────────────────────────
  // Stable callback — safe to capture in mount-only effects.
  const handleNavigate = useCallback((page: string) => {
    const idx = SWIPE_PAGES.indexOf(page as Page);
    if (idx >= 0) {
      setSwipeIndex(idx);
      setOverlayPage(null);

      // Manage renderedSwipeIndex for smooth Media page transitions
      if (navTimeoutRef.current) {
        clearTimeout(navTimeoutRef.current);
        navTimeoutRef.current = null;
      }

      if (idx === 2) {
        setRenderedSwipeIndex(2);
      } else if (swipeIndexRef.current === 2) {
        // Defer unmounting/hiding full-screen Media until navigation transition completes (380ms)
        navTimeoutRef.current = setTimeout(() => {
          setRenderedSwipeIndex(idx);
          navTimeoutRef.current = null;
        }, 400);
      } else {
        setRenderedSwipeIndex(idx);
      }
    } else {
      setOverlayPage(page as OverlayPage);
    }
  // Only stable useState setters and refs are used — no external deps.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Track positioning on programmatic navigation (nav button taps) ────────
  useLayoutEffect(() => {
    const track    = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    if (swipeAnimatingRef.current) {
      // Swipe touch handler is driving the animation — don't interfere.
      swipeAnimatingRef.current = false;
      prevSwipeIndexRef.current = swipeIndex;
      return;
    }

    // Programmatic navigation (nav button tap or deep link) — animate to target.
    const pageWidth = viewport.offsetWidth;
    const targetX   = -swipeIndex * pageWidth;
    const easing    = "cubic-bezier(0.32, 0.72, 0, 1)";
    track.style.transition = `transform 380ms ${easing}`;
    track.style.transform  = `translateX(${targetX}px)`;

    // Animate media wrapper position during programmatic transitions — only when
    // Media is involved (current or previous page). Otherwise leave the wrapper
    // at rest so the fixed livestream PIP iframe doesn't ride a transform and blank.
    if (mediaWrapperRef.current) {
      if (swipeIndex === MEDIA_INDEX || prevSwipeIndexRef.current === MEDIA_INDEX) {
        const startMediaX  = (MEDIA_INDEX - prevSwipeIndexRef.current) * pageWidth;
        const targetMediaX = (MEDIA_INDEX - swipeIndex) * pageWidth;

        // Set starting position without transition to prevent jump
        mediaWrapperRef.current.style.transition = "none";
        mediaWrapperRef.current.style.transform  = `translateX(${startMediaX}px)`;

        // Force layout reflow
        void mediaWrapperRef.current.offsetWidth;

        // Animate to target
        mediaWrapperRef.current.style.transition = `transform 380ms ${easing}`;
        mediaWrapperRef.current.style.transform  = `translateX(${targetMediaX}px)`;
      } else {
        mediaWrapperRef.current.style.transition = "none";
        mediaWrapperRef.current.style.transform  = "";
      }
    }

    // Animate pill for nav taps
    setPillToIndex(swipeIndex, `left 380ms ${easing}, width 380ms ${easing}`);

    const cleanup = () => {
      if (trackRef.current) trackRef.current.style.transition = "";
      if (mediaWrapperRef.current) {
        mediaWrapperRef.current.style.transition = "";
        mediaWrapperRef.current.style.transform  = "";
      }
      clearPillTransition();
    };
    track.addEventListener("transitionend", cleanup, { once: true });
    // Fallback in case transitionend doesn't fire (e.g. transition cancelled)
    const fallback = setTimeout(cleanup, 420);

    prevSwipeIndexRef.current = swipeIndex;

    return () => {
      clearTimeout(fallback);
      track.removeEventListener("transitionend", cleanup);
    };
  }, [swipeIndex]);

  // ── Resize handling ───────────────────────────────────────────────────────
  // Snap the track to the correct offset when the window resizes (rotation, etc.).
  useEffect(() => {
    const handleResize = () => {
      const track    = trackRef.current;
      const viewport = viewportRef.current;
      if (!track || !viewport) return;
      
      const pw = viewport.offsetWidth;
      track.style.transition = "none";
      track.style.transform  = `translateX(${-swipeIndexRef.current * pw}px)`;

      if (mediaWrapperRef.current) {
        mediaWrapperRef.current.style.transition = "none";
        if (renderedSwipeIndexRef.current === 2) {
          mediaWrapperRef.current.style.transform  = `translateX(${(2 - swipeIndexRef.current) * pw}px)`;
        } else {
          mediaWrapperRef.current.style.transform  = "";
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Touch handlers (Instagram-style pager) ────────────────────────────────
  useEffect(() => {
    const viewport = viewportRef.current;
    const track    = trackRef.current;
    const mediaWrapper = mediaWrapperRef.current;
    if (!viewport || !track) return;

    // Local state that persists across the gesture (no React re-renders).
    let active   = false;
    let startX   = 0;
    let startY   = 0;
    let dirLocked: "h" | "v" | null = null;
    let dx       = 0;
    let velocity = 0;       // px/ms, smoothed
    let prevX    = 0;
    let prevTime = 0;
    let settling = false;   // true while the snap-back / snap-forward plays

    const getPageWidth = () => viewport.offsetWidth;

    // ─── touchstart ────────────────────────────────────────────────────────
    const onStart = (e: TouchEvent) => {
      if (settling) return; // Don't interrupt a settling animation

      // If the touch target is inside mediaWrapper, but we are not on the media page, ignore it.
      const isTouchInsideMedia = mediaWrapperRef.current?.contains(e.target as Node);
      if (isTouchInsideMedia && swipeIndexRef.current !== 2) {
        return;
      }

      active   = true;
      startX   = e.touches[0].clientX;
      startY   = e.touches[0].clientY;
      dirLocked = null;
      dx       = 0;
      velocity = 0;
      prevX    = startX;
      prevTime = performance.now();
    };

    // ─── touchmove ─────────────────────────────────────────────────────────
    const onMove = (e: TouchEvent) => {
      if (!active) return;

      const x    = e.touches[0].clientX;
      const y    = e.touches[0].clientY;
      const rawDx = x - startX;
      const rawDy = y - startY;
      const idx   = swipeIndexRef.current;

      // Direction lock — decide once whether this is a horizontal or vertical gesture.
      if (dirLocked === null) {
        if (Math.abs(rawDx) > Math.abs(rawDy) * 1.2 && Math.abs(rawDx) > 6) {
          dirLocked = "h";
        } else if (Math.abs(rawDy) > 8) {
          dirLocked = "v";
          active = false;
          return;
        } else {
          return; // Not enough movement to decide yet
        }
      }

      if (dirLocked !== "h") return;
      e.preventDefault(); // Prevent vertical scroll while swiping horizontally

      // Velocity tracking (exponential moving average)
      const now = performance.now();
      const dt  = now - prevTime;
      if (dt > 0) {
        const instantVel = (x - prevX) / dt;   // px/ms
        velocity = velocity * 0.6 + instantVel * 0.4;
      }
      prevX    = x;
      prevTime = now;

      // Edge rubber-band resistance
      const pw = getPageWidth();
      let adjustedDx = rawDx;
      if (idx === 0 && rawDx > 0) {
        adjustedDx = rawDx * 0.25; // at first page, pulling right
      } else if (idx === SWIPE_PAGES.length - 1 && rawDx < 0) {
        adjustedDx = rawDx * 0.25; // at last page, pulling left
      }
      dx = adjustedDx;

      // Move the track imperatively (no React re-render)
      const offset = -idx * pw + adjustedDx;
      track.style.transition = "none";
      track.style.transform  = `translateX(${offset}px)`;

      // Sync the media wrapper position during the swipe — but only when Media is
      // the current page or the one being dragged toward. For swipes that don't
      // touch Media, the wrapper stays at rest so the fixed livestream PIP iframe
      // doesn't ride the transform (which blanks it grey on iOS WKWebView).
      if (mediaWrapperRef.current && mediaNeedsTransformForDrag(idx, adjustedDx)) {
        const defaultOffset = (MEDIA_INDEX - idx) * pw;
        mediaWrapperRef.current.style.transition = "none";
        mediaWrapperRef.current.style.transform  = `translateX(${defaultOffset + adjustedDx}px)`;
      }

      // Drag the navigation pill
      setPillDrag(idx, adjustedDx);
    };

    // ─── touchend ──────────────────────────────────────────────────────────
    const onEnd = () => {
      if (!active || dirLocked !== "h") {
        active = false;
        return;
      }
      active = false;

      const idx = swipeIndexRef.current;
      const pw  = getPageWidth();

      // Decide: commit to next/prev page, or snap back?
      const velThreshold  = 0.3;       // px/ms
      const dispThreshold = pw * 0.2;  // 20% of page width

      let targetIndex = idx;

      if (velocity < -velThreshold || (velocity < 0 && dx < -dispThreshold)) {
        targetIndex = Math.min(idx + 1, SWIPE_PAGES.length - 1);
      } else if (velocity > velThreshold || (velocity > 0 && dx > dispThreshold)) {
        targetIndex = Math.max(idx - 1, 0);
      }

      // Calculate animation duration scaled by remaining distance / velocity
      const currentOffset = -idx * pw + dx;
      const targetOffset  = -targetIndex * pw;
      const remaining     = Math.abs(targetOffset - currentOffset);
      const speed         = Math.max(Math.abs(velocity), 0.4); // min 0.4 px/ms
      const ms            = Math.max(180, Math.min(420, Math.round(remaining / speed)));

      // Snap-back uses bouncy spring; page change uses smooth decel
      const easing = targetIndex === idx
        ? "cubic-bezier(0.34, 1.56, 0.64, 1)"
        : "cubic-bezier(0.32, 0.72, 0, 1)";

      // Animate track to target
      track.style.transition = `transform ${ms}ms ${easing}`;
      track.style.transform  = `translateX(${targetOffset}px)`;

      // Animate media wrapper to target position — only when Media is involved.
      if (mediaWrapperRef.current) {
        if (idx === MEDIA_INDEX || targetIndex === MEDIA_INDEX) {
          const mediaTargetX = (MEDIA_INDEX - targetIndex) * pw;
          mediaWrapperRef.current.style.transition = `transform ${ms}ms ${easing}`;
          mediaWrapperRef.current.style.transform  = `translateX(${mediaTargetX}px)`;
        } else {
          mediaWrapperRef.current.style.transition = "none";
          mediaWrapperRef.current.style.transform  = "";
        }
      }

      // Animate the navigation pill
      const pillTransition = `left ${ms}ms ${easing}, width ${ms}ms ${easing}`;
      if (targetIndex !== idx) {
        setPillToIndex(targetIndex, pillTransition);
      } else {
        snapPillBack(idx);
      }

      settling = true;

      if (targetIndex !== idx) {
        // Mark that the swipe handler is driving the animation — the
        // useLayoutEffect should NOT also animate on this render.
        swipeAnimatingRef.current = true;

        // When swiping TO the media page, set renderedSwipeIndex immediately
        // (batched with setSwipeIndex) so isMediaPage=true during the animation.
        // This avoids the mid-gesture re-render that was breaking the first swipe —
        // the state only changes at the moment the finger lifts, not mid-gesture.
        if (targetIndex === 2) {
          setRenderedSwipeIndex(2);
        }

        setSwipeIndex(targetIndex);
      }

      // Clean up after the animation finishes
      setTimeout(() => {
        settling = false;
        clearPillTransition();
        if (trackRef.current) trackRef.current.style.transition = "";
        
        // Reset media wrapper transform
        if (mediaWrapperRef.current) {
          mediaWrapperRef.current.style.transition = "";
          mediaWrapperRef.current.style.transform  = "";
        }
        
        // Defer updating renderedSwipeIndex until the swipe animation is complete
        setRenderedSwipeIndex(targetIndex);
      }, ms + 20);
    };

    viewport.addEventListener("touchstart",  onStart, { passive: true });
    viewport.addEventListener("touchmove",   onMove,  { passive: false });
    viewport.addEventListener("touchend",    onEnd,   { passive: true });
    viewport.addEventListener("touchcancel", onEnd,   { passive: true });

    if (mediaWrapper) {
      mediaWrapper.addEventListener("touchstart",  onStart, { passive: true });
      mediaWrapper.addEventListener("touchmove",   onMove,  { passive: false });
      mediaWrapper.addEventListener("touchend",    onEnd,   { passive: true });
      mediaWrapper.addEventListener("touchcancel", onEnd,   { passive: true });
    }

    return () => {
      viewport.removeEventListener("touchstart",  onStart);
      viewport.removeEventListener("touchmove",   onMove);
      viewport.removeEventListener("touchend",    onEnd);
      viewport.removeEventListener("touchcancel", onEnd);

      if (mediaWrapper) {
        mediaWrapper.removeEventListener("touchstart",  onStart);
        mediaWrapper.removeEventListener("touchmove",   onMove);
        mediaWrapper.removeEventListener("touchend",    onEnd);
        mediaWrapper.removeEventListener("touchcancel", onEnd);
      }
    };
  // Mount-only: swipeIndexRef.current and renderedSwipeIndexRef.current are read
  // via refs so the handler always sees the latest values without re-attachment.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Active scroll container for Navigation ────────────────────────────────
  // Navigation needs a ref to the active page's scroll container so it can
  // track scroll direction (expand/collapse nav on mobile).
  const [activeScrollEl, setActiveScrollEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    // Media page (index 2) renders in mediaWrapperRef, not in the pager track,
    // so pageRefs.current[2] is empty. Use the wrapper ref directly instead.
    if (swipeIndex === 2) {
      setActiveScrollEl(mediaWrapperRef.current ?? null);
    } else {
      setActiveScrollEl(pageRefs.current[swipeIndex] ?? null);
    }
  }, [swipeIndex]);

  useNotificationChecker(5);

  // ── Hash / deep-link navigation ───────────────────────────────────────────
  useEffect(() => {
    const applyHash = (raw: string) => {
      const hash = raw.startsWith("/") ? raw.slice(1) : raw;
      const path = window.location.pathname;
      if (hash === "#admin-upload") {
        handleNavigate("adminUpload");
      } else if (path === "/trivia-game" || hash === "#trivia-game") {
        handleNavigate("triviaGame");
      } else if (hash === "#media") {
        handleNavigate("media");
      } else if (hash === "#news" || hash === "#news-announcements" || hash === "#news-events") {
        if (hash) window.location.hash = hash;
        handleNavigate("news");
      } else if (hash === "#bulletin") {
        handleNavigate(UGC_ENABLED ? "bulletin" : "home");
      } else if (hash === "#home") {
        handleNavigate("home");
      } else if (hash === "#donations") {
        handleNavigate("donations");
      }
    };

    const init = async () => {
      if ("caches" in window) {
        try {
          const cache = await caches.open("cne-nav-intent");
          const response = await cache.match("/notification-nav");
          if (response) {
            const hash = (await response.text()).trim();
            await cache.delete("/notification-nav");
            if (hash) { applyHash(hash); return; }
          }
        } catch { /* cache unavailable */ }
      }
      const hash = window.location.hash;
      if (hash) applyHash(hash);
    };

    void init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Service worker / window messages ──────────────────────────────────────
  useEffect(() => {
    const navigate = (raw: string) => {
      const hash = raw.startsWith("/") ? raw.slice(1) : raw;
      if ("caches" in window) {
        caches.open("cne-nav-intent")
          .then(cache => cache.delete("/notification-nav"))
          .catch(() => {});
      }
      if (hash === "#news-announcements" || hash === "#news" || hash === "#news-events") {
        window.location.hash = hash;
        handleNavigate("news");
      } else if (hash === "#media") {
        handleNavigate("media");
      } else if (hash === "#bulletin") {
        handleNavigate(UGC_ENABLED ? "bulletin" : "home");
      } else if (hash === "#admin-upload") {
        handleNavigate("adminUpload");
      } else if (hash === "#home") {
        handleNavigate("home");
      } else if (hash === "#donations") {
        handleNavigate("donations");
      }
    };

    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === "NAVIGATE") navigate(event.data.hash ?? "");
    };
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleSWMessage);
    }
    const handleWindowMessage = (event: MessageEvent) => {
      if (event.data?.type === "NAVIGATE") navigate(event.data.hash ?? "");
    };
    window.addEventListener("message", handleWindowMessage);
    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleSWMessage);
      }
      window.removeEventListener("message", handleWindowMessage);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived state ─────────────────────────────────────────────────────────
  const currentPage  = overlayPage ?? SWIPE_PAGES[swipeIndex];
  const isMediaPage  = renderedSwipeIndex === 2 && !overlayPage;
  const isMediaInteractive = swipeIndex === 2 && renderedSwipeIndex === 2 && !overlayPage;

  return (
    <ThemeProvider>
      <div
        ref={rootRef}
        className="fixed inset-0 flex flex-col warm-gradient"
        style={{
          paddingLeft:  "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <Navigation
          currentPage={currentPage}
          onNavigate={handleNavigate}
          swipePageIndex={swipeIndex}
          swipePageCount={SWIPE_PAGES.length}
          scrollContainer={activeScrollEl}
        />

        {/* Media wrapper — rendered outside the pager track so position:fixed
            PIP mini-player can escape the transform containing block.
            When isMediaPage=true, it renders as a full-screen overlay aligned
            with the pager viewport. When isMediaPage=false, Media renders its
            own position:fixed PIP. */}
        <div
          ref={mediaWrapperRef}
          className="absolute inset-0 overflow-y-auto overscroll-y-none"
          style={{
            paddingTop: "env(safe-area-inset-top)",
            WebkitOverflowScrolling: "touch" as any,
            pointerEvents: isMediaInteractive ? "auto" : "none",
            // When on the media page: z=10 so the nav (z=50) renders on top of content.
            // When NOT on media page (PIP mode): z=60 so the PIP iframe renders ABOVE the
            // nav (z=50). Previously z=10 caused the entire mediaWrapper stacking context
            // to paint below the nav, hiding the PIP behind the grey nav placeholder.
            zIndex: isMediaPage ? 10 : 60,
          }}
        >
          <div className={cn(isMediaPage && "pb-24 md:pb-20")}>
            <Media key="media-player-root" isMediaPage={isMediaPage} />
          </div>
        </div>

        {/* ═══ Horizontal pager ═══
            All 5 swipeable pages are always mounted, each in its own scroll
            container. The track translates horizontally to show the current
            page. No scroll position save/restore needed — each page maintains
            its own scrollTop naturally. */}
        <div
          ref={viewportRef}
          className="flex-1 overflow-hidden relative"
        >
          <div
            ref={trackRef}
            className="flex h-full"
            style={{
              width: `${SWIPE_PAGES.length * 100}%`,
              willChange: "transform",
            }}
          >
            {SWIPE_PAGES.map((page, i) => (
              <div
                key={page}
                ref={(el) => { pageRefs.current[i] = el; }}
                className="h-full overflow-y-auto overscroll-y-none"
                style={{
                  width: `${100 / SWIPE_PAGES.length}%`,
                  WebkitOverflowScrolling: "touch" as any,
                  paddingTop: page !== "home" ? "env(safe-area-inset-top)" : undefined,
                }}
              >
                <div className={cn("pb-24 md:pb-20", page !== "home" && "md:pt-20")}>
                  {page === "home"     && <Home onNavigate={handleNavigate} />}
                  {page === "bible"    && <Bible onNavigate={handleNavigate} />}
                  {page === "media"    && null /* Media renders externally in mediaWrapperRef for PIP support */}
                  {page === "news"     && <News />}
                  {page === "bulletin" && UGC_ENABLED && <BulletinBoard onNavigate={handleNavigate} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Overlay for non-swipeable pages ═══
            Full-screen overlay rendered above the pager. The pager stays visible
            underneath (at the last swipe index) so returning is instant. */}
        {overlayPage && (
          <div
            className="fixed inset-0 z-40 overflow-y-auto warm-gradient overscroll-y-none"
            style={{
              paddingTop:   "env(safe-area-inset-top)",
              paddingLeft:  "env(safe-area-inset-left)",
              paddingRight: "env(safe-area-inset-right)",
              WebkitOverflowScrolling: "touch" as any,
            }}
          >
            <div className="pb-24 md:pb-20 md:pt-20">
              {overlayPage === "donations"          && <Donations onNavigate={handleNavigate} />}
              {overlayPage === "adminUpload"         && <AdminUpload />}
              {overlayPage === "contact"             && <Contact onNavigate={handleNavigate} />}
              {overlayPage === "games"               && <Games onNavigate={handleNavigate} />}
              {overlayPage === "triviaGame"          && <TriviaGamePage onNavigate={handleNavigate} />}
              {overlayPage === "wordSearchGame"      && <WordSearchGamePage onNavigate={handleNavigate} />}
              {overlayPage === "graveyardShiftGame"  && <GraveyardShiftGamePage onNavigate={handleNavigate} />}
              {overlayPage === "newHere"             && <NewHere onNavigate={handleNavigate} />}
              {overlayPage === "notifications"       && <NotificationSettings />}
            </div>
          </div>
        )}

        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[60] flex flex-col gap-2">
          <InstallPrompt />
          <PushNotificationPrompt />
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
