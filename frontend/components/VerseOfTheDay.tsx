import { useCallback, useEffect, useState } from "react";
import { BookOpen, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../contexts/LanguageContext";
import { getVerseOfTheDay, type DailyVerse } from "../lib/verseOfTheDay";

/** Remembers which verse the popup last showed, so it appears once per new verse. */
const LAST_SEEN_KEY = "cne:verse:lastSeen";

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

function VerseBody({ verse }: { verse: DailyVerse }) {
  const { t, language } = useLanguage();
  const note = language === "en" ? verse.noteEn : verse.noteEs;

  return (
    <>
      <blockquote className="serif-heading text-lg leading-relaxed text-[--ink-dark] sm:text-xl">
        &ldquo;{verse.text}&rdquo;
      </blockquote>
      <p className="mt-3 text-sm font-semibold text-[--sage]">
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

/** The card that sits on the home page between Upcoming Event and Quick Actions. */
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

/**
 * Shown once each time the verse changes — i.e. the first time the app is
 * opened on a new day. Dismissing (or simply seeing it) records the date, so it
 * won't reappear until tomorrow's verse.
 */
export function VerseOfTheDayDialog({ verse }: { verse: DailyVerse | null }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!verse) return;
    let lastSeen: string | null = null;
    try {
      lastSeen = window.localStorage.getItem(LAST_SEEN_KEY);
    } catch {
      // Storage unavailable (private mode) — show it, just don't remember.
    }
    if (lastSeen === verse.dateKey) return;

    setOpen(true);
    try {
      window.localStorage.setItem(LAST_SEEN_KEY, verse.dateKey);
    } catch {
      // ignore
    }
  }, [verse]);

  if (!verse) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-md border-[--border-color] bg-[--surface] p-0 [&>button]:hidden"
        aria-describedby={undefined}
      >
        <div className="relative p-6">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-full p-1 text-[--ink-mid] transition-colors hover:bg-[--surface-mid] hover:text-[--ink-dark]"
            aria-label={t("Close", "Cerrar")}
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[--sage]" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[--sage]">
              {t("Verse of the Day", "Versículo del Día")}
            </h2>
          </div>
          <div className="mt-4">
            <VerseBody verse={verse} />
          </div>
          <Button onClick={() => setOpen(false)} className="warm-button-primary mt-6 w-full px-4 py-2">
            {t("Amen", "Amén")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
