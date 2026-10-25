import { useLayoutEffect, type ReactNode } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shared layout for the "pick a game" and "pick a level" screens so every
 * game looks the same: back button, centered icon + title, then a list of
 * frosted-glass option cards.
 */
export function GameMenuScreen({
  onBack,
  backLabel,
  icon,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  onBack: () => void;
  backLabel: string;
  icon: ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  // Every time a menu screen shows (e.g. coming back from a finished level),
  // start at the very top so the title is in view.
  useLayoutEffect(() => {
    resetGameScroll();
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 pb-10">
      <Button variant="outline" size="sm" onClick={onBack} className="mb-6">
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Button>

      <header className="game-menu-header mb-7 flex flex-col items-center text-center">
        <div className="game-icon-bubble mb-4 h-16 w-16 [&_svg]:h-8 [&_svg]:w-8">{icon}</div>
        {eyebrow && (
          <span className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[--sage]">
            {eyebrow}
          </span>
        )}
        <h1 className="serif-heading text-3xl font-bold text-[--ink-dark]">{title}</h1>
        {subtitle && <p className="mt-2 max-w-md text-sm text-[--ink-mid]">{subtitle}</p>}
      </header>

      <div className="flex flex-col gap-3">{children}</div>

      {footer && <div className="mt-6 text-center text-sm italic text-[--ink-mid]">{footer}</div>}
    </div>
  );
}

/** One tappable option (a game or a level). */
export function GameOptionCard({
  icon,
  title,
  description,
  meta,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  title: string;
  description?: string | null;
  meta?: ReactNode[];
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="glass-card game-option-card flex w-full items-center gap-4 rounded-2xl p-4 text-left disabled:opacity-60"
    >
      <div className="game-icon-bubble h-12 w-12 flex-shrink-0 [&_svg]:h-6 [&_svg]:w-6">{icon}</div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold leading-snug text-[--ink-dark]">{title}</h3>
        {description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-[--ink-mid]">{description}</p>
        )}
        {meta && meta.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[--ink-mid] [&_svg]:h-3.5 [&_svg]:w-3.5">
            {meta.map((m, i) => (
              <span key={i} className="flex items-center gap-1">{m}</span>
            ))}
          </div>
        )}
      </div>
      <div className="game-play-chip h-9 w-9 flex-shrink-0">
        <ChevronRight className="h-5 w-5" />
      </div>
    </button>
  );
}

/** Placeholder line inside the option list (loading / empty / error). */
export function GameMenuNote({ children }: { children: ReactNode }) {
  return <p className="py-8 text-center text-sm text-[--ink-mid]">{children}</p>;
}

/** Scroll the game overlay (and the window) back to the top. */
export function resetGameScroll() {
  const reset = () => {
    document.querySelectorAll<HTMLElement>("[data-overlay-scroll]").forEach((el) => {
      el.scrollTop = 0;
    });
    window.scrollTo(0, 0);
  };
  reset();
  // iOS sometimes restores an old scroll offset a frame later.
  requestAnimationFrame(reset);
}
