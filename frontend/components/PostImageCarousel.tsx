import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

/**
 * The photo (or photos) at the top of an announcement or event.
 *
 * Sizing: the frame takes the tallest photo's own shape rather than a fixed
 * 16:9 box, so a portrait flyer fills the post instead of sitting letterboxed
 * between two grey bars. It's clamped so one extreme photo can't push the rest
 * of the post off screen, and every photo is `contain`-fitted — nothing gets
 * cropped, which matters when the photo *is* the flyer and has text on it.
 *
 * Gestures: this has to claim a horizontal drag away from two competitors —
 * the WebView's own scrolling, and the app's page pager. That means:
 *
 *   1. Native listeners, not React's. React registers touchmove passively at
 *      the root, so preventDefault() inside onTouchMove is silently ignored
 *      and iOS keeps the gesture. Non-passive listeners are the only way to
 *      take it.
 *   2. `touch-action: pan-y`, so the browser hands us horizontal movement up
 *      front instead of deciding mid-gesture and firing touchcancel.
 *   3. `data-swipe-lock`, which AppInner's pager checks on touchstart so
 *      swiping photos doesn't also page the app sideways.
 *
 * The drag itself moves the track by writing `transform` directly. Doing it
 * through React state re-rendered the whole post on every touchmove frame,
 * which is visibly choppy in a WebView.
 */

/** Tallest allowed frame (w/h). 0.6 ≈ 3:5, a touch taller than a phone photo. */
const MIN_ASPECT = 0.6;
/** Widest allowed frame — beyond this a panorama becomes a letterbox sliver. */
const MAX_ASPECT = 2;
/** Fallback until the first photo reports its real dimensions. */
const DEFAULT_ASPECT = 4 / 3;

/** How far a drag must travel before it counts as "next photo". */
const SWIPE_THRESHOLD_PX = 45;
/** A fast flick counts even if it didn't travel far. px/ms. */
const FLICK_VELOCITY = 0.35;

const SETTLE_MS = 320;
const SETTLE_EASING = "cubic-bezier(0.22, 0.61, 0.36, 1)";

interface PostImageCarouselProps {
  images: string[];
  alt: string;
}

export function PostImageCarousel({ images, alt }: PostImageCarouselProps) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [aspect, setAspect] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // The frame follows the *tallest* photo so the post doesn't change height
  // as you swipe through the set.
  const measuredRef = useRef<number | null>(null);

  // Gesture state lives in a ref: touchmove fires far too often to round-trip
  // through React, and the listeners below are bound once.
  const gesture = useRef({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    dx: 0,
    locked: null as "h" | "v" | null,
    active: false,
  });

  const indexRef = useRef(0);
  indexRef.current = index;
  const countRef = useRef(images.length);
  countRef.current = images.length;

  const count = images.length;
  const isCarousel = count > 1;

  /** Position the track at a slide, optionally animating. */
  const settleTo = useCallback((next: number, animate: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = animate ? `transform ${SETTLE_MS}ms ${SETTLE_EASING}` : "none";
    track.style.transform = `translate3d(${-next * 100}%, 0, 0)`;
  }, []);

  // Keep the track in sync when the index changes from a dot tap, and on mount.
  useEffect(() => {
    settleTo(index, false);
    // Re-enable the transition on the next frame so dot taps animate but the
    // initial placement doesn't slide in from the left.
    const id = requestAnimationFrame(() => {
      if (trackRef.current) {
        trackRef.current.style.transition = `transform ${SETTLE_MS}ms ${SETTLE_EASING}`;
      }
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!gesture.current.active) settleTo(index, true);
  }, [index, settleTo]);

  // A post can lose photos while mounted (admin edit + refetch); don't strand
  // the index past the end of the list.
  useEffect(() => {
    setIndex((current) => (current > count - 1 ? Math.max(0, count - 1) : current));
  }, [count]);

  // ── Touch handling ────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isCarousel) return;

    const width = () => container.offsetWidth || 1;

    const onStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      gesture.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        lastX: touch.clientX,
        lastTime: performance.now(),
        velocity: 0,
        dx: 0,
        locked: null,
        active: true,
      };
    };

    const onMove = (event: TouchEvent) => {
      const g = gesture.current;
      if (!g.active) return;

      const touch = event.touches[0];
      const dx = touch.clientX - g.startX;
      const dy = touch.clientY - g.startY;

      // Decide once whether this is a sideways drag (ours) or a scroll down
      // the post (the page's). Same ratio the app's pager uses, so the two
      // feel consistent.
      if (g.locked === null) {
        if (Math.abs(dx) > Math.abs(dy) * 1.2 && Math.abs(dx) > 6) {
          g.locked = "h";
        } else if (Math.abs(dy) > 8) {
          g.locked = "v";
          g.active = false;
          return;
        } else {
          return; // not enough movement to tell yet
        }
      }
      if (g.locked !== "h") return;

      // This is the line React's passive listener could not run — without it
      // iOS keeps the gesture and the photos never move.
      event.preventDefault();

      const now = performance.now();
      const dt = now - g.lastTime;
      if (dt > 0) {
        g.velocity = g.velocity * 0.6 + ((touch.clientX - g.lastX) / dt) * 0.4;
      }
      g.lastX = touch.clientX;
      g.lastTime = now;

      // Rubber-band at the two ends so it's obvious there's nothing further.
      const atStart = indexRef.current === 0 && dx > 0;
      const atEnd = indexRef.current === countRef.current - 1 && dx < 0;
      g.dx = atStart || atEnd ? dx * 0.25 : dx;

      const track = trackRef.current;
      if (track) {
        const percent = (g.dx / width()) * 100;
        track.style.transition = "none";
        track.style.transform = `translate3d(${-indexRef.current * 100 + percent}%, 0, 0)`;
      }
    };

    const onEnd = () => {
      const g = gesture.current;
      if (!g.active) return;
      const { dx, velocity, locked } = g;
      g.active = false;
      g.dx = 0;

      if (locked !== "h") return;

      const current = indexRef.current;
      const last = countRef.current - 1;
      let next = current;

      const wentLeft = dx <= -SWIPE_THRESHOLD_PX || velocity <= -FLICK_VELOCITY;
      const wentRight = dx >= SWIPE_THRESHOLD_PX || velocity >= FLICK_VELOCITY;

      if (wentLeft && current < last) next = current + 1;
      else if (wentRight && current > 0) next = current - 1;

      // Always settle the track, even when the index didn't change — otherwise
      // a short drag leaves the photo sitting half-way off.
      settleTo(next, true);
      if (next !== current) setIndex(next);
    };

    // touchmove must be non-passive for preventDefault above to take effect.
    container.addEventListener("touchstart", onStart, { passive: true });
    container.addEventListener("touchmove", onMove, { passive: false });
    container.addEventListener("touchend", onEnd, { passive: true });
    container.addEventListener("touchcancel", onEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", onStart);
      container.removeEventListener("touchmove", onMove);
      container.removeEventListener("touchend", onEnd);
      container.removeEventListener("touchcancel", onEnd);
    };
  }, [isCarousel, settleTo]);

  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (!naturalWidth || !naturalHeight) return;
    const ratio = naturalWidth / naturalHeight;
    const previous = measuredRef.current;
    if (previous === null || ratio < previous) {
      measuredRef.current = ratio;
      setAspect(Math.min(Math.max(ratio, MIN_ASPECT), MAX_ASPECT));
    }
  }, []);

  if (count === 0) return null;

  const frameAspect = aspect ?? DEFAULT_ASPECT;

  return (
    <div
      ref={containerRef}
      // Read by AppInner's pager: a touch that starts in here must not also
      // swipe the app between pages.
      data-swipe-lock="true"
      className="relative w-full overflow-hidden bg-[--surface-mid] select-none"
      style={{
        aspectRatio: String(frameAspect),
        maxHeight: "80vh",
        // Tell the browser vertical scrolling is still its job, but horizontal
        // panning is ours. Without this iOS can start scrolling and then cancel
        // the touch mid-swipe.
        touchAction: isCarousel ? "pan-y" : undefined,
      }}
    >
      <div ref={trackRef} className="flex h-full w-full will-change-transform">
        {images.map((src, i) => (
          <div key={`${src}-${i}`} className="h-full w-full shrink-0">
            <img
              src={src}
              alt={count > 1 ? `${alt} (${i + 1}/${count})` : alt}
              onLoad={handleImageLoad}
              className="pointer-events-none h-full w-full object-contain"
              draggable={false}
              // The first photo is what the reader sees immediately; the rest
              // can wait until they swipe.
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {isCarousel && (
        <>
          {/* Position dots. Tappable, with a hit area bigger than the dot. */}
          <div
            className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 pb-3 pt-8
                       bg-gradient-to-t from-black/35 to-transparent"
            role="tablist"
            aria-label={t("Photos", "Fotos")}
          >
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={t(`Photo ${i + 1} of ${count}`, `Foto ${i + 1} de ${count}`)}
                onClick={() => setIndex(i)}
                className="p-1.5 [-webkit-tap-highlight-color:transparent]"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-5 bg-white" : "w-1.5 bg-white/60"
                  }`}
                  style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
                />
              </button>
            ))}
          </div>

          {/* Counter, so the set's size is obvious before swiping. */}
          <div
            className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            aria-hidden="true"
          >
            {index + 1}/{count}
          </div>
        </>
      )}
    </div>
  );
}
