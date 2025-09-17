import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase environment variables, using mock data")
}

const isValidUrl = supabaseUrl && supabaseUrl.startsWith("https://") && supabaseUrl.includes(".supabase.co")
const isValidKey = supabaseAnonKey && supabaseAnonKey.length > 100 && supabaseAnonKey.startsWith("eyJ")

if (!isValidUrl || !isValidKey) {
  console.error("Invalid Supabase configuration:", {
    urlValid: isValidUrl,
    keyValid: isValidKey,
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "undefined",
    keyLength: supabaseAnonKey?.length || 0,
  })
}

export const supabase =
  isValidUrl && isValidKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient("https://mock.supabase.co", "mock-key-for-fallback")
