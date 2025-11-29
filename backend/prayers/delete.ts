import { APIError, api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface DeletePrayerRequest {
  id: number;
  passcode: Query<string>;
}

interface DeletePrayerResponse {
  success: true;
}

const ADMIN_PASSCODE = "78598";

export const remove = api<DeletePrayerRequest, DeletePrayerResponse>(
  { expose: true, method: "DELETE", path: "/prayers/:id" },
  async (req) => {
    if (!req.passcode || req.passcode !== ADMIN_PASSCODE) {
      throw APIError.permissionDenied("invalid passcode");
    }

    const deletedPrayer = await db.queryRow<{ id: number }>`
      DELETE FROM prayer_requests
      WHERE id = ${req.id}
      RETURNING id
    `;

    if (!deletedPrayer) {
      throw APIError.notFound("prayer request not found");
    }

    return { success: true };
  }
);
