import { api, APIError } from "encore.dev/api";
import db from "../db";

interface UpdatePlaylistRequest {
  passcode: string;
  url: string;
}

interface GetPlaylistResponse {
  url: string | null;
}

export const save = api<UpdatePlaylistRequest, void>(
  { expose: true, method: "POST", path: "/playlist" },
  async (req) => {
    if (req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }

    const url = req.url.trim();
    if (!url.includes("youtube.com/embed/videoseries")) {
      throw APIError.invalidArgument("URL must be a YouTube playlist embed link");
    }

    // Try to update/insert playlist URL
    try {
      // First try to update existing record
      await db.exec`
        UPDATE playlist_config 
        SET url = ${url}, updated_at = NOW()
        WHERE id = 1
      `;
    } catch (error: any) {
      // If table doesn't exist, create it
      if (error.message && (error.message.includes('playlist_config') || error.message.includes('relation'))) {
        await db.exec`
          CREATE TABLE IF NOT EXISTS playlist_config (
            id INTEGER PRIMARY KEY DEFAULT 1,
            url TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `;
        // Insert the first record
        await db.exec`
          INSERT INTO playlist_config (id, url)
          VALUES (1, ${url})
          ON CONFLICT (id) DO UPDATE SET
            url = excluded.url,
            updated_at = NOW()
        `;
      } else {
        throw error;
      }
    }
  }
);

export const get = api<void, GetPlaylistResponse>(
  { expose: true, method: "GET", path: "/playlist" },
  async () => {
    try {
      const result = await db.queryRow<{ url: string | null }>`
        SELECT url FROM playlist_config WHERE id = 1
      `;
      return { url: result?.url || null };
    } catch (error: any) {
      // If table doesn't exist, return null
      if (error.message && (error.message.includes('playlist_config') || error.message.includes('relation'))) {
        return { url: null };
      }
      throw error;
    }
  }
);
