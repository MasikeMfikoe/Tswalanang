import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")

    console.log("[v0] 📄 Documents API - GET request for orderId:", orderId)

    if (!orderId) {
      console.log("[v0] ❌ Documents API - Missing orderId parameter")
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Fetch documents using service role client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from("uploaded_documents")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] ❌ Documents API - Supabase error:", error)
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
    }

    console.log("[v0] ✅ Documents API - Successfully fetched", data?.length || 0, "documents")

    return NextResponse.json({
      data: data || [],
      success: true,
    })
  } catch (error) {
    console.error("[v0] 💥 Documents API - Exception:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
