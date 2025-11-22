import { api, APIError } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface DeleteAnnouncementRequest {
  id: number;
  passcode: Query<string>;
}

interface DeleteAnnouncementResponse {
  success: true;
}

export const remove = api<DeleteAnnouncementRequest, DeleteAnnouncementResponse>(
  { expose: true, method: "DELETE", path: "/announcements/:id" },
  async (req) => {
    // Check if passcode is correct
    if (!req.passcode || req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }

    await db.exec`
      DELETE FROM announcements
      WHERE id = ${req.id}
    `;

    return { success: true };
  }
);
