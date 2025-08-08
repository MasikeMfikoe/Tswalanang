import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase environment variables, using mock data")
}

// Export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Re-export createClient to make it available from this utility file if needed elsewhere
export { createClient }
