import { NextResponse } from "next/server"
import { ShippingUpdateService } from "@/lib/services/shipping-update-service"
import { supabase } from "@/lib/supabaseClient"
import { AuditLogger } from "@/lib/audit-logger"

// Helper function to get user ID from request
const getUserIdFromRequest = async (request: Request): Promise<string | null> => {
  try {
    // Try to get from custom header (if set by client)
    const userIdHeader = request.headers.get("x-user-id")
    if (userIdHeader) {
      return userIdHeader
    }

    return null
  } catch (error) {
    console.error("Error getting user ID from request:", error)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shipmentId = searchParams.get("shipmentId")
    const userId = await getUserIdFromRequest(request)

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
    const update = await updateService.updateShipment(shipment)

    if (!update) {
      return NextResponse.json({ error: "Failed to update shipment" }, { status: 500 })
    }

    // Log manual shipment update
    if (userId) {
      await AuditLogger.logShipmentManualUpdate(userId, shipmentId, {
        containerNumber: shipment.container_number,
        bookingReference: shipment.booking_reference,
        status: update.status,
        location: update.location,
      })
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
