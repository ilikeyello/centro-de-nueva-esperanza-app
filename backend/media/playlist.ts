import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import db from "../db";

// Simple in-memory storage to avoid database permission issues
let playlistUrl: string | null = null;

const youtubeApiKey = secret("Youtubekey");

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

    return { success: true, url: embedUrl };
  }
);

export const get = api<void, GetPlaylistResponse>(
  { expose: true, method: "GET", path: "/playlist" },
  async () => {
    return { url: playlistUrl };
  }
);

interface PlaylistItem {
  id: string;
  title: string;
  channelTitle: string;
  position: number;
}

interface PlaylistItemsResponse {
  items: PlaylistItem[];
}

export const getItems = api<void, PlaylistItemsResponse>(
  { expose: true, method: "GET", path: "/playlist/items" },
  async () => {
    if (!playlistUrl) {
      return { items: [] };
    }

    // Extract playlist ID from the stored embed URL
    const listMatch = playlistUrl.match(/[?&]list=([^&]+)/);
    const playlistId = listMatch ? listMatch[1] : null;
    if (!playlistId) {
      return { items: [] };
    }

    const key = youtubeApiKey();
    if (!key) {
      console.error("YouTube API key is not configured");
      return { items: [] };
    }

    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet,contentDetails");
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("key", key);

    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        console.error("YouTube API error", res.status, res.statusText);
        return { items: [] };
      }

      const data: any = await res.json();
      const rawItems: any[] = Array.isArray(data.items) ? data.items : [];

      const items: PlaylistItem[] = rawItems
        .map((it: any, index: number) => {
          const snippet = it.snippet || {};
          const contentDetails = it.contentDetails || {};
          const videoId = contentDetails.videoId || snippet.resourceId?.videoId;
          const title = snippet.title as string | undefined;
          const channelTitle = (snippet.videoOwnerChannelTitle || snippet.channelTitle || "") as string;
          const position = typeof snippet.position === "number" ? snippet.position : index;

          return {
            id: videoId,
            title: title || "",
            channelTitle,
            position,
          } as PlaylistItem;
        })
        .filter((it) =>
          it.id && it.title &&
          it.title.toLowerCase() !== "private video" &&
          it.title.toLowerCase() !== "deleted video"
        );

      return { items };
    } catch (err) {
      console.error("Failed to fetch YouTube playlist items", err);
      return { items: [] };
    }
  }
);
