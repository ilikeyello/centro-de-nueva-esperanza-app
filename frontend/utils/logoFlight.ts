/**
 * Glide a copy of one logo image onto another (FLIP), e.g. from the Verse of
 * the Day popup's logo down to the home page logo when the popup closes.
 * The real target logo is hidden during the flight and revealed at the end.
 */
export function isOnScreen(el: Element | null): el is HTMLElement {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.right > 0 && r.left < window.innerWidth && r.bottom > 0 && r.top < window.innerHeight;
}

export function flyLogo(from: HTMLImageElement, to: HTMLElement, duration = 750): void {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  if (!a.width || !b.width) return;

  const clone = document.createElement("img");
  clone.src = from.currentSrc || from.src;
  clone.alt = "";
  clone.setAttribute("aria-hidden", "true");
  Object.assign(clone.style, {
    position: "fixed",
    left: `${a.left}px`,
    top: `${a.top}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
    zIndex: "10000",
    pointerEvents: "none",
    transformOrigin: "top left",
    willChange: "transform",
  } as Partial<CSSStyleDeclaration>);
  document.body.appendChild(clone);
  to.style.opacity = "0";

  const dx = b.left - a.left;
  const dy = b.top - a.top;
  const s = b.width / a.width;
  void clone.offsetWidth;
  clone.style.transition = `transform ${duration}ms cubic-bezier(0.65, 0, 0.25, 1)`;
  clone.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;

  window.setTimeout(() => {
    to.style.opacity = "";
    clone.remove();
  }, duration + 30);
}
