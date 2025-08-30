// lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js"

// If you have generated DB types (optional), you can import them and pass to createClient:
// import type { Database } from "@/lib/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL")
}
if (!serviceRoleKey) {
  throw new Error("Missing env: SUPABASE_SERVICE_ROLE_KEY (server-only)")
}

// Memoize in dev to avoid multiple clients on hot reloads
declare global {
  // eslint-disable-next-line no-var
  var __supabaseServer__: ReturnType<typeof createClient> | undefined
}

export const supabaseServer =
  global.__supabaseServer__ ||
  // If you have Database types, use: createClient<Database>(...)
  createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,   // server: no browser token refresh
      persistSession: false,     // server: do not persist sessions
      detectSessionInUrl: false, // server: no URL parsing
    },
    // You can add global headers/options here if needed
  })

if (process.env.NODE_ENV !== "production") {
  global.__supabaseServer__ = supabaseServer
}
