import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { HttpsProxyAgent } from "https-proxy-agent";
import fetch from "node-fetch";
import type { Database } from "../database.types";

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
): SupabaseClient<Database> {
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
): SupabaseClient<Database> {
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
