import { supabase } from "@/lib/supabase";

export type PortfolioItem = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  markdown: string;
  author?: string;
  updatedAt: string;
};

export function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[>#*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseTags(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );
}

function mapRowToItem(row: any): PortfolioItem {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary ?? "",
    tags: Array.isArray(row.tags) ? row.tags : [],
    markdown: row.markdown ?? "",
    author: row.author ?? "",
    updatedAt: row.updated_at ?? row.created_at ?? new Date().toISOString(),
  };
}

async function getCurrentUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function loadPortfolioItems() {
  const { data, error } = await supabase
    .from("portfolio_items")
    .select("id, title, summary, tags, markdown, author, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error || !data) return [] as PortfolioItem[];
  return data.map(mapRowToItem);
}

export async function upsertPortfolioItem(payload: PortfolioItem) {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("ログインが必要です");
  }

  const { data, error } = await supabase
    .from("portfolio_items")
    .upsert(
      {
        id: payload.id,
        user_id: userId,
        title: payload.title,
        summary: payload.summary,
        tags: payload.tags,
        markdown: payload.markdown,
        author: payload.author ?? "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select("id, title, summary, tags, markdown, author, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "保存に失敗しました");
  }

  return mapRowToItem(data);
}

export async function deletePortfolioItem(id: string) {
  const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function getPortfolioItemById(id: string) {
  const { data, error } = await supabase
    .from("portfolio_items")
    .select("id, title, summary, tags, markdown, author, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapRowToItem(data);
}
