import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface ListAnnouncementsRequest {
  limit: Query<number>;
}

export interface Announcement {
  id: number;
  titleEn: string;
  titleEs: string;
  contentEn: string;
  contentEs: string;
  priority: string;
  createdAt: Date;
  createdBy: string;
}

interface ListAnnouncementsResponse {
  announcements: Announcement[];
}

// Lists church announcements, ordered by priority and date.
export const list = api<ListAnnouncementsRequest, ListAnnouncementsResponse>(
  { expose: true, method: "GET", path: "/announcements" },
  async (req) => {
    const limit = req.limit || 50;
    const announcements = await db.queryAll<Announcement>`
      SELECT 
        id, 
        title_en as "titleEn", 
        title_es as "titleEs", 
        content_en as "contentEn", 
        content_es as "contentEs",
        priority, 
        created_at as "createdAt", 
        created_by as "createdBy"
      FROM announcements
      ORDER BY 
        CASE priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'normal' THEN 3
          WHEN 'low' THEN 4
        END,
        created_at DESC
      LIMIT ${limit}
    `;
    return { announcements };
  }
);
