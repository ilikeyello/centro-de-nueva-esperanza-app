import { api, APIError } from "encore.dev/api";
import db from "../db";

interface CreateSermonRequest {
  passcode: string;
  title: string;
  youtubeUrl: string;
}

interface CreateSermonResponse {
  id: number;
}

export const create = api<CreateSermonRequest, CreateSermonResponse>(
  { expose: true, method: "POST", path: "/sermons" },
  async (req) => {
    if (req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }

    const url = req.youtubeUrl.trim();
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      throw APIError.invalidArgument("youtubeUrl must be a YouTube link");
    }

    const row = await db.queryRow<{ id: number }>`
      INSERT INTO sermons (title, youtube_url)
      VALUES (${req.title.trim()}, ${url})
      RETURNING id
    `;

    return { id: row!.id };
  }
);
