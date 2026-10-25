import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

export interface GlassTab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface GlassTabsProps {
  tabs: GlassTab[];
  value: string;
  onChange: (id: string) => void;
}

const PAD = 4;
/** Springy settle, like the iOS 26 / Apple Music tab bar. */
const SPRING = "transform 0.55s cubic-bezier(0.25, 1.35, 0.45, 1)";
/** Lens grows a touch while your finger is on it. */
const LIFT = 1.1;

/**
 * Icon tab selector with a frosted-glass "lens" over the selected icon.
 * Tap an icon and the lens springs over to it; or press the lens and slide it
 * across the icons — it follows your finger 1:1, stretches with your speed,
 * and springs onto the nearest icon when you let go.
 *
 * The lens is moved by writing its transform directly (no React re-render
 * per finger movement), which is what keeps the drag smooth on a phone.
 */
export function GlassTabs({ tabs, value, onChange }: GlassTabsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const gesture = useRef<{
    startX: number;
    startLeft: number;
    lastX: number;
    lastT: number;
    velocity: number;
    moved: boolean;
    pointerId: number;
    x: number;
  } | null>(null);
  const raf = useRef(0);

  const count = tabs.length;
  const segment = trackWidth > 0 ? (trackWidth - PAD * 2) / count : 0;
  const index = Math.max(0, tabs.findIndex((tab) => tab.id === value));
  const maxLeft = segment * (count - 1);
  const litIndex = hoverIndex ?? index;

  const setLens = (x: number, sx: number, sy: number, transition: string) => {
    const lens = lensRef.current;
    if (!lens) return;
    lens.style.transition = transition;
    lens.style.transform = `translateX(${x}px) scale(${sx}, ${sy})`;
  };

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    setTrackWidth(el.offsetWidth);
    if (!("ResizeObserver" in window)) return;
    const ro = new ResizeObserver(() => setTrackWidth(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Rest position: spring over to the selected tab whenever it changes.
  useLayoutEffect(() => {
    if (!segment || gesture.current) return;
    setLens(index * segment, 1, 1, SPRING);
  }, [index, segment]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const indexFromClientX = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    return Math.max(0, Math.min(count - 1, Math.floor((clientX - rect.left - PAD) / (segment || 1))));
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!segment) return;
    const now = performance.now();
    gesture.current = {
      startX: event.clientX,
      startLeft: index * segment,
      lastX: event.clientX,
      lastT: now,
      velocity: 0,
      moved: false,
      pointerId: event.pointerId,
      x: index * segment,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    // Lift the lens under the finger only if the press starts on it.
    if (indexFromClientX(event.clientX) === index) {
      setLens(index * segment, LIFT, LIFT, "transform 0.22s cubic-bezier(0.3, 1.4, 0.5, 1)");
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g) return;
    const dx = event.clientX - g.startX;
    if (!g.moved && Math.abs(dx) < 4) return;
    g.moved = true;

    const now = performance.now();
    const dt = Math.max(1, now - g.lastT);
    g.velocity = g.velocity * 0.7 + ((event.clientX - g.lastX) / dt) * 0.3;
    g.lastX = event.clientX;
    g.lastT = now;

    // Follow the finger 1:1, with a soft rubber band past either end.
    let x = g.startLeft + dx;
    if (x < 0) x = x * 0.3;
    if (x > maxLeft) x = maxLeft + (x - maxLeft) * 0.3;
    g.x = x;

    // Stretch along the direction of travel, a little thinner as it stretches.
    const stretch = Math.min(Math.abs(g.velocity) * 0.18, 0.28);
    const sx = LIFT + stretch;
    const sy = LIFT - stretch * 0.35;

    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => setLens(x, sx, sy, "none"));

    const over = Math.max(0, Math.min(count - 1, Math.round(x / (segment || 1))));
    setHoverIndex((cur) => (cur === over ? cur : over));
  };

  const finish = (event: React.PointerEvent<HTMLDivElement>, cancelled = false) => {
    const g = gesture.current;
    gesture.current = null;
    cancelAnimationFrame(raf.current);
    setHoverIndex(null);
    if (!g) return;
    try {
      event.currentTarget.releasePointerCapture(g.pointerId);
    } catch {
      // already released
    }

    let next = index;
    if (!cancelled) {
      if (g.moved) {
        // A quick flick carries on to the next icon in that direction.
        const projected = g.x + g.velocity * 80;
        next = Math.max(0, Math.min(count - 1, Math.round(projected / (segment || 1))));
      } else {
        next = indexFromClientX(event.clientX);
      }
    }

    // Spring onto the chosen icon (also handles taps: slides over from where it was).
    setLens(next * segment, 1, 1, SPRING);
    const target = tabs[next];
    if (target && target.id !== value) onChange(target.id);
  };

  return (
    <div
      ref={trackRef}
      role="tablist"
      // The app pager swipes pages sideways; sliding the lens must not do that.
      data-swipe-lock="true"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => finish(e)}
      onPointerCancel={(e) => finish(e, true)}
      className="glass-tabs liquid-glass relative mx-auto flex w-full max-w-sm select-none items-stretch rounded-full border"
      style={{ padding: PAD, touchAction: "none" }}
    >
      {segment > 0 && (
        <div
          ref={lensRef}
          aria-hidden="true"
          className="glass-tabs-lens pointer-events-none absolute rounded-full"
          style={{
            top: PAD,
            bottom: PAD,
            left: PAD,
            width: segment,
            transform: `translateX(${index * segment}px)`,
            transformOrigin: "center",
          }}
        />
      )}
      {tabs.map((tab, i) => {
        const Icon = tab.icon;
        const active = i === litIndex;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === value}
            // Pointer taps are handled on the track (so the lens can be dragged);
            // this keeps keyboard / screen-reader activation working.
            onClick={(e) => {
              if (e.detail === 0 && tab.id !== value) onChange(tab.id);
            }}
            className={`glass-tabs-item relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-semibold transition-colors duration-200 [-webkit-tap-highlight-color:transparent] ${
              active ? "text-[--sage]" : "text-[--ink-mid]"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={active ? 2.3 : 2} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
