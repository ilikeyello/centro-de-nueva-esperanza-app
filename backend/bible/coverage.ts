import { api, Query } from "encore.dev/api";
import db from "../db";
import { BIBLE_BOOKS } from "./bible_data_complete";

interface CoverageRequest {
  translation?: Query<string>;
}

interface MissingBookCoverage {
  book: string;
  expectedChapters: number;
  presentChapters: number;
  missingChapters: number[];
}

interface CoverageResponse {
  translation: string;
  totalVerses: number;
  booksWithAnyData: number;
  completeBooks: number;
  missingBooks: MissingBookCoverage[];
}

export const coverage = api<CoverageRequest, CoverageResponse>(
  { expose: true, method: "GET", path: "/bible/coverage" },
  async (req) => {
    const translation = String(req.translation ?? "kjv").toLowerCase();

    const [{ count: totalVersesStr } = { count: "0" }] = await db.queryAll<{ count: string }>`
      SELECT COUNT(*)::text AS count
      FROM bible_verses
      WHERE translation = ${translation}
    `;
    const totalVerses = parseInt(totalVersesStr, 10) || 0;

    const rows = await db.queryAll<{ book: string; chapter: number }>`
      SELECT book, chapter
      FROM bible_verses
      WHERE translation = ${translation}
      GROUP BY book, chapter
    `;

    const chaptersByBook = new Map<string, Set<number>>();
    for (const r of rows) {
      const b = String(r.book);
      const c = Number(r.chapter);
      if (!Number.isFinite(c)) continue;
      let set = chaptersByBook.get(b);
      if (!set) {
        set = new Set<number>();
        chaptersByBook.set(b, set);
      }
      set.add(c);
    }

    const missingBooks: MissingBookCoverage[] = [];
    let completeBooks = 0;

    for (const book of BIBLE_BOOKS) {
      const expectedChapters = book.chapters;
      const present = chaptersByBook.get(book.id) ?? new Set<number>();
      const missing: number[] = [];
      for (let c = 1; c <= expectedChapters; c++) {
        if (!present.has(c)) missing.push(c);
      }

      if (missing.length === 0 && present.size > 0) {
        completeBooks++;
      } else {
        missingBooks.push({
          book: book.id,
          expectedChapters,
          presentChapters: present.size,
          missingChapters: missing,
        });
      }
    }

    return {
      translation,
      totalVerses,
      booksWithAnyData: Array.from(chaptersByBook.keys()).length,
      completeBooks,
      missingBooks,
    };
  }
);
