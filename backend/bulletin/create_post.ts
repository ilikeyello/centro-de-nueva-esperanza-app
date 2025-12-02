import { APIError, api } from "encore.dev/api";
import db from "../db";

export interface BulletinPost {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: Date;
  imageUrl: string | null;
}

interface CreatePostRequest {
  title: string;
  content: string;
  authorName: string;
  imageUrl?: string | null;
}

export const createPost = api<CreatePostRequest, BulletinPost>(
  { expose: true, method: "POST", path: "/bulletin/posts" },
  async (req) => {
    const title = req.title?.trim();
    const content = req.content?.trim();
    const authorName = req.authorName?.trim();
    const imageUrl = req.imageUrl?.trim() || null;

    if (!title) {
      throw APIError.invalidArgument("title is required");
    }
    if (!content) {
      throw APIError.invalidArgument("content is required");
    }
    if (!authorName) {
      throw APIError.invalidArgument("authorName is required");
    }

    const post = await db.queryRow<BulletinPost>`
      INSERT INTO bulletin_posts (title, content, author_name, image_url)
      VALUES (${title}, ${content}, ${authorName}, ${imageUrl})
      RETURNING id, title, content, author_name as "authorName", created_at as "createdAt", image_url as "imageUrl"
    `;

    return post!;
  }
);
