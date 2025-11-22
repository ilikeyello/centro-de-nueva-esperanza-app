import { api } from "encore.dev/api";
import db from "../db";

interface GetLivestreamResponse {
  url: string | null;
}

export const get = api<void, GetLivestreamResponse>(
  { expose: true, method: "GET", path: "/livestream" },
  async () => {
    try {
      const result = await db.queryRow<{ url: string | null }>`
        SELECT livestream_url as url
        FROM church_info
        WHERE id = 1
      `;
      
      return { url: result?.url || null };
    } catch (error: any) {
      // If the column doesn't exist, return null
      if (error.message && error.message.includes('livestream_url')) {
        return { url: null };
      }
      throw error;
    }
  }
);
