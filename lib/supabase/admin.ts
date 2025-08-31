// lib/supabase/admin.ts
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// If you’ve generated DB types, you can import them and replace the generics below.
// import type { Database } from "@/types/supabase";

// Pull env vars once
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fail fast if misconfigured (server-only code)
if (!url) {
  throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL");
}
if (!serviceRoleKey) {
  throw new Error("Missing env: SUPABASE_SERVICE_ROLE_KEY");
}

/**
 * Singleton admin client (service role).
 * NOTE: Use ONLY on the server (API routes, server actions).
 */
export const supabaseAdmin: SupabaseClient /* <Database> */ = createClient(
  url,
  serviceRoleKey,
  {
    auth: {
      // Never persist sessions for admin
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        "X-Client-Info": "admin-server",
      },
    },
  }
);

/**
 * Convenience getter so imports like:
 *   import { createAdminClient } from "@/lib/supabase/admin"
 * also work.
 */
export function createAdminClient(): SupabaseClient /* <Database> */ {
  return supabaseAdmin;
}
