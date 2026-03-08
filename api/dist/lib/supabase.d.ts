export declare const supabase: SupabaseClient<Database, "public", "public", never, {
    PostgrestVersion: "12";
}>;
import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";
export declare function createSupabaseClient(supabaseUrl: string, supabaseKey: string, accessToken?: string): import("@supabase/supabase-js").SupabaseClient<Database>;
export declare function createServiceClient(supabaseUrl: string, serviceRoleKey: string): import("@supabase/supabase-js").SupabaseClient<Database>;
