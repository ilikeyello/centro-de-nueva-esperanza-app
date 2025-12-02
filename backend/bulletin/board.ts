import { api } from "encore.dev/api";
import db from "../db";

export interface BulletinComment {
  id: number;
  authorName: string;
  content: string;
  createdAt: Date;
}

export interface BulletinPost {
  id: number;
  title: string;
  content: string;
  authorName: string;
  createdAt: Date;
  comments: BulletinComment[];
  imageUrl: string | null;
}

export interface PrayerWithComments {
  id: number;
  title: string;
  description: string;
  isAnonymous: boolean;
  userId: string;
  userName: string | null;
  prayerCount: number;
  createdAt: Date;
  comments: BulletinComment[];
}

export interface BoardResponse {
  prayers: PrayerWithComments[];
  posts: BulletinPost[];
}

export const board = api<void, BoardResponse>(
  { expose: true, method: "GET", path: "/bulletin/board" },
  async () => {
    const prayers = await db.queryAll<Omit<PrayerWithComments, "comments">>`
      SELECT
        id,
        title,
        description,
        is_anonymous as "isAnonymous",
        user_id as "userId",
        user_name as "userName",
        prayer_count as "prayerCount",
        created_at as "createdAt"
      FROM prayer_requests
      ORDER BY created_at DESC
    `;

    const prayerComments = await db.queryAll<
      BulletinComment & { prayerId: number }
    >`
      SELECT
        id,
        prayer_id as "prayerId",
        author_name as "authorName",
        content,
        created_at as "createdAt"
      FROM bulletin_comments
      WHERE prayer_id IS NOT NULL
      ORDER BY created_at ASC
    `;

    const commentsByPrayer = new Map<number, BulletinComment[]>();
    for (const comment of prayerComments) {
      const list = commentsByPrayer.get(comment.prayerId) ?? [];
      list.push({
        id: comment.id,
        authorName: comment.authorName,
        content: comment.content,
        createdAt: comment.createdAt,
      });
      commentsByPrayer.set(comment.prayerId, list);
    }

    const posts = await db.queryAll<Omit<BulletinPost, "comments">>`
      SELECT
        id,
        title,
        content,
        author_name as "authorName",
        created_at as "createdAt",
        image_url as "imageUrl"
      FROM bulletin_posts
      ORDER BY created_at DESC
    `;

    const postComments = await db.queryAll<
      BulletinComment & { postId: number }
    >`
      SELECT
        id,
        post_id as "postId",
        author_name as "authorName",
        content,
        created_at as "createdAt"
      FROM bulletin_comments
      WHERE post_id IS NOT NULL
      ORDER BY created_at ASC
    `;

    const commentsByPost = new Map<number, BulletinComment[]>();
    for (const comment of postComments) {
      const list = commentsByPost.get(comment.postId) ?? [];
      list.push({
        id: comment.id,
        authorName: comment.authorName,
        content: comment.content,
        createdAt: comment.createdAt,
      });
      commentsByPost.set(comment.postId, list);
    }

    return {
      prayers: prayers.map((prayer) => ({
        ...prayer,
        comments: commentsByPrayer.get(prayer.id) ?? [],
      })),
      posts: posts.map((post) => ({
        ...post,
        comments: commentsByPost.get(post.id) ?? [],
      })),
    };
  }
);
