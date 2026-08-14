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
 * Swiping: the app's pages are themselves a horizontal pager, so a drag that
 * starts on the carousel has to be kept away from it — otherwise flicking to
 * the next photo also throws you onto the next page. `data-swipe-lock` marks
 * this subtree; AppInner's pager checks for it on touchstart and stands down.
 */

/** Tallest allowed frame (w/h). 0.6 ≈ 3:5, a touch taller than a phone photo. */
const MIN_ASPECT = 0.6;
/** Widest allowed frame — beyond this a panorama becomes a letterbox sliver. */
const MAX_ASPECT = 2;
/** Fallback until the first photo reports its real dimensions. */
const DEFAULT_ASPECT = 4 / 3;

/** How far a drag must travel before it counts as "next photo". */
const SWIPE_THRESHOLD_PX = 45;

interface PostImageCarouselProps {
  images: string[];
  alt: string;
}

export function PostImageCarousel({ images, alt }: PostImageCarouselProps) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [aspect, setAspect] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  // Widest-to-tallest tracking: the frame follows the *tallest* photo so the
  // post doesn't change height as you swipe through the set.
  const measuredRef = useRef<number | null>(null);

  const count = images.length;
  const isCarousel = count > 1;

  // A post can lose photos while mounted (admin edit + refetch); don't strand
  // the index past the end of the list.
  useEffect(() => {
    setIndex((current) => (current > count - 1 ? Math.max(0, count - 1) : current));
  }, [count]);

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

  // ── Touch handling ────────────────────────────────────────────────────────
  // Mirrors the pager's own direction lock: figure out once whether the finger
  // is going sideways or down the page, and only hijack the sideways case so
  // vertical scrolling through the post still works normally.
  const gesture = useRef({ startX: 0, startY: 0, locked: null as "h" | "v" | null, active: false });

  const onTouchStart = (event: React.TouchEvent) => {
    if (!isCarousel) return;
    const touch = event.touches[0];
    gesture.current = { startX: touch.clientX, startY: touch.clientY, locked: null, active: true };
  };

  const onTouchMove = (event: React.TouchEvent) => {
    if (!isCarousel || !gesture.current.active) return;
    const touch = event.touches[0];
    const dx = touch.clientX - gesture.current.startX;
    const dy = touch.clientY - gesture.current.startY;

    if (gesture.current.locked === null) {
      if (Math.abs(dx) > Math.abs(dy) * 1.2 && Math.abs(dx) > 6) {
        gesture.current.locked = "h";
        setIsDragging(true);
      } else if (Math.abs(dy) > 8) {
        gesture.current.locked = "v";
        gesture.current.active = false;
        return;
      } else {
        return;
      }
    }
    if (gesture.current.locked !== "h") return;

    // Rubber-band at the two ends so it's obvious there's nothing further.
    const atStart = index === 0 && dx > 0;
    const atEnd = index === count - 1 && dx < 0;
    setDragOffset(atStart || atEnd ? dx * 0.25 : dx);
  };

  const onTouchEnd = () => {
    if (!isCarousel || !gesture.current.active) return;
    const travelled = dragOffset;
    gesture.current.active = false;
    setIsDragging(false);
    setDragOffset(0);

    if (travelled <= -SWIPE_THRESHOLD_PX && index < count - 1) setIndex(index + 1);
    else if (travelled >= SWIPE_THRESHOLD_PX && index > 0) setIndex(index - 1);
  };

  if (count === 0) return null;

  const frameAspect = aspect ?? DEFAULT_ASPECT;
  const width = containerRef.current?.offsetWidth ?? 0;
  const translatePercent = width ? (dragOffset / width) * 100 : 0;

  return (
    <div
      ref={containerRef}
      // Read by AppInner's pager: a touch that starts in here must not also
      // swipe the app between pages.
      data-swipe-lock="true"
      className="relative w-full overflow-hidden bg-[--surface-mid] select-none"
      style={{ aspectRatio: String(frameAspect), maxHeight: "80vh" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div
        className="flex h-full w-full"
        style={{
          transform: `translateX(calc(${-index * 100}% + ${translatePercent}%))`,
          transition: isDragging ? "none" : "transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1)",
        }}
      >
        {images.map((src, i) => (
          <div key={`${src}-${i}`} className="h-full w-full shrink-0">
            <img
              src={src}
              alt={count > 1 ? `${alt} (${i + 1}/${count})` : alt}
              onLoad={handleImageLoad}
              className="h-full w-full object-contain"
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
