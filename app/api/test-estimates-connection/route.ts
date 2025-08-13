import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    // Test 1: Check if we can connect to Supabase
    console.log("Testing Supabase connection...")

    // Test 2: Check if estimates table exists and get count
    const {
      data: tableData,
      error: tableError,
      count,
    } = await supabase.from("estimates").select("*", { count: "exact" }).limit(5)

    if (tableError) {
      console.error("Table query error:", tableError)
      return NextResponse.json({
        success: false,
        error: "Table query failed",
        details: tableError,
        step: "table_query",
      })
    }

    // Test 3: Check table structure
    const { data: schemaData, error: schemaError } = await supabase.from("estimates").select("*").limit(1)

    return NextResponse.json({
      success: true,
      tests: {
        connection: "✅ Connected to Supabase",
        table_access: "✅ Can access estimates table",
        record_count: `Found ${count} records`,
        sample_data: tableData,
        table_structure: schemaData?.[0] ? Object.keys(schemaData[0]) : "No records to show structure",
      },
      raw_data: tableData,
    })
  } catch (error) {
    console.error("Connection test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Connection test failed",
        details: error,
        step: "connection",
      },
      { status: 500 },
    )
  }
}
