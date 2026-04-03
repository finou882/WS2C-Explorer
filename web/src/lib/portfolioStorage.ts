export type PortfolioItem = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  markdown: string;
  updatedAt: string;
};

const STORAGE_KEY = "portfolio-items-v1";

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

export function loadPortfolioItems() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [] as PortfolioItem[];
  try {
    const parsed = JSON.parse(saved) as PortfolioItem[];
    if (!Array.isArray(parsed)) return [] as PortfolioItem[];
    return parsed;
  } catch {
    return [] as PortfolioItem[];
  }
}

export function savePortfolioItems(items: PortfolioItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function upsertPortfolioItem(payload: PortfolioItem) {
  const items = loadPortfolioItems();
  const exists = items.some((item) => item.id === payload.id);
  const next = exists
    ? items.map((item) => (item.id === payload.id ? payload : item))
    : [payload, ...items];
  savePortfolioItems(next);
  return next;
}

export function deletePortfolioItem(id: string) {
  const next = loadPortfolioItems().filter((item) => item.id !== id);
  savePortfolioItems(next);
  return next;
}

export function getPortfolioItemById(id: string) {
  return loadPortfolioItems().find((item) => item.id === id) ?? null;
}
