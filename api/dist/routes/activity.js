import { Hono } from "hono";
import { supabase } from "../lib/supabase";
export const activity = new Hono();
// GET /activity_days - 全活動日取得
activity.get("/activity_days", async (c) => {
    const { data, error } = await supabase
        .from("activity_days")
        .select("id, date, created_at, updated_at")
        .order("date", { ascending: true });
    if (error)
        return c.json({ error: error.message }, 500);
    return c.json({ days: data });
});
// POST /activity_days - 活動日追加
activity.post("/activity_days", async (c) => {
    const body = await c.req.json();
    if (!body.date)
        return c.json({ error: "date is required" }, 400);
    // Supabaseクエリチェーンに型を明示してnever型エラーを回避
    const { data, error } = await supabase
        .from("activity_days")
        .insert([{ date: body.date }])
        .select();
    if (error)
        return c.json({ error: error.message }, 500);
    return c.json({ day: data[0] });
});
// DELETE /activity_days/:id - 活動日削除
activity.delete("/activity_days/:id", async (c) => {
    const id = c.req.param("id");
    const { error } = await supabase
        .from("activity_days")
        .delete()
        .eq("id", id);
    if (error)
        return c.json({ error: error.message }, 500);
    return c.json({ success: true });
});
