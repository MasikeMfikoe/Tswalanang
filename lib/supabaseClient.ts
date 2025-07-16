import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Check your environment variables.")
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

// Server-side Supabase client (for use in API routes, server components, server actions)
// This client should use the service role key for elevated privileges if needed,
// or the anon key if only public access is required.
// For this project, we'll assume the service role key is used where appropriate
// and the anon key for general server-side reads/writes that don't require elevated access.
export const createServerSupabaseClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not set. Server-side operations might be limited.")
  }
  return createClient(supabaseUrl!, serviceRoleKey || supabaseAnonKey!)
}
