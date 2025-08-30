import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }   // 👈 make params async
) {
  try {
    const { id } = await params                         // 👈 await it
    console.log("[v0] Fetching courier order details for ID:", id)

    // Fetch the main courier order
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("courier_orders")
      .select("*")
      .eq("id", id)
      .single()

    if (orderError) {
      console.error("[v0] Error fetching courier order:", orderError)
      if ((orderError as any).code === "PGRST116") {
        return NextResponse.json({ error: "Courier order not found" }, { status: 404 })
      }
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // Fetch courier order items
    const { data: itemsData, error: itemsError } = await supabaseAdmin
      .from("courier_order_items")
      .select("*")
      .eq("courier_order_id", id)
      .order("created_at", { ascending: true })

    if (itemsError) {
      console.error("[v0] Error fetching courier order items:", itemsError)
    }

    // Fetch tracking events
    const { data: trackingData, error: trackingError } = await supabaseAdmin
      .from("tracking_events")
      .select("*")
      .eq("courier_order_id", id)
      .order("timestamp", { ascending: false })

    if (trackingError) {
      console.error("[v0] Error fetching tracking events:", trackingError)
    }

    console.log("[v0] Successfully fetched courier order details")

    return NextResponse.json({
      order: orderData,
      items: itemsData || [],
      trackingEvents: trackingData || [],
      success: true,
    })
  } catch (error) {
    console.error("[v0] Unexpected error fetching courier order details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
