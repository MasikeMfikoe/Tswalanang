import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
    }

    // Get the user profile to verify customer association
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("customer_id")
      .eq("id", clientId)
      .single()

    if (userError) {
      console.error("Error fetching user profile:", userError)
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    // Get order details with customer verification
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        tracking_events:tracking_events(*)
      `)
      .eq("id", params.id)
      .eq("customer_id", userProfile.customer_id) // Ensure client can only see their orders
      .single()

    if (orderError) {
      console.error("Error fetching order:", orderError)
      return NextResponse.json({ error: "Order not found or access denied" }, { status: 404 })
    }

    // Transform tracking events
    const events =
      order.tracking_events?.map((event: any) => ({
        id: event.id,
        status: event.status,
        location: event.location,
        timestamp: event.timestamp,
        description: event.description || event.notes,
      })) || []

    const trackingData = {
      id: order.id,
      po_number: order.po_number,
      tracking_number: order.tracking_number,
      status: order.status,
      cargo_status: order.cargo_status,
      supplier: order.supplier,
      origin: order.origin,
      destination: order.destination,
      vessel_name: order.vessel_name,
      freight_type: order.freight_type,
      estimated_delivery: order.estimated_delivery,
      events,
    }

    return NextResponse.json({
      success: true,
      data: trackingData,
    })
  } catch (error) {
    console.error("Error fetching tracking data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
