import { api } from "encore.dev/api";
import { randomUUID } from "crypto";
import db from "../db";

interface PrayRequest {
  prayerId: number;
  participantId?: string | null;
}

interface PrayResponse {
  success: boolean;
  prayerCount: number;
}

// Records that a user has prayed for a request.
export const pray = api<PrayRequest, PrayResponse>(
  { expose: true, method: "POST", path: "/prayers/:prayerId/pray" },
  async (req) => {
    const providedId = req.participantId?.trim();
    const userId = providedId && providedId.length > 0 ? providedId : randomUUID();

    await db.exec`
      INSERT INTO prayer_interactions (prayer_id, user_id)
      VALUES (${req.prayerId}, ${userId})
      ON CONFLICT (prayer_id, user_id) DO NOTHING
    `;

    await db.exec`
      UPDATE prayer_requests
      SET prayer_count = (SELECT COUNT(*) FROM prayer_interactions WHERE prayer_id = ${req.prayerId})
      WHERE id = ${req.prayerId}
    `;

    const result = await db.queryRow<{ prayerCount: number }>`
      SELECT prayer_count as "prayerCount"
      FROM prayer_requests
      WHERE id = ${req.prayerId}
    `;

    return { success: true, prayerCount: result?.prayerCount || 0 };
  }
);
