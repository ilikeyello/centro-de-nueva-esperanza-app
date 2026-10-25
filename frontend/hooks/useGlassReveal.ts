import { useEffect } from "react";

const SELECTOR = '.warm-card, [data-slot="card"], .glass-card';

/**
 * Glass cards float up and fade in the first time they scroll (or swipe)
 * into view. Purely visual: a card is fully visible by default and only
 * hidden once this hook has tagged it, so nothing can get stuck invisible
 * if the hook doesn't run.
 */
export function useGlassReveal() {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        let i = 0;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          io.unobserve(el);
          el.style.transitionDelay = `${Math.min(i++ * 60, 300)}ms`;
          el.classList.add("is-visible");
          // Hand control back to the card's own transitions (hover etc.).
          window.setTimeout(() => {
            el.style.transitionDelay = "";
            el.classList.remove("glass-reveal", "is-visible");
          }, 1000);
        }
      },
      { threshold: 0.06 }
    );

    const track = (el: Element) => {
      if (seen.has(el)) return;
      seen.add(el);
      if (el.closest('[role="dialog"], nav')) return;
      el.classList.add("glass-reveal");
      io.observe(el);
    };

    document.querySelectorAll(SELECTOR).forEach(track);
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          if (n.matches(SELECTOR)) track(n);
          n.querySelectorAll(SELECTOR).forEach(track);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
