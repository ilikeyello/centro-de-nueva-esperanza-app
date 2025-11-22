import { APIError, api } from "encore.dev/api";
import db from "../db";

export interface BulletinComment {
  id: number;
  postId: number | null;
  prayerId: number | null;
  authorName: string;
  content: string;
  createdAt: Date;
}

interface CreateCommentRequest {
  targetType: "post" | "prayer";
  targetId: number;
  authorName: string;
  content: string;
}

export const createComment = api<CreateCommentRequest, BulletinComment>(
  { expose: true, method: "POST", path: "/bulletin/comments" },
  async (req) => {
    const authorName = req.authorName?.trim();
    const content = req.content?.trim();

    if (!authorName) {
      throw APIError.invalidArgument("authorName is required");
    }
    if (!content) {
      throw APIError.invalidArgument("content is required");
    }
    if (!["post", "prayer"].includes(req.targetType)) {
      throw APIError.invalidArgument("targetType must be 'post' or 'prayer'");
    }

    if (req.targetType === "post") {
      const exists = await db.queryRow<{ id: number }>`
        SELECT id
        FROM bulletin_posts
        WHERE id = ${req.targetId}
      `;
      if (!exists) {
        throw APIError.notFound("post not found");
      }
    } else {
      const exists = await db.queryRow<{ id: number }>`
        SELECT id
        FROM prayer_requests
        WHERE id = ${req.targetId}
      `;
      if (!exists) {
        throw APIError.notFound("prayer request not found");
      }
    }

    const comment = await db.queryRow<BulletinComment>`
      INSERT INTO bulletin_comments (post_id, prayer_id, author_name, content)
      VALUES (
        ${req.targetType === "post" ? req.targetId : null},
        ${req.targetType === "prayer" ? req.targetId : null},
        ${authorName},
        ${content}
      )
      RETURNING
        id,
        post_id as "postId",
        prayer_id as "prayerId",
        author_name as "authorName",
        content,
        created_at as "createdAt"
    `;

    return comment!;
  }
);
