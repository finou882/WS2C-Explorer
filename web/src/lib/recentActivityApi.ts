import { supabase } from "@/lib/supabase";

export async function fetchRecentActivityDays(days: number = 7) {
  // 今日からdays日後まで
  const today = new Date();
  const to = new Date(today);
  to.setDate(today.getDate() + (days - 1));
  const fromStr = today.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("activity_days")
    .select("date")
    .gte("date", fromStr)
    .lte("date", toStr)
    .order("date", { ascending: true });
  if (error) throw new Error(error.message);
  return data?.map((d) => d.date) ?? [];
}

export type NextActivityDay = {
  id: string;
  date: string;
  use: string | null;
  about: string | null;
};

export async function fetchNextActivityDay(): Promise<NextActivityDay | null> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("activity_days")
    .select("id, date, use, about")
    .gte("date", today)
    .order("date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    date: data.date,
    use: data.use ?? null,
    about: data.about ?? null,
  };
}
