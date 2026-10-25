import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

/**
 * Full-screen photo viewer for post photos. Opened by tapping a photo in
 * PostImageCarousel. Swiping between photos uses native scroll-snap, so it
 * feels like the iOS Photos app with no gesture code of our own.
 *
 * Rendered into <body> through a portal so it sits above the navbar, the
 * media mini-player and the page pager.
 */
interface PhotoViewerProps {
  images: string[];
  alt: string;
  startIndex: number;
  onClose: (lastIndex: number) => void;
}

export function PhotoViewer({ images, alt, startIndex, onClose }: PhotoViewerProps) {
  const { t } = useLanguage();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(startIndex);
  const indexRef = useRef(startIndex);
  indexRef.current = index;
  const count = images.length;

  // Open on the photo that was tapped, without animating there.
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollLeft = startIndex * el.clientWidth;
  }, [startIndex]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollLeft / (el.clientWidth || 1));
      if (i !== indexRef.current) setIndex(Math.max(0, Math.min(count - 1, i)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [count]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(indexRef.current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("Photo viewer", "Visor de fotos")}
      data-swipe-lock="true"
      // React events bubble through portals: without this, tapping Close
      // would bubble up to the carousel and immediately reopen the viewer.
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[200] bg-black"
      style={{ animation: "photo-viewer-in 0.2s ease-out" }}
    >
      <div
        ref={scrollerRef}
        className="flex h-full w-full overflow-x-auto overflow-y-hidden"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          overscrollBehavior: "contain",
        }}
      >
        {images.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="flex h-full w-full shrink-0 items-center justify-center"
            style={{ scrollSnapAlign: "center", scrollSnapStop: "always" }}
            // Tapping the dark space around a photo closes the viewer.
            onClick={(e) => { if (e.target === e.currentTarget) onClose(indexRef.current); }}
          >
            <img
              src={src}
              alt={count > 1 ? `${alt} (${i + 1}/${count})` : alt}
              className="max-h-full max-w-full object-contain select-none"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Top bar: counter + close */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-4"
        style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
      >
        <div className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white backdrop-blur-md">
          {count > 1 ? `${index + 1} / ${count}` : ""}
        </div>
        <button
          type="button"
          onClick={() => onClose(indexRef.current)}
          aria-label={t("Close", "Cerrar")}
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Dots */}
      {count > 1 && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-1.5"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
        >
          {images.map((_, i) => (
            <span
              key={i}
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
