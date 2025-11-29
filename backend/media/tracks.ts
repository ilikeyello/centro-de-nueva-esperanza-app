import { api } from "encore.dev/api";
import { mediaStorage } from "./storage";

interface TrackItem {
  id: string;
  name: string;
  title: string;
  artist: string;
  url: string;
}

interface ListTracksResponse {
  tracks: TrackItem[];
}

// Lists all audio tracks stored in the media bucket.
export const listTracks = api<void, ListTracksResponse>(
  { expose: true, method: "GET", path: "/media/tracks" },
  async () => {
    const tracks: TrackItem[] = [];

    for await (const entry of mediaStorage.list({})) {
      // Only include audio files (basic check by extension)
      if (!entry.name.toLowerCase().endsWith(".mp3")) continue;

      const filename = entry.name.replace(/^.*[\\/]/, "");
      const withoutExt = filename.replace(/\.[^/.]+$/, "");

      // Remove leading timestamp like "1763178196748-"
      let cleaned = withoutExt.replace(/^\d+-/, "");
      // Remove common downloader prefixes (SpotiDown.App, SpotiDownloader.com, etc.)
      cleaned = cleaned
        .replace(/^SpotiDown\.App\s*-\s*/i, "")
        .replace(/^SpotiDownloader\.com\s*-\s*/i, "");
      // Split into parts by " - " to separate song and artist(s)
      const parts = cleaned.split(" - ").map((p) => p.trim()).filter(Boolean);

      let title = cleaned;
      let artist = "";
      if (parts.length >= 2) {
        title = parts[0];
        artist = parts.slice(1).join(" - ");
      } else if (parts.length === 1) {
        title = parts[0];
      }

      tracks.push({
        id: entry.name,
        name: filename,
        title,
        artist,
        url: mediaStorage.publicUrl(entry.name),
      });
    }

    // Most recent first
    tracks.reverse();

    return { tracks };
  }
);
