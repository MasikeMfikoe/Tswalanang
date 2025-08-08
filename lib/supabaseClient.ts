import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Please check your environment variables.")
  // In a real application, you might want to throw an error or handle this more gracefully.
  // For now, we'll proceed with undefined client, which will likely cause runtime errors.
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "")
