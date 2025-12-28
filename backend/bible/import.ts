import { api, APIError } from "encore.dev/api";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import db from "../db";

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

interface ImportRequest {
  translation: string;
  directory: string;
}

interface ImportResponse {
  imported: number;
}

export const importTranslation = api<ImportRequest, ImportResponse>(
  { expose: true, method: "POST", path: "/bible/import", auth: false },
  async (req) => {
    const { translation, directory } = req;

    if (!translation || !directory) {
      throw APIError.invalidArgument("translation and directory are required");
    }

    const entries = await readdir(directory, { withFileTypes: true });
    const usfmFiles = entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".usfm"))
      .map((e) => path.join(directory, e.name));

    if (usfmFiles.length === 0) {
      throw APIError.invalidArgument("No .usfm files found in directory");
    }

    let total = 0;

    for (const filePath of usfmFiles) {
      const contents = await readFile(filePath, "utf8");
      const verses = parseUsfmFile(contents);

      for (const v of verses) {
        await db.exec`
          INSERT INTO bible_verses (translation, book, chapter, verse, text)
          VALUES (${translation}, ${v.book}, ${v.chapter}, ${v.verse}, ${v.text})
          ON CONFLICT (translation, book, chapter, verse)
          DO UPDATE SET text = EXCLUDED.text
        `;
        total++;
      }
    }

    return { imported: total };
  }
);

function stripUsfmInline(text: string): string {
  let t = text;
  // Remove footnotes and crossrefs blocks: \f ... \f* and \x ... \x*
  t = t.replace(/\\f[\s\S]*?\\f\*/g, "");
  t = t.replace(/\\x[\s\S]*?\\x\*/g, "");

  // Remove Strong's numbers and other character style markers like \add, \wj, \em, \bd, etc.
  t = t.replace(/\\[a-z0-9]+\s*/gi, "");
  t = t.replace(/\|strong="[^"]*"\*/g, "");
  t = t.replace(/\|[^|]*\*/g, "");
  
  // Remove word markers like \+w
  t = t.replace(/\\[+][a-z]*\s*/gi, "");

  // Collapse whitespace
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

interface ParsedVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
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
