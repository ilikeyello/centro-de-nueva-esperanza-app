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

    // Extract playlist ID and convert to embed URL
    let embedUrl = req.url.trim();
    const match = embedUrl.match(/[?&]list=([^&]+)/);
    if (match) {
      const playlistId = match[1];
      embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
    }

    // First try to update if the column exists
    try {
      await db.exec`
        UPDATE church_info 
        SET playlist_url = ${embedUrl}
        WHERE id = 1
      `;
    } catch (error: any) {
      // If the column doesn't exist, add it first
      if (error.message && error.message.includes('playlist_url')) {
        await db.exec`
          ALTER TABLE church_info 
          ADD COLUMN playlist_url TEXT
        `;
        // Now try the update again
        await db.exec`
          UPDATE church_info 
          SET playlist_url = ${embedUrl}
          WHERE id = 1
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
        SELECT playlist_url as url
        FROM church_info
        WHERE id = 1
      `;
      
      return { url: result?.url || null };
    } catch (error: any) {
      // If the column doesn't exist, return null
      if (error.message && error.message.includes('playlist_url')) {
        return { url: null };
      }
      throw error;
    }
  }
);
