import { useEffect, useRef } from "react";

/**
 * Soft desert-colored light shapes behind every page. They give the
 * frosted-glass cards and navbar something to blur, and they sway gently
 * as the page scrolls so the glass changes as you move.
 *
 * Sits at z-index -1 inside its fixed parent: above the parent's base
 * background, below all page content. Purely decorative.
 */
const BLOBS = [
  { name: "sun",  x: 78, y: 10, size: 70, fx: 1.0, fy: 0.8, ph: 0.0 },
  { name: "sky",  x: 15, y: 30, size: 60, fx: 0.7, fy: 1.1, ph: 1.7 },
  { name: "clay", x: 85, y: 62, size: 65, fx: 1.2, fy: 0.9, ph: 3.1 },
  { name: "dune", x: 20, y: 88, size: 75, fx: 0.8, fy: 1.0, ph: 4.4 },
  { name: "sage", x: 55, y: 45, size: 40, fx: 1.1, fy: 1.3, ph: 2.2 },
];

export function DesertBackdrop({ scrollEl, fixed = false }: { scrollEl?: HTMLElement | null; fixed?: boolean }) {
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!scrollEl) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = scrollEl.scrollTop;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const b = BLOBS[i];
        // Bounded sway (sin/cos) so shapes never drift off-screen on long pages.
        const t = y / 650 + b.ph;
        const dx = Math.cos(t * b.fx) * 45;
        const dy = Math.sin(t * b.fy) * 110;
        el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scrollEl.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrollEl]);

  return (
    <div className={fixed ? "desert-backdrop desert-backdrop--fixed" : "desert-backdrop"} aria-hidden="true">
      {BLOBS.map((b, i) => (
        <div
          key={b.name}
          ref={(el) => { refs.current[i] = el; }}
          className={`desert-blob desert-blob--${b.name}`}
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.size}vmax`,
            height: `${b.size}vmax`,
            marginLeft: `-${b.size / 2}vmax`,
            marginTop: `-${b.size / 2}vmax`,
          }}
        />
      ))}
    </div>
  );
}
