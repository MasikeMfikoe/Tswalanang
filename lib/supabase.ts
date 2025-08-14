import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
  typeof window !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_URL! : "https://placeholder.supabase.co"
const supabaseAnonKey = typeof window !== "undefined" ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! : "placeholder-key"

if (typeof window !== "undefined" && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn("Missing Supabase environment variables")
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  },
)

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
