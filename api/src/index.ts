import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env } from "./types";
import { itemsRoutes } from "./routes/items.js";
import { activity } from "./routes/activity.js";

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use("*", logger());
app.use("*", async (c, next) => {
  let corsOrigin: string | string[] = c.env?.CORS_ORIGIN || process.env.CORS_ORIGIN || "*";
  // Support comma-separated origins
  if (typeof corsOrigin === "string" && corsOrigin.includes(",")) {
    corsOrigin = corsOrigin.split(",").map(o => o.trim());
  }
  const corsMiddleware = cors({
    origin: corsOrigin,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });
  return corsMiddleware(c, next);
});

// Health check
app.get("/", (c) => {
  return c.json({ status: "ok", message: "Club Inventory API" });
});

app.get("/health", (c) => {
  return c.json({ status: "healthy" });
});

// Routes
app.route("/items", itemsRoutes);
app.route("/activity", activity);

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not Found" }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
