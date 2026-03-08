// --- Default supabase client for compatibility ---
import dotenv from "dotenv";
dotenv.config();
// Create a default supabase client using env vars (for legacy code)
export const supabase = createSupabaseClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
import { createClient } from "@supabase/supabase-js";
import { HttpsProxyAgent } from "https-proxy-agent";
import fetch from "node-fetch";
// Create a custom fetch that uses proxy if configured
function createProxyFetch() {
    const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
    if (!proxyUrl) {
        return undefined; // Use default fetch
    }
    const agent = new HttpsProxyAgent(proxyUrl);
    return (url, options = {}) => {
        return fetch(url, {
            ...options,
            agent,
        });
    };
}
export function createSupabaseClient(supabaseUrl, supabaseKey, accessToken) {
    const customFetch = createProxyFetch();
    return createClient(supabaseUrl, supabaseKey, {
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
export function createServiceClient(supabaseUrl, serviceRoleKey) {
    const customFetch = createProxyFetch();
    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
        global: {
            fetch: customFetch,
        },
    });
}
