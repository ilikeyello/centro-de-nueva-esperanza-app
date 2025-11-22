import { api } from "encore.dev/api";
import db from "../db";

interface CreatePrayerRequest {
  title: string;
  description: string;
  isAnonymous: boolean;
  authorName?: string | null;
}

interface Prayer {
  id: number;
  title: string;
  description: string;
  isAnonymous: boolean;
  userId: string;
  userName: string | null;
  prayerCount: number;
  createdAt: Date;
}

const PUBLIC_USER_ID = "public-user";
const FALLBACK_DISPLAY_NAME = "Guest";

// Submits a new prayer request.
export const create = api<CreatePrayerRequest, Prayer>(
  { expose: true, method: "POST", path: "/prayers" },
  async (req) => {
    const trimmedName = req.authorName?.trim() || null;
    const isAnonymous = req.isAnonymous || !trimmedName;

    const prayer = await db.queryRow<Prayer>`
      INSERT INTO prayer_requests (title, description, is_anonymous, user_id, user_name)
      VALUES (${req.title}, ${req.description}, ${isAnonymous}, ${PUBLIC_USER_ID}, ${
        isAnonymous ? null : trimmedName ?? FALLBACK_DISPLAY_NAME
      })
      RETURNING id, title, description, is_anonymous as "isAnonymous", user_id as "userId",
                user_name as "userName", prayer_count as "prayerCount", created_at as "createdAt"
    `;

    return prayer!;
  }
);
