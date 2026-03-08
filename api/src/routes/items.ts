import { Hono } from "hono";
import type { Env } from "../types";
import { createServiceClient } from "../lib/supabase";
import type { Database } from "../database.types";

type PosInsert = Database["public"]["Tables"]["pos"]["Insert"];
type PosUpdate = Database["public"]["Tables"]["pos"]["Update"];

export const itemsRoutes = new Hono<{ Bindings: Env }>();

// Helper to get env (Cloudflare bindings or Node.js process.env)
function getEnv(c: any): Env {
  return {
    SUPABASE_URL: c.env?.SUPABASE_URL || process.env.SUPABASE_URL || "",
    SUPABASE_ANON_KEY: c.env?.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "",
    CORS_ORIGIN: c.env?.CORS_ORIGIN || process.env.CORS_ORIGIN || "*",
  };
}

// Helper to get Supabase client
function getSupabase(c: any) {
  const env = getEnv(c);
  return createServiceClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY
  );
}

// List all items
itemsRoutes.get("/", async (c) => {
  const supabase = getSupabase(c);
  const category = c.req.query("category");
  const search = c.req.query("search");
  const status = c.req.query("status");

  let query = supabase
    .from("pos")
    .select("*")
    .order("timestamp", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }
  if (status) {
    query = query.eq("status", status);
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Fetch items error:", error);
    return c.json({ error: "Failed to fetch items" }, 500);
  }

  return c.json({ items: data });
});

// Get unique categories
itemsRoutes.get("/categories", async (c) => {
  const supabase = getSupabase(c);

  const { data, error } = await supabase
    .from("pos")
    .select("category");

  if (error) {
    return c.json({ error: "Failed to fetch categories" }, 500);
  }

  // Get unique categories
  const categories = [...new Set(data?.map((d) => d.category).filter(Boolean))];
  return c.json({ categories });
});

// Get single item
itemsRoutes.get("/:id", async (c) => {
  const supabase = getSupabase(c);
  const id = c.req.param("id");

  const { data, error } = await supabase
    .from("pos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return c.json({ error: "Item not found" }, 404);
  }

  return c.json({ item: data });
});

// Create item
itemsRoutes.post("/", async (c) => {
  const supabase = getSupabase(c);
  const body = await c.req.json<PosInsert>();

  const { data, error } = await supabase
    .from("pos")
    .insert({
      name: body.name,
      pieces: body.pieces ?? 1,
      category: body.category ?? "",
      status: body.status ?? "good",
      location: body.location ?? "",
      timestamp: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Create item error:", error);
    return c.json({ error: "Failed to create item" }, 500);
  }

  return c.json({ item: data }, 201);
});

// Update item
itemsRoutes.patch("/:id", async (c) => {
  const supabase = getSupabase(c);
  const id = c.req.param("id");
  const body = await c.req.json<PosUpdate>();

  const { data, error } = await supabase
    .from("pos")
    .update({
      ...body,
      timestamp: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Update item error:", error);
    return c.json({ error: "Failed to update item" }, 500);
  }

  return c.json({ item: data });
});

// Delete item
itemsRoutes.delete("/:id", async (c) => {
  const supabase = getSupabase(c);
  const id = c.req.param("id");

  const { error } = await supabase.from("pos").delete().eq("id", id);

  if (error) {
    console.error("Delete item error:", error);
    return c.json({ error: "Failed to delete item" }, 500);
  }

  return c.json({ success: true });
});
