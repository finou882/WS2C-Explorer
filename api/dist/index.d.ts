import { Hono } from "hono";
import type { Env } from "./types";
declare const app: Hono<{
    Bindings: Env;
}, import("hono/types").BlankSchema, "/">;
export default app;
