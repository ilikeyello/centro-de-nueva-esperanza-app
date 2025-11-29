import { api, APIError } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface DeleteEventRequest {
  id: number;
  passcode: Query<string>;
}

interface DeleteEventResponse {
  success: true;
}

export const remove = api<DeleteEventRequest, DeleteEventResponse>(
  { expose: true, method: "DELETE", path: "/events/:id" },
  async (req) => {
    // Check if passcode is correct
    if (!req.passcode || req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }

    await db.exec`
      DELETE FROM events
      WHERE id = ${req.id}
    `;

    return { success: true };
  }
);
