import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, Share, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { shareVerseImages } from "../utils/shareVerse";
import { flyLogo, isOnScreen } from "../utils/logoFlight";
import { getVerseOfTheDay, type DailyVerse } from "../lib/verseOfTheDay";

/** Remembers which verse the popup last showed, so it appears once per new verse. */
const LAST_SEEN_KEY = "cne:verse:lastSeen";

/**
 * TEMPORARY: show the popup on every launch so the design can be reviewed.
 * Set back to false to restore the normal once-a-day behavior.
 */
const ALWAYS_SHOW_FOR_PREVIEW = false;

/**
 * Tells the splash animation (utils/splashTransition.ts) whether the popup is
 * about to show, so the splash logo can fly into the popup's logo instead of
 * the home page's. "pending" until the verse has loaded and we've decided.
 */
function setPopupState(state: "pending" | "open" | "none") {
  (window as unknown as { __cneVersePopup?: string }).__cneVersePopup = state;
}

/**
 * Loads today's verse once per mount and re-resolves it when the user changes
 * Bible version elsewhere in the app (the Bible page writes to localStorage,
 * which doesn't fire a storage event in the same tab, so we also listen for our
 * own custom event).
 */
export function useVerseOfTheDay() {
  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const result = await getVerseOfTheDay();
    setVerse(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const onVersionChange = () => void load();
    window.addEventListener("cne-bible-version-changed", onVersionChange);
    window.addEventListener("storage", onVersionChange);
    return () => {
      window.removeEventListener("cne-bible-version-changed", onVersionChange);
      window.removeEventListener("storage", onVersionChange);
    };
  }, [load]);

  return { verse, loading };
}

function VerseBody({ verse, large = false }: { verse: DailyVerse; large?: boolean }) {
  const { t, language } = useLanguage();
  const note = language === "en" ? verse.noteEn : verse.noteEs;

  return (
    <>
      <blockquote
        className={
          large
            ? "serif-heading text-2xl leading-relaxed text-[--ink-dark] sm:text-3xl"
            : "serif-heading text-lg leading-relaxed text-[--ink-dark] sm:text-xl"
        }
      >
        &ldquo;{verse.text}&rdquo;
      </blockquote>
      <p className={`font-semibold text-[--sage] ${large ? "mt-5 text-base" : "mt-3 text-sm"}`}>
        {language === "en" ? verse.referenceEn : verse.referenceEs}
        <span className="ml-2 font-normal uppercase tracking-wider text-[--ink-light]">
          {verse.version.toUpperCase()}
        </span>
      </p>
      {note && <p className="mt-3 text-sm italic text-[--ink-mid]">{note}</p>}
      {!note && verse.isOverride && (
        <p className="sr-only">{t("Chosen by the church", "Elegido por la iglesia")}</p>
      )}
    </>
  );
}

/**
 * The verse shown on the home page photo, under the logo. Long verses are
 * clamped; tapping opens the full-screen verse view.
 */
export function VerseOfTheDayHero({ verse }: { verse: DailyVerse | null }) {
  const { t, language } = useLanguage();
  if (!verse) return null;

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("cne-open-verse"))}
      className="hero-verse mx-auto mt-6 block max-w-md px-2 text-center text-white [-webkit-tap-highlight-color:transparent]"
      aria-label={t("Open verse of the day", "Abrir versículo del día")}
    >
      <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-white/85">
        {t("Verse of the Day", "Versículo del Día")}
      </span>
      <span className="mt-3 block serif-heading text-xl leading-snug line-clamp-5 sm:text-2xl">
        &ldquo;{verse.text}&rdquo;
      </span>
      <span className="mt-3 block text-sm font-semibold text-white/90">
        {language === "en" ? verse.referenceEn : verse.referenceEs}
        <span className="ml-2 font-normal uppercase tracking-wider text-white/70">
          {verse.version.toUpperCase()}
        </span>
      </span>
    </button>
  );
}

/** The card version (no longer on the home page; kept for reuse). */
export function VerseOfTheDayCard({ verse }: { verse: DailyVerse | null }) {
  const { t } = useLanguage();
  if (!verse) return null;

  return (
    <section className="warm-card p-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-[--sage]" />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[--sage]">
          {t("Verse of the Day", "Versículo del Día")}
        </p>
      </div>
      <div className="mt-4">
        <VerseBody verse={verse} />
      </div>
    </section>
  );
}

/** Verses the popup can show: today's verse, or a selection from the Bible page. */
export interface SharedVerses {
  verses: { number: number; text: string }[];
  /** Localized, e.g. "Juan 3:16-18" */
  reference: string;
  /** Bible version id, e.g. "spnbes" */
  version: string;
  /** Book name + chapter, so long selections can be split per picture. */
  bookName?: string;
  chapter?: number;
}

/** Open the popup with any verses (used by the Bible page's Share button). */
export function showVersesPopup(detail: SharedVerses) {
  window.dispatchEvent(new CustomEvent<SharedVerses>("cne-show-verses", { detail }));
}

/** Roughly how much text fits on one shareable picture at a readable size. */
const PAGE_CHAR_LIMIT = 420;

/** [16,17,18,20] -> "16-18, 20" */
function formatRanges(nums: number[]): string {
  const parts: string[] = [];
  let start = nums[0];
  let prev = nums[0];
  for (let i = 1; i <= nums.length; i++) {
    const n = nums[i];
    if (n === prev + 1) { prev = n; continue; }
    parts.push(start === prev ? String(start) : `${start}-${prev}`);
    start = n;
    prev = n;
  }
  return parts.join(", ");
}

const SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const toSuperscript = (n: number) => String(n).split("").map((d) => SUPERSCRIPT[Number(d)]).join("");
const cleanText = (text: string) => text.replace(/¶/g, "").trim();

interface Page {
  verses: { number: number; text: string }[];
  reference: string;
}

/** Split a long selection into pictures, never cutting a verse in half. */
function paginate(content: SharedVerses): Page[] {
  if (content.verses.length <= 1 || !content.bookName || !content.chapter) {
    return [{ verses: content.verses, reference: content.reference }];
  }
  const groups: Page["verses"][] = [];
  let current: Page["verses"] = [];
  let length = 0;
  for (const v of content.verses) {
    const len = cleanText(v.text).length + 4;
    if (current.length > 0 && length + len > PAGE_CHAR_LIMIT) {
      groups.push(current);
      current = [];
      length = 0;
    }
    current.push(v);
    length += len;
  }
  if (current.length) groups.push(current);
  if (groups.length === 1) return [{ verses: content.verses, reference: content.reference }];
  return groups.map((verses) => ({
    verses,
    reference: `${content.bookName} ${content.chapter}:${formatRanges(verses.map((v) => v.number))}`,
  }));
}

/**
 * Full-screen verse popup over the blurred canyon photo.
 *
 * - Daily: shown once each time the verse changes (first open of the day), or
 *   when the home verse / daily notification is tapped.
 * - Shared: opened from the Bible page with the verses the user selected.
 *   Long selections are split into several pictures the user can swipe
 *   through; Share sends all of them.
 *
 * Closing the daily one glides its logo back down into the home page logo.
 */
export function VerseOfTheDayDialog({ verse, loading = false }: { verse: DailyVerse | null; loading?: boolean }) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [shared, setShared] = useState<SharedVerses | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [sharing, setSharing] = useState(false);
  const decidedRef = useRef(false);
  const logoRef = useRef<HTMLImageElement>(null);
  const slidesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!decidedRef.current) setPopupState("pending");
  }, []);

  useEffect(() => {
    if (!verse) {
      // Couldn't load a verse at all — no popup today.
      if (!loading && !decidedRef.current) {
        decidedRef.current = true;
        setPopupState("none");
      }
      return;
    }
    if (decidedRef.current) return; // only decide once per launch
    decidedRef.current = true;

    let lastSeen: string | null = null;
    try {
      lastSeen = window.localStorage.getItem(LAST_SEEN_KEY);
    } catch {
      // Storage unavailable (private mode) — show it, just don't remember.
    }
    if (lastSeen === verse.dateKey && !ALWAYS_SHOW_FOR_PREVIEW) {
      setPopupState("none");
      return;
    }

    setShared(null);
    setOpen(true);
    setPopupState("open");
    try {
      window.localStorage.setItem(LAST_SEEN_KEY, verse.dateKey);
    } catch {
      // ignore
    }
  }, [verse, loading]);

  // Tapping the home verse or the daily verse notification shows the verse
  // even when the popup has already been seen today.
  useEffect(() => {
    const openDaily = () => {
      setShared(null);
      setPageIndex(0);
      setOpen(true);
    };
    const openShared = (event: Event) => {
      const detail = (event as CustomEvent<SharedVerses>).detail;
      if (!detail?.verses?.length) return;
      setShared(detail);
      setPageIndex(0);
      setOpen(true);
    };
    window.addEventListener("cne-open-verse", openDaily);
    window.addEventListener("cne-show-verses", openShared);
    return () => {
      window.removeEventListener("cne-open-verse", openDaily);
      window.removeEventListener("cne-show-verses", openShared);
    };
  }, []);

  // Start each opening on the first picture.
  useEffect(() => {
    if (open && slidesRef.current) slidesRef.current.scrollLeft = 0;
  }, [open, shared]);

  const content: SharedVerses | null = shared
    ? shared
    : verse
      ? {
          verses: [{ number: verse.verse, text: verse.text }],
          reference: language === "en" ? verse.referenceEn : verse.referenceEs,
          version: verse.version,
        }
      : null;

  const pages = content ? paginate(content) : [];

  const close = () => {
    // Daily popup over the home page: send the logo back to the home logo.
    if (!shared && logoRef.current) {
      const homeLogo = document.querySelector("[data-hero-logo]");
      if (isOnScreen(homeLogo)) flyLogo(logoRef.current, homeLogo);
    }
    setOpen(false);
  };

  const handleShare = async () => {
    if (!content || sharing) return;
    setSharing(true);
    const multi = content.verses.length > 1;
    const result = await shareVerseImages(
      pages.map((pg) => ({
        text: pg.verses
          .map((v) => (multi ? `${toSuperscript(v.number)}${cleanText(v.text)}` : cleanText(v.text)))
          .join(" "),
        reference: pg.reference,
      })),
      content.version
    );
    setSharing(false);
    if (result === "copied") {
      toast({ title: t("Copied to clipboard", "Copiado al portapapeles") });
    } else if (result === "failed") {
      toast({ title: t("Couldn't share right now", "No se pudo compartir ahora"), variant: "destructive" });
    }
  };

  const onSlidesScroll = () => {
    const el = slidesRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / (el.clientWidth || 1));
    if (i !== pageIndex) setPageIndex(i);
  };

  if (!content) return null;

  const multi = content.verses.length > 1;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      {/* Full-screen takeover: the canyon photo, blurred (the frosted glass),
          with the white logo and the verse straight on top. shadcn's
          DialogContent is a centered, sized card, so its sizing/translate
          defaults are unwound to fill the screen. Styles: .verse-dialog* in
          index.css. */}
      <DialogContent
        showCloseButton={false}
        className="verse-dialog fixed inset-0 top-0 left-0 z-[80] flex h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 flex-col items-center gap-0 overflow-hidden rounded-none border-0 p-0 shadow-none"
        aria-describedby={undefined}
        // Radix focuses the first focusable child on open, which drew a focus
        // ring around the close button the moment the popup appeared.
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        {/* Frosted glass: blurred photo + milky tint + light sheen + fine grain */}
        <div className="verse-dialog-photo" aria-hidden="true" />
        <div className="verse-dialog-tint" aria-hidden="true" />
        <div className="verse-dialog-grain" aria-hidden="true" />

        {/* Above everything else in the popup, so long verse text can never
            sit on top of it and swallow the tap. */}
        <button
          type="button"
          onClick={close}
          // Offset by the safe-area inset so it clears the notch / status bar.
          className="verse-dialog-close absolute right-4 top-[calc(env(safe-area-inset-top)+0.75rem)] z-30 p-2 text-white outline-none ring-0 [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:outline-none"
          aria-label={t("Close", "Cerrar")}
        >
          <X className="h-7 w-7" />
        </button>

        <div
          className="verse-dialog-text relative z-10 flex h-full w-full flex-col items-center text-center text-white"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 4rem)", paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
        >
          <img
            ref={logoRef}
            data-verse-popup-logo
            src="/cne_logo_white.png"
            alt=""
            width={1000}
            height={598}
            className="-my-4 h-auto w-[160px] shrink-0"
          />


          {/* One slide per picture; swipe sideways when there are several. */}
          <div
            ref={slidesRef}
            onScroll={onSlidesScroll}
            data-swipe-lock="true"
            className="mt-6 flex min-h-0 w-full flex-1 overflow-x-auto overflow-y-hidden"
            style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
          >
            {pages.map((pg, idx) => {
              const length = pg.verses.reduce((n, v) => n + v.text.length, 0);
              const textSize = length > 330 ? "text-lg" : length > 200 ? "text-xl" : "text-2xl sm:text-3xl";
              return (
                <div
                  key={idx}
                  className="flex h-full w-full shrink-0 flex-col items-center justify-center overflow-y-auto px-8"
                  style={{ scrollSnapAlign: "center", scrollSnapStop: "always" }}
                >
                  <blockquote className={`serif-heading ${textSize} leading-relaxed`}>
                    &ldquo;
                    {pg.verses.map((v, i) => (
                      <span key={v.number}>
                        {multi && <sup className="mr-0.5 text-[0.55em] font-semibold text-white/75">{v.number}</sup>}
                        {cleanText(v.text)}
                        {i < pg.verses.length - 1 ? " " : ""}
                      </span>
                    ))}
                    &rdquo;
                  </blockquote>
                  <p className="mt-5 text-base font-semibold text-white/95">
                    {pg.reference}
                    <span className="ml-2 font-normal uppercase tracking-wider text-white/70">
                      {content.version.toUpperCase()}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>

          {pages.length > 1 && (
            <div className="mt-3 flex shrink-0 flex-col items-center gap-2">
              <div className="flex gap-1.5">
                {pages.map((_, i) => (
                  <span
                    key={i}
                    className={`block h-1.5 rounded-full transition-all duration-300 ${i === pageIndex ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
                  />
                ))}
              </div>
              <span className="text-xs text-white/80">
                {t(`Image ${pageIndex + 1} of ${pages.length} — swipe to see all`, `Imagen ${pageIndex + 1} de ${pages.length} — desliza para verlas`)}
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            className="hero-live-btn mt-5 flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-base font-semibold text-white disabled:opacity-70"
          >
            <Share className="h-4 w-4" />
            {pages.length > 1
              ? t(`Share all (${pages.length})`, `Compartir todas (${pages.length})`)
              : t("Share", "Compartir")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
