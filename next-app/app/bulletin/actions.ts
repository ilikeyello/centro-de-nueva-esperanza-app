"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, churchOrgId } from "../../lib/churchEnv";

export async function createBulletinPost(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const authorName = String(formData.get("authorName") ?? "").trim();

  if (!title || !content) {
    return { ok: false as const, error: "Title and content are required." };
  }

  if (!churchOrgId) {
    return { ok: false as const, error: "Church org ID is missing." };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return { ok: false as const, error: "Supabase env vars are missing." };
  }

  const { error } = await supabase.from("bulletin_posts").insert({
    organization_id: churchOrgId,
    title,
    content,
    author_name: authorName || "Anonymous",
    author_id: null,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  revalidatePath("/bulletin");
  return { ok: true as const };
}
