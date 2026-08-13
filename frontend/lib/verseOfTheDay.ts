import { supabase, churchOrgId } from "../supabase-client";
import { BOOK_NAMES, YEARLY_VERSES } from "./verseData";

/**
 * Verse of the day.
 *
 * Two sources, in priority order:
 *   1. An admin override in `verses_of_the_day` for today's date (set from the
 *      web dashboard). Lets the pastor pick a verse for a specific Sunday.
 *   2. The built-in YEARLY_VERSES list, indexed by day of the year, so there is
 *      always something to show even offline or if nobody touches the dashboard.
 *
 * The text itself always comes from the Bible JSON already bundled with the app
 * (`public/bible/<version>/<book>.json`), in whichever of the three versions the
 * user last picked on the Bible page. No network call is needed for the text.
 */

/** Same key the Bible page writes, so the two stay in sync automatically. */
const BIBLE_STORAGE_KEY = "cne:bible:selection";

// Matches the Bible page's default — the app opens in Spanish.
const DEFAULT_VERSION = "spnbes";
const VALID_VERSIONS = ["kjv", "rv1909", "spnbes"] as const;
export type BibleVersionId = (typeof VALID_VERSIONS)[number];

export interface VerseReference {
  book: string;
  chapter: number;
  verse: number;
  /** End of an inclusive range (John 3:16-17). Null for a single verse. */
  endVerse: number | null;
  /** Optional admin note shown under the verse. */
  noteEn?: string | null;
  noteEs?: string | null;
  /** True when this came from an admin override rather than the built-in list. */
  isOverride: boolean;
}

export interface DailyVerse extends VerseReference {
  text: string;
  /** "John 3:16" / "Juan 3:16", already localized. */
  referenceEn: string;
  referenceEs: string;
  version: BibleVersionId;
  /** Local YYYY-MM-DD this verse is for; also the popup's "seen" key. */
  dateKey: string;
}

/** Local-time YYYY-MM-DD. Using UTC here would flip the verse mid-evening. */
export function todayKey(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * 0-based day of the year, so Jan 1 is always the first verse in the list.
 * Built from the local Y/M/D via Date.UTC — subtracting raw timestamps would
 * drift by an hour across a DST boundary and skip or repeat a day.
 */
function dayOfYear(date: Date): number {
  const startOfYear = Date.UTC(date.getFullYear(), 0, 1);
  const thisDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((thisDay - startOfYear) / 86_400_000);
}

/** The version the user last selected on the Bible page. */
export function getPreferredVersion(): BibleVersionId {
  try {
    if (typeof window === "undefined") return DEFAULT_VERSION;
    const raw = window.localStorage.getItem(BIBLE_STORAGE_KEY);
    if (!raw) return DEFAULT_VERSION;
    const parsed = JSON.parse(raw);
    const version = parsed?.version;
    return VALID_VERSIONS.includes(version) ? version : DEFAULT_VERSION;
  } catch {
    return DEFAULT_VERSION;
  }
}

/** Parses a `"<book> <chapter>:<verse>"` entry from the built-in list. */
function parseReference(raw: string): VerseReference | null {
  const match = /^(\S+)\s+(\d+):(\d+)$/.exec(raw);
  if (!match) return null;
  return {
    book: match[1],
    chapter: Number(match[2]),
    verse: Number(match[3]),
    endVerse: null,
    isOverride: false,
  };
}

/** Today's reference from the built-in yearly list. */
export function getBuiltInReference(date: Date = new Date()): VerseReference | null {
  const index = ((dayOfYear(date) % YEARLY_VERSES.length) + YEARLY_VERSES.length) % YEARLY_VERSES.length;
  return parseReference(YEARLY_VERSES[index]);
}

/**
 * Looks for an admin-set verse for today. Returns null on any failure — the
 * built-in list is the fallback, so a network blip must never blank the card.
 */
export async function getOverrideReference(date: Date = new Date()): Promise<VerseReference | null> {
  try {
    const { data, error } = await supabase
      .from("verses_of_the_day")
      .select("book, chapter, verse, end_verse, note_en, note_es")
      .eq("organization_id", churchOrgId)
      .eq("verse_date", todayKey(date))
      .maybeSingle();

    if (error || !data?.book) return null;

    return {
      book: data.book,
      chapter: Number(data.chapter),
      verse: Number(data.verse),
      endVerse: data.end_verse != null ? Number(data.end_verse) : null,
      noteEn: data.note_en ?? null,
      noteEs: data.note_es ?? null,
      isOverride: true,
    };
  } catch {
    return null;
  }
}

/** Cache per version+book so switching versions doesn't refetch the same file. */
const bookCache = new Map<string, any>();

async function loadBook(version: BibleVersionId, book: string): Promise<any | null> {
  const key = `${version}/${book}`;
  const cached = bookCache.get(key);
  if (cached) return cached;
  try {
    const response = await fetch(`/bible/${version}/${book}.json`);
    if (!response.ok) return null;
    const data = await response.json();
    bookCache.set(key, data);
    return data;
  } catch {
    return null;
  }
}

/** Pulls the verse (or verse range) text out of the bundled JSON. */
async function readVerseText(
  version: BibleVersionId,
  reference: VerseReference
): Promise<string | null> {
  const data = await loadBook(version, reference.book);
  const chapter = data?.chapters?.find((c: any) => c.number === reference.chapter);
  if (!chapter) return null;

  const last = reference.endVerse ?? reference.verse;
  const parts: string[] = [];
  for (let n = reference.verse; n <= last; n++) {
    const verse = chapter.verses?.find((v: any) => v.number === n);
    if (verse?.text) parts.push(String(verse.text).trim());
  }
  return parts.length > 0 ? parts.join(" ") : null;
}

function formatReference(reference: VerseReference, name: string): string {
  const range = reference.endVerse ? `${reference.verse}-${reference.endVerse}` : `${reference.verse}`;
  return `${name} ${reference.chapter}:${range}`;
}

/**
 * Resolves today's verse end to end: override → built-in fallback, then text in
 * the user's preferred version. Returns null only if nothing at all could be
 * read, so callers can simply hide the card.
 */
export async function getVerseOfTheDay(
  date: Date = new Date(),
  version: BibleVersionId = getPreferredVersion()
): Promise<DailyVerse | null> {
  const override = await getOverrideReference(date);
  const builtIn = getBuiltInReference(date);

  // If an admin typed a reference that doesn't resolve, fall back rather than
  // showing an empty card.
  for (const reference of [override, builtIn]) {
    if (!reference) continue;
    const text = await readVerseText(version, reference);
    if (!text) continue;

    const names = BOOK_NAMES[reference.book] ?? { en: reference.book, es: reference.book };
    return {
      ...reference,
      text,
      referenceEn: formatReference(reference, names.en),
      referenceEs: formatReference(reference, names.es),
      version,
      dateKey: todayKey(date),
    };
  }

  return null;
}
