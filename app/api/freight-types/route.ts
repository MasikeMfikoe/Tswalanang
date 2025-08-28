import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use service role client to bypass RLS
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] 🚛 Fetching freight types from database")

    const { data, error, count } = await supabaseAdmin
      .from("freight_types")
      .select("id, name, code", { count: "exact" })
      .eq("active", true)
      .order("name")

    if (error) {
      console.error("[v0] ❌ Database error fetching freight types:", error)
      return NextResponse.json({ error: "Failed to fetch freight types", details: error.message }, { status: 500 })
    }

    console.log(`[v0] ✅ Successfully fetched ${data?.length || 0} freight types`)

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      success: true,
    })
  } catch (error) {
    console.error("[v0] ❌ Unexpected error fetching freight types:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
