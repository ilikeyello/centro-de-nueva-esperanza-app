import { api, APIError, Query } from "encore.dev/api";
import db from "../db";

export interface BibleVerse {
  number: number;
  text: string;
}

export interface BibleChapterResponse {
  translation: string;
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

interface ChapterRequest {
  translation: Query<string>;
  book: Query<string>;
  chapter: Query<number>;
}

export const chapter = api<ChapterRequest, BibleChapterResponse>(
  { expose: true, method: "GET", path: "/bible/chapter" },
  async (req) => {
    const translation = String(req.translation ?? "").toLowerCase();
    const book = String(req.book ?? "").toLowerCase();
    const chapterNum = Number(req.chapter);

    if (!translation) {
      throw APIError.invalidArgument("translation is required");
    }
    if (!book) {
      throw APIError.invalidArgument("book is required");
    }
    if (!Number.isFinite(chapterNum) || chapterNum < 1) {
      throw APIError.invalidArgument("chapter must be a positive number");
    }

    const rows = await db.queryAll<{ verse: number; text: string }>`
      SELECT verse, text
      FROM bible_verses
      WHERE translation = ${translation}
        AND book = ${book}
        AND chapter = ${chapterNum}
      ORDER BY verse ASC
    `;

    if (rows.length === 0) {
      throw APIError.notFound("chapter not found");
    }

    return {
      translation,
      book,
      chapter: chapterNum,
      verses: rows.map((r) => ({ number: r.verse, text: r.text })),
    };
  }
);
