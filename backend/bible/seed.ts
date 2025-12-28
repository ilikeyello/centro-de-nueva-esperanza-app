import { api, APIError } from "encore.dev/api";
import db from "../db";

interface SeedRequest {
  passcode: string;
}

interface SeedResponse {
  seeded: number;
}

export const seedBibleData = api<SeedRequest, SeedResponse>(
  { expose: true, method: "POST", path: "/bible/seed", auth: false },
  async (req) => {
    if (req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }

    // Seed some key verses from John 3 for testing
    const verses = [
      { book: "john", chapter: 3, verse: 16, text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
      { book: "john", chapter: 3, verse: 17, text: "For God sent not his Son into the world to condemn the world; but that the world through him might be saved." },
      { book: "john", chapter: 3, verse: 18, text: "He that believeth on him is not condemned: but he that believeth not is condemned already, because he hath not believed in the name of the only begotten Son of God." },
    ];

    let total = 0;

    for (const translation of ["kjv", "rv1909", "spnbes"]) {
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

    return { seeded: total };
  }
);
