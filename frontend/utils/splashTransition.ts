/**
 * Splash → home hand-off.
 *
 * index.html has an HTML copy of the launch screen (#static-splash) that is
 * laid out to match the native iOS splash exactly: same photo, logo centered
 * at the same size. The native splash is hidden instantly, so the user is
 * really looking at the HTML copy — then its logo glides (FLIP animation)
 * into the home page's hero logo while the splash photo fades away.
 *
 * Falls back to a simple fade if the home logo isn't on screen (e.g. the
 * app opened straight to another page) or the user prefers reduced motion.
 */
type PopupState = "pending" | "open" | "none" | undefined;
const popupState = () => (window as unknown as { __cneVersePopup?: PopupState }).__cneVersePopup;

/**
 * Waits (briefly) to learn whether the Verse of the Day popup is opening.
 * If it is, the logo flies into the popup's logo; otherwise into the home
 * page's. Gives up after a couple of seconds so a slow network can't hold the
 * splash on screen.
 */
export function playSplashToHome(): void {
  const started = performance.now();
  const check = () => {
    const state = popupState();
    if (state === "open") {
      // Let the popup finish its open animation so we measure its final spot.
      window.setTimeout(() => runTransition("[data-verse-popup-logo]"), 320);
    } else if (state === "none" || performance.now() - started > 2500) {
      runTransition("[data-hero-logo]");
    } else {
      window.setTimeout(check, 60);
    }
  };
  check();
}

function runTransition(targetSelector: string): void {
  const splash = document.getElementById("static-splash");
  if (!splash) return;

  const logo = splash.querySelector("img") as HTMLImageElement | null;
  const bg = splash.querySelector(".splash-bg") as HTMLElement | null;
  const target = document.querySelector(targetSelector) as HTMLElement | null;
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  splash.style.pointerEvents = "none";

  const finish = () => {
    if (target) target.style.opacity = "";
    splash.remove();
  };

  const fadeOnly = () => {
    splash.style.transition = "opacity 0.35s ease";
    splash.style.opacity = "0";
    window.setTimeout(finish, 380);
  };

  if (!logo || !target || reduceMotion) return fadeOnly();

  const t = target.getBoundingClientRect();
  const onScreen =
    t.width > 0 && t.height > 0 &&
    t.right > 0 && t.left < window.innerWidth &&
    t.bottom > 0 && t.top < window.innerHeight;
  if (!onScreen) return fadeOnly();

  const s = logo.getBoundingClientRect();
  const dx = t.left + t.width / 2 - (s.left + s.width / 2);
  const dy = t.top + t.height / 2 - (s.top + s.height / 2);
  const scale = t.width / s.width;

  // Hide the real logo while the splash copy flies into its place.
  target.style.opacity = "0";

  const DURATION = 900;
  void logo.offsetWidth; // commit the starting position before animating
  logo.style.transition = `transform ${DURATION}ms cubic-bezier(0.65, 0, 0.25, 1)`;
  logo.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${scale})`;
  if (bg) {
    bg.style.transition = `opacity ${Math.round(DURATION * 0.8)}ms ease ${Math.round(DURATION * 0.1)}ms`;
    bg.style.opacity = "0";
  }
  window.setTimeout(finish, DURATION + 40);
}
