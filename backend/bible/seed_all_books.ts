import { api, APIError } from "encore.dev/api";
import db from "../db";
import { generateCompleteBibleData, BIBLE_BOOKS } from "./bible_data_complete";

interface SeedRequest {
  passcode: string;
}

interface SeedResponse {
  seeded: number;
  books: number;
  chapters: number;
}

export const seedAllBibleBooks = api<SeedRequest, SeedResponse>(
  { expose: true, method: "POST", path: "/bible/seed/all", auth: false },
  async (req) => {
    if (req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }

    let totalVerses = 0;
    const bibleData = generateCompleteBibleData();

    // Clear existing data to avoid conflicts
    await db.exec`DELETE FROM bible_verses`;

    // Insert all verses
    for (const bookData of bibleData) {
      for (const [verseNum, text] of bookData.verses.entries()) {
        await db.exec`
          INSERT INTO bible_verses (translation, book, chapter, verse, text)
          VALUES (${bookData.translation}, ${bookData.book}, ${bookData.chapter}, ${verseNum + 1}, ${text})
        `;
        totalVerses++;
      }
    }

    const totalBooks = BIBLE_BOOKS.length;
    const totalChapters = bibleData.length / 3; // Divided by 3 translations

    return { 
      seeded: totalVerses,
      books: totalBooks,
      chapters: totalChapters
    };
  }
);
