import { api } from "encore.dev/api";
import { BIBLE_BOOKS } from "./bible_data_complete";

export interface BibleBook {
  id: string;
  name: string;
  testament: "OT" | "NT";
  chapters: number;
}

interface BooksResponse {
  books: BibleBook[];
}

export const books = api<void, BooksResponse>(
  { expose: true, method: "GET", path: "/bible/books" },
  async () => {
    return {
      books: BIBLE_BOOKS
    };
  }
);
