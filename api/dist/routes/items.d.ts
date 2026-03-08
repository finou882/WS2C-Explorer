import { Hono } from "hono";
import type { Env } from "../types";
export declare const itemsRoutes: Hono<{
    Bindings: Env;
}, import("hono/types").BlankSchema, "/">;
