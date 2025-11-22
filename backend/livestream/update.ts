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

    // Allow empty URLs (for erasing) - just store as-is if empty
    let embedUrl = req.url.trim();
    
    if (embedUrl) {
      // Convert YouTube URL to embed format for iframe compatibility
      // Extract video ID from various YouTube URL formats
      if (embedUrl.includes("youtube.com/watch?v=")) {
        const videoId = embedUrl.match(/[?&]v=([^&]+)/);
        if (videoId) {
          embedUrl = `https://www.youtube.com/embed/${videoId[1]}`;
        }
      } else if (embedUrl.includes("youtube.com/live/")) {
        const videoId = embedUrl.match(/\/live\/([^?&]+)/);
        if (videoId) {
          embedUrl = `https://www.youtube.com/embed/${videoId[1]}`;
        }
      } else if (embedUrl.includes("youtu.be/")) {
        const videoId = embedUrl.match(/youtu\.be\/([^?&]+)/);
        if (videoId) {
          embedUrl = `https://www.youtube.com/embed/${videoId[1]}`;
        }
      }
      
      // Add required parameters if not present
      if (embedUrl.includes("youtube.com/embed/") && !embedUrl.includes("enablejsapi=1")) {
        const separator = embedUrl.includes("?") ? "&" : "?";
        embedUrl += `${separator}enablejsapi=1`;
      }
    }

    // First try to update if the column exists
    try {
      await db.exec`
        UPDATE church_info 
        SET livestream_url = ${embedUrl}
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
          SET livestream_url = ${embedUrl}
          WHERE id = 1
        `;
      } else {
        throw error;
      }
    }
  }
);
