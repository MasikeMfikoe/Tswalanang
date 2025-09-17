import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function cleanSupabaseCredentials(url: string | undefined, key: string | undefined) {
  if (!url || !key) {
    console.error("❌ Missing Supabase environment variables:", {
      hasUrl: !!url,
      hasKey: !!key,
      urlLength: url?.length || 0,
      keyLength: key?.length || 0,
    })
    return {
      cleanUrl: "https://placeholder.supabase.co",
      cleanKey: "placeholder-key",
      isValid: false,
    }
  }

  const cleanUrl = url.replace(/[^\x20-\x7E]/g, "").trim()
  const cleanKey = key.replace(/[^\x20-\x7E]/g, "").trim()

  // Basic validation
  const isValidUrl = cleanUrl.startsWith("https://") && cleanUrl.length > 20
  const isValidKey = cleanKey.length > 50

  if (!isValidUrl || !isValidKey) {
    console.warn("⚠️ Invalid Supabase credentials detected, using fallback")
    return {
      cleanUrl: "https://placeholder.supabase.co",
      cleanKey: "placeholder-key",
      isValid: false,
    }
  }

  console.log("✅ Supabase credentials cleaned and validated")
  return { cleanUrl, cleanKey, isValid: true }
}

const { cleanUrl, cleanKey, isValid } = cleanSupabaseCredentials(supabaseUrl, supabaseAnonKey)

export const supabase = createBrowserClient(cleanUrl, cleanKey)

console.log("✅ Supabase environment variables validated successfully")

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
