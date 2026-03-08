import { supabase } from "@/lib/supabase";

export async function fetchActivityDays() {
  const { data, error } = await supabase
    .from("activity_days")
    .select("id, date, created_at, updated_at")
    .order("date", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function addActivityDay(date: string) {
  const { data, error } = await supabase
    .from("activity_days")
    .insert([{ date }])
    .select();
  if (error) throw new Error(error.message);
  return data?.[0];
}

export async function deleteActivityDay(id: string) {
  const { error } = await supabase
    .from("activity_days")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}
