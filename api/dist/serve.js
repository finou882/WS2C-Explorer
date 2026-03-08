import { config } from "dotenv";
config();
import { serve } from "@hono/node-server";
import app from "./index";
const port = parseInt(process.env.PORT || "3000", 10);
console.log(`Starting server on port ${port}...`);
console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? "set" : "NOT SET"}`);
console.log(`HTTP_PROXY: ${process.env.HTTP_PROXY || "not set"}`);
serve({
    fetch: app.fetch,
    port,
});
console.log(`Server running at http://localhost:${port}`);
