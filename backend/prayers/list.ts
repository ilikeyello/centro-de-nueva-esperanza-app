import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface ListPrayersRequest {
  limit: Query<number>;
}

export interface Prayer {
  id: number;
  title: string;
  description: string;
  isAnonymous: boolean;
  userId: string;
  userName: string | null;
  prayerCount: number;
  createdAt: Date;
  userPrayed: boolean;
}

interface ListPrayersResponse {
  prayers: Prayer[];
}

// Lists prayer requests, ordered by most recent.
export const list = api<ListPrayersRequest, ListPrayersResponse>(
  { expose: true, method: "GET", path: "/prayers" },
  async (req) => {
    const limit = req.limit || 50;
    const prayers = await db.queryAll<Prayer>`
      SELECT 
        id, 
        title, 
        description, 
        is_anonymous as "isAnonymous", 
        user_id as "userId",
        user_name as "userName", 
        prayer_count as "prayerCount", 
        created_at as "createdAt",
        false as "userPrayed"
      FROM prayer_requests
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return { prayers };
  }
);
