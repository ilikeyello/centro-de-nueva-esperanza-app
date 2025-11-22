import { api, APIError } from "encore.dev/api";
import db from "../db";

interface UpdateLivestreamRequest {
  passcode: string;
  url: string;
}

export const update = api<UpdateLivestreamRequest, void>(
  { expose: true, method: "POST", path: "/livestream" },
  async (req) => {
    if (req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }

    // First try to update if the column exists
    try {
      await db.exec`
        UPDATE church_info 
        SET livestream_url = ${req.url.trim()}
        WHERE id = 1
      `;
    } catch (error: any) {
      // If the column doesn't exist, add it first
      if (error.message && error.message.includes('livestream_url')) {
        await db.exec`
          ALTER TABLE church_info 
          ADD COLUMN livestream_url TEXT
        `;
        // Now try the update again
        await db.exec`
          UPDATE church_info 
          SET livestream_url = ${req.url.trim()}
          WHERE id = 1
        `;
      } else {
        throw error;
      }
    }
  }
);
