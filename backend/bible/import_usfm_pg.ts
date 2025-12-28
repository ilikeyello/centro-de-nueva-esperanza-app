import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

type TranslationId = "kjv" | "rv1909" | "spnbes";

const USFM_BOOK_TO_ID: Record<string, string> = {
  GEN: "genesis",
  EXO: "exodus",
  LEV: "leviticus",
  NUM: "numbers",
  DEU: "deuteronomy",
  JOS: "joshua",
  JDG: "judges",
  RUT: "ruth",
  "1SA": "1-samuel",
  "2SA": "2-samuel",
  "1KI": "1-kings",
  "2KI": "2-kings",
  "1CH": "1-chronicles",
  "2CH": "2-chronicles",
  EZR: "ezra",
  NEH: "nehemiah",
  EST: "esther",
  JOB: "job",
  PSA: "psalms",
  PRO: "proverbs",
  ECC: "ecclesiastes",
  SNG: "song-of-solomon",
  ISA: "isaiah",
  JER: "jeremiah",
  LAM: "lamentations",
  EZK: "ezekiel",
  DAN: "daniel",
  HOS: "hosea",
  JOL: "joel",
  AMO: "amos",
  OBA: "obadiah",
  JON: "jonah",
  MIC: "micah",
  NAM: "nahum",
  HAB: "habakkuk",
  ZEP: "zephaniah",
  HAG: "haggai",
  ZEC: "zechariah",
  MAL: "malachi",
  MAT: "matthew",
  MRK: "mark",
  LUK: "luke",
  JHN: "john",
  ACT: "acts",
  ROM: "romans",
  "1CO": "1-corinthians",
  "2CO": "2-corinthians",
  GAL: "galatians",
  EPH: "ephesians",
  PHP: "philippians",
  COL: "colossians",
  "1TH": "1-thessalonians",
  "2TH": "2-thessalonians",
  "1TI": "1-timothy",
  "2TI": "2-timothy",
  TIT: "titus",
  PHM: "philemon",
  HEB: "hebrews",
  JAS: "james",
  "1PE": "1-peter",
  "2PE": "2-peter",
  "1JN": "1-john",
  "2JN": "2-john",
  "3JN": "3-john",
  JUD: "jude",
  REV: "revelation",
};

function stripUsfmInline(text: string): string {
  let t = text;
  t = t.replace(/\\f[\s\S]*?\\f\*/g, "");
  t = t.replace(/\\x[\s\S]*?\\x\*/g, "");
  t = t.replace(/\\[a-z0-9]+\s*/gi, "");
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

async function importTranslationFromDir(pool: pg.Pool, translation: TranslationId, dir: string) {
  const entries = await readdir(dir, { withFileTypes: true });
  const usfmFiles = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".usfm"))
    .map((e) => path.join(dir, e.name));

  if (usfmFiles.length === 0) {
    throw new Error(`No .usfm files found in ${dir}`);
  }

  let total = 0;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const filePath of usfmFiles) {
      const contents = await readFile(filePath, "utf8");
      const verses = parseUsfmFile(contents);

      for (const v of verses) {
        await client.query(
          `INSERT INTO bible_verses (translation, book, chapter, verse, text)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (translation, book, chapter, verse)
           DO UPDATE SET text = EXCLUDED.text`,
          [translation, v.book, v.chapter, v.verse, v.text]
        );
        total++;
      }
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }

  return total;
}

async function main() {
  const translation = (process.argv[2] ?? "").toLowerCase() as TranslationId;
  const dir = process.argv[3];

  if (!translation || !dir) {
    console.error(
      "Usage: DATABASE_URL=... bun run bible/import_usfm_pg.ts <translation> <dir>\n" +
        "Example: DATABASE_URL=... bun run bible/import_usfm_pg.ts kjv ./data/kjv_usfm"
    );
    process.exit(2);
  }

  if (translation !== "kjv" && translation !== "rv1909" && translation !== "spnbes") {
    throw new Error(`Unsupported translation: ${translation}`);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const abs = path.resolve(process.cwd(), dir);

  const pool = new pg.Pool({ connectionString: databaseUrl });
  try {
    console.log(`Importing ${translation} from ${abs} ...`);
    const count = await importTranslationFromDir(pool, translation, abs);
    console.log(`Imported/updated ${count} verses for ${translation}.`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
