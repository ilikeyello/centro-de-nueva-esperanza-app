import { api } from "encore.dev/api";
import { config } from "encore.dev/config";
import { log } from "encore.dev/log";

// Simple in-memory storage for the playlist URL
// In production, you might want to use a database
let playlistUrl: string | null = null;

export const save = api(
  { method: "POST", path: "/playlist", auth: false },
  async ({ passcode, url }: { passcode: string; url: string }) => {
    // Verify passcode (you should use a more secure method in production)
    const expectedPasscode = config("ADMIN_PASSCODE") || "cneadmin2024";
    
    if (passcode !== expectedPasscode) {
      log.error("Invalid passcode provided for playlist save");
      throw new Error("Invalid passcode");
    }

    if (!url || url.trim().length === 0) {
      throw new Error("URL is required");
    }

    // Validate YouTube playlist URL
    if (!url.includes("youtube.com/embed/videoseries")) {
      throw new Error("Invalid YouTube playlist URL format");
    }

    playlistUrl = url.trim();
    log.info("Playlist URL updated successfully");
    
    return { success: true, url: playlistUrl };
  }
);

export const get = api(
  { method: "GET", path: "/playlist", auth: false },
  async () => {
    return { url: playlistUrl };
  }
);
