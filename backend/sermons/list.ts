import { api } from "encore.dev/api";
import db from "../db";

interface Sermon {
  id: number;
  title: string;
  youtubeUrl: string;
  createdAt: Date;
}

interface ListSermonsResponse {
  sermons: Sermon[];
}

export const list = api<void, ListSermonsResponse>(
  { expose: true, method: "GET", path: "/sermons/recent" },
  async () => {
    const rows: Sermon[] = [];

    for await (const row of db.query<Sermon>`
      SELECT id, title, youtube_url AS "youtubeUrl", created_at AS "createdAt"
      FROM sermons
      ORDER BY created_at DESC, id DESC
      LIMIT 10
    `) {
      rows.push(row);
    }

    return { sermons: rows };
  }
);
