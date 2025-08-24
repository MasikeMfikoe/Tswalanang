import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only log in development or when explicitly debugging
const isDev = process.env.NODE_ENV === "development"
const isDebugging = process.env.DEBUG_SUPABASE === "true"

if (isDev || isDebugging) {
  console.log("[v0] Environment variables check:")
  console.log("[v0] NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing")
  console.log("[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✅ Set" : "❌ Missing")
}

let supabase: any

if (!supabaseUrl || !supabaseAnonKey) {
  if (isDev) {
    console.error("❌ CRITICAL: Supabase environment variables are missing!")
    console.error("❌ Required variables:")
    console.error("   - NEXT_PUBLIC_SUPABASE_URL")
    console.error("   - NEXT_PUBLIC_SUPABASE_ANON_KEY")
    console.error("❌ Please set these in your Vercel environment variables and redeploy")
  }

  supabase = {
    auth: {
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase not configured" } }),
      signOut: () => Promise.resolve({ error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: { message: "Supabase not configured" } }),
      insert: () => Promise.resolve({ data: [], error: { message: "Supabase not configured" } }),
      update: () => Promise.resolve({ data: [], error: { message: "Supabase not configured" } }),
      delete: () => Promise.resolve({ error: { message: "Supabase not configured" } }),
      eq: function () {
        return this
      },
      limit: function () {
        return this
      },
      order: function () {
        return this
      },
    }),
  }

  if (isDev) {
    console.log("⚠️ Using mock Supabase client - authentication will not work")
  }
} else {
  if (isDev || isDebugging) {
    console.log("✅ Supabase environment variables found, creating client...")
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })

  if (isDev || isDebugging) {
    console.log("✅ Supabase client created successfully")
  }
}

export { supabase }

export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Helper functions that work with the real Supabase client
export async function fetchData<T>(table: string, query?: any): Promise<T[]> {
  try {
    let queryBuilder = supabase.from(table).select("*")

    if (query) {
      if (query.filter) {
        queryBuilder = queryBuilder.eq(query.filter.column, query.filter.value)
      }
      if (query.limit) {
        queryBuilder = queryBuilder.limit(query.limit)
      }
      if (query.orderBy) {
        queryBuilder = queryBuilder.order(query.orderBy.column, {
          ascending: query.orderBy.ascending ?? true,
        })
      }
    }

    const { data, error } = await queryBuilder

    if (error) {
      console.error(`Error fetching from ${table}:`, error)
      throw error
    }

    return data as T[]
  } catch (error) {
    console.error(`Error in fetchData for ${table}:`, error)
    return []
  }
}

export async function insertData<T>(table: string, data: Partial<T>): Promise<T[]> {
  try {
    const { data: result, error } = await supabase.from(table).insert(data).select()

    if (error) {
      console.error(`Error inserting into ${table}:`, error)
      throw error
    }

    return result as T[]
  } catch (error) {
    console.error(`Error in insertData for ${table}:`, error)
    throw error
  }
}

export async function updateData<T>(table: string, id: string, data: Partial<T>): Promise<T[]> {
  try {
    const { data: result, error } = await supabase.from(table).update(data).eq("id", id).select()

    if (error) {
      console.error(`Error updating ${table}:`, error)
      throw error
    }

    return result as T[]
  } catch (error) {
    console.error(`Error in updateData for ${table}:`, error)
    throw error
  }
}

export async function deleteData(table: string, id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from(table).delete().eq("id", id)

    if (error) {
      console.error(`Error deleting from ${table}:`, error)
      throw error
    }

    return true
  } catch (error) {
    console.error(`Error in deleteData for ${table}:`, error)
    return false
  }
}

// Test the connection
export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("user_profiles").select("count").limit(1)

    if (error) {
      console.error("Supabase connection test failed:", error)
      return false
    }

    console.log("✅ Supabase connection successful")
    return true
  } catch (error) {
    console.error("❌ Supabase connection failed:", error)
    return false
  }
}
