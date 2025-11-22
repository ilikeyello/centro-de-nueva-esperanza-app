import { api, APIError } from "encore.dev/api";

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

    playlistUrl = url;
  }
);

export const get = api<void, GetPlaylistResponse>(
  { expose: true, method: "GET", path: "/playlist" },
  async () => {
    return { url: playlistUrl };
  }
);
