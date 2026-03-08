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
