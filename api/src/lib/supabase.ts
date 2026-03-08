// --- Default supabase client for compatibility ---
import dotenv from "dotenv";
dotenv.config();

// Create a default supabase client using env vars (for legacy code)
export const supabase = createSupabaseClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { HttpsProxyAgent } from "https-proxy-agent";
import fetch from "node-fetch";
import type { Database } from "../database.types.js";

// Create a custom fetch that uses proxy if configured
function createProxyFetch() {
  const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
  if (!proxyUrl) {
    return undefined; // Use default fetch
  }
  
  const agent = new HttpsProxyAgent(proxyUrl);
  
  return (url: any, options: any = {}) => {
    return fetch(url, {
      ...options,
      agent,
    }) as any;
  };
}


export function createSupabaseClient(
  supabaseUrl: string,
  supabaseKey: string,
  accessToken?: string
): import("@supabase/supabase-js").SupabaseClient<Database> {
  const customFetch = createProxyFetch();
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
      fetch: customFetch,
    },
  });
}


export function createServiceClient(
  supabaseUrl: string,
  serviceRoleKey: string
): import("@supabase/supabase-js").SupabaseClient<Database> {
  const customFetch = createProxyFetch();
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: customFetch,
    },
  });
}
