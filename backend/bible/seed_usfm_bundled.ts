import { api, APIError } from "encore.dev/api";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "../db";

interface SeedRequest {
  passcode: string;
}

interface SeedResponse {
  imported: number;
  translations: string[];
  sourceDir: string;
}

interface ParsedVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

const USFM_BOOK_TO_ID: Record<string, string> = {
  GEN: "genesis", EXO: "exodus", LEV: "leviticus", NUM: "numbers", DEU: "deuteronomy",
  JOS: "joshua", JDG: "judges", RUT: "ruth", "1SA": "1-samuel", "2SA": "2-samuel",
  "1KI": "1-kings", "2KI": "2-kings", "1CH": "1-chronicles", "2CH": "2-chronicles",
  EZR: "ezra", NEH: "nehemiah", EST: "esther", JOB: "job", PSA: "psalms",
  PRO: "proverbs", ECC: "ecclesiastes", SNG: "song-of-solomon", ISA: "isaiah",
  JER: "jeremiah", LAM: "lamentations", EZK: "ezekiel", DAN: "daniel",
  HOS: "hosea", JOL: "joel", AMO: "amos", OBA: "obadiah", JON: "jonah",
  MIC: "micah", NAM: "nahum", HAB: "habakkuk", ZEP: "zephaniah", HAG: "haggai",
  ZEC: "zechariah", MAL: "malachi", MAT: "matthew", MRK: "mark", LUK: "luke",
  JHN: "john", ACT: "acts", ROM: "romans", "1CO": "1-corinthians", "2CO": "2-corinthians",
  GAL: "galatians", EPH: "ephesians", PHP: "philippians", COL: "colossians",
  "1TH": "1-thessalonians", "2TH": "2-thessalonians", "1TI": "1-timothy",
  "2TI": "2-timothy", TIT: "titus", PHM: "philemon", HEB: "hebrews", JAS: "james",
  "1PE": "1-peter", "2PE": "2-peter", "1JN": "1-john", "2JN": "2-john",
  "3JN": "3-john", JUD: "jude", REV: "revelation",
};

function stripUsfmInline(text: string): string {
  let t = text;
  t = t.replace(/\\f[\s\S]*?\\f\*/g, "");
  t = t.replace(/\\x[\s\S]*?\\x\*/g, "");
  t = t.replace(/\\[a-z0-9]+\s*/gi, "");
  t = t.replace(/\|strong=\"[^\"]*\"\*/g, "");
  t = t.replace(/\|[^|]*\*/g, "");
  t = t.replace(/\\[+][a-z]*\s*/gi, "");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

function parseUsfmFile(contents: string): ParsedVerse[] {
  const lines = contents.split(/\r?\n/);

  let usfmBook: string | null = null;
  let bookId: string | null = null;
  let chapterNum: number | null = null;
  let verseNum: number | null = null;
  let verseBuf = "";

  const out: ParsedVerse[] = [];

  const flushVerse = () => {
    if (!bookId || chapterNum == null || verseNum == null) return;
    const cleaned = stripUsfmInline(verseBuf);
    if (!cleaned) return;
    out.push({ book: bookId, chapter: chapterNum, verse: verseNum, text: cleaned });
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line) continue;

    if (line.startsWith("\\id ")) {
      flushVerse();
      verseBuf = "";
      chapterNum = null;
      verseNum = null;

      const code = line.slice(4).trim().split(/\s+/)[0]?.toUpperCase();
      usfmBook = code || null;
      bookId = code ? USFM_BOOK_TO_ID[code] ?? null : null;
      continue;
    }

    if (line.startsWith("\\c ")) {
      flushVerse();
      verseBuf = "";
      verseNum = null;

      const numStr = line.slice(3).trim().split(/\s+/)[0];
      const n = parseInt(numStr, 10);
      chapterNum = Number.isFinite(n) ? n : null;
      continue;
    }

    if (line.startsWith("\\v ")) {
      flushVerse();
      verseBuf = "";

      const rest = line.slice(3).trim();
      const firstSpace = rest.indexOf(" ");
      const vStr = firstSpace === -1 ? rest : rest.slice(0, firstSpace);
      const v = parseInt(vStr, 10);
      verseNum = Number.isFinite(v) ? v : null;

      const after = firstSpace === -1 ? "" : rest.slice(firstSpace + 1);
      verseBuf = after;
      continue;
    }

    if (verseNum != null) {
      verseBuf += " " + line;
    }
  }

  flushVerse();

  if (usfmBook && !bookId) {
    throw new Error(`Unknown USFM book code: ${usfmBook}`);
  }

  return out;
}

async function collectUsfmFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".usfm"))
    .map((e) => path.join(dir, e.name));
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export const seedUsfmBundled = api<SeedRequest, SeedResponse>(
  { expose: true, method: "POST", path: "/bible/seed/usfm-bundled", auth: false },
  async (req) => {
    if (req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }

    // Expect datasets to be committed into the repo under:
    // backend/bible/usfm_data/kjv
    // backend/bible/usfm_data/rv1909
    // backend/bible/usfm_data/spnbes
    const here = path.dirname(fileURLToPath(import.meta.url));
    const baseDir = path.resolve(here, "usfm_data");

    const translations: Array<{ id: string; dir: string }> = [
      { id: "kjv", dir: path.join(baseDir, "kjv") },
      { id: "rv1909", dir: path.join(baseDir, "rv1909") },
      { id: "spnbes", dir: path.join(baseDir, "spnbes") },
    ];

    // Verify directories exist and have USFM files
    const allFiles: Array<{ translation: string; files: string[] }> = [];
    for (const t of translations) {
      const files = await collectUsfmFiles(t.dir);
      if (files.length === 0) {
        throw APIError.invalidArgument(
          `No .usfm files found for ${t.id}. Expected directory: ${t.dir}`
        );
      }
      allFiles.push({ translation: t.id, files });
    }

    let imported = 0;

    await db.exec`BEGIN`;
    try {
      // Clear existing data for these translations only
      await db.exec`
        DELETE FROM bible_verses
        WHERE translation IN (${"kjv"}, ${"rv1909"}, ${"spnbes"})
      `;

      for (const t of allFiles) {
        for (const filePath of t.files) {
          const contents = await readFile(filePath, "utf8");
          const verses = parseUsfmFile(contents);

          // Bulk insert in chunks using UNNEST for speed
          for (const part of chunk(verses, 1000)) {
            const translationsArr = part.map(() => t.translation);
            const booksArr = part.map((v) => v.book);
            const chaptersArr = part.map((v) => v.chapter);
            const versesArr = part.map((v) => v.verse);
            const textsArr = part.map((v) => v.text);

            await db.exec`
              INSERT INTO bible_verses (translation, book, chapter, verse, text)
              SELECT *
              FROM UNNEST(
                ${translationsArr}::text[],
                ${booksArr}::text[],
                ${chaptersArr}::int[],
                ${versesArr}::int[],
                ${textsArr}::text[]
              )
              ON CONFLICT (translation, book, chapter, verse)
              DO UPDATE SET text = EXCLUDED.text
            `;

            imported += part.length;
          }
        }
      }

      await db.exec`COMMIT`;
    } catch (err) {
      await db.exec`ROLLBACK`;
      throw err;
    }

    return {
      imported,
      translations: translations.map((t) => t.id),
      sourceDir: baseDir,
    };
  }
);
