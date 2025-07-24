import { NextResponse } from "next/server"
import { ShippingUpdateService } from "@/lib/services/shipping-update-service"
import { supabase } from "@/lib/supabaseClient"

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shipmentId = searchParams.get("shipmentId")
    const { trackingNumber, status } = await request.json()

    console.log(`Manually updating shipment ${trackingNumber} to status: ${status}`)

    if (!shipmentId) {
      return NextResponse.json({ error: "Shipment ID is required" }, { status: 400 })
    }

    // Get the shipment
    const { data: shipment, error } = await supabase.from("shipments").select("*").eq("id", shipmentId).single()

    if (error || !shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 })
    }

    // Update the shipment
    const updateService = new ShippingUpdateService()
    const update = await updateService.updateShipment(shipment, trackingNumber, status)

    if (!update) {
      return NextResponse.json({ error: "Failed to update shipment" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Shipment updated successfully",
      update,
    })
  } catch (error) {
    console.error("Error in manual shipping update:", error)
    return NextResponse.json({ error: "Failed to update shipment" }, { status: 500 })
  }
}
