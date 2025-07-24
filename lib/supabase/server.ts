import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// This client is used for Server Components and Route Handlers
// It has access to the `auth` helper for server-side authentication
// and can be used to interact with the database directly.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase environment variables for server client")
  throw new Error("Missing required Supabase environment variables for server client")
}

export const createServerClient = () => {
  const cookieStore = cookies()

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        // Optional: Add a custom header to identify requests from the server client
        "x-supabase-client": "server-client",
      },
    },
  })
}

// This client is for admin operations that require the service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
