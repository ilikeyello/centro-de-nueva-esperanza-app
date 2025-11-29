import { api, APIError } from "encore.dev/api";
import db from "../db";

interface DeleteSermonRequest {
  passcode: string;
  id: number;
}

export const remove = api<DeleteSermonRequest, void>(
  { expose: true, method: "POST", path: "/sermons/delete" },
  async (req) => {
    if (req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }

    await db.exec`
      DELETE FROM sermons
      WHERE id = ${req.id}
    `;
  }
);
