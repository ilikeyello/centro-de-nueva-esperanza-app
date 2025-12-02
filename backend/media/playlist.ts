import { api, APIError } from "encore.dev/api";
import db from "../db";
import { sendNotificationInternal } from "../notifications/notifications";

// Simple in-memory storage to avoid database permission issues
let playlistUrl: string | null = null;

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
    if (!url.includes("youtube.com/playlist") && !url.includes("youtube.com/embed/videoseries")) {
      throw APIError.invalidArgument("URL must be a YouTube playlist link");
    }

    // Extract playlist ID and session ID and convert to embed format
    let embedUrl = url;
    if (url.includes("youtube.com/playlist")) {
      const listMatch = url.match(/[?&]list=([^&]+)/);
      const siMatch = url.match(/[?&]si=([^&]+)/);
      
      if (listMatch) {
        const playlistId = listMatch[1];
        const sessionId = siMatch ? siMatch[1] : '';
        
        // Create embed URL matching YouTube's exact format
        embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
        if (sessionId) {
          embedUrl += `&si=${sessionId}`;
        }
      }
    }

    playlistUrl = embedUrl;

    // Send push notification when livestream playlist is updated
    try {
      await sendNotificationInternal({
        title: "🔴 We're Live!",
        body: "Join our livestream now - we're broadcasting live!",
        icon: "/cne-app/icon-192x192.png",
        tag: `livestream-${Date.now()}`,
        data: {
          type: "livestream",
          status: "live",
          url: embedUrl
        }
      });
    } catch (error) {
      console.error("Failed to send push notification for livestream:", error);
    }

    return { success: true, url: embedUrl };
  }
);

export const get = api<void, GetPlaylistResponse>(
  { expose: true, method: "GET", path: "/playlist" },
  async () => {
    return { url: playlistUrl };
  }
);
