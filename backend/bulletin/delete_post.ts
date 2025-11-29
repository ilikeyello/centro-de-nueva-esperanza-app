import { APIError, api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface DeletePostRequest {
  id: number;
  passcode: Query<string>;
}

interface DeletePostResponse {
  success: true;
}

const ADMIN_PASSCODE = "78598";

export const removePost = api<DeletePostRequest, DeletePostResponse>(
  { expose: true, method: "DELETE", path: "/bulletin/posts/:id" },
  async (req) => {
    if (!req.passcode || req.passcode !== ADMIN_PASSCODE) {
      throw APIError.permissionDenied("invalid passcode");
    }

    const deletedPost = await db.queryRow<{ id: number }>`
      DELETE FROM bulletin_posts
      WHERE id = ${req.id}
      RETURNING id
    `;

    if (!deletedPost) {
      throw APIError.notFound("post not found");
    }

    return { success: true };
  }
);
