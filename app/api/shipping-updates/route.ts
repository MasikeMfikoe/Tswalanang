import { NextResponse } from "next/server"
import { ShippingUpdateService } from "@/lib/services/shipping-update-service"

export async function GET(request: Request) {
  // Check for secret to confirm this is a valid request
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get("secret")

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const updateService = new ShippingUpdateService()

    // Get shipments that need updates
    const shipments = await updateService.getShipmentsForUpdate(20) // Process 20 at a time

    if (shipments.length === 0) {
      return NextResponse.json({ message: "No shipments to update" })
    }

    // Update each shipment
    const results = await Promise.allSettled(shipments.map((shipment) => updateService.updateShipment(shipment)))

    // Count successes and failures
    const successful = results.filter((r) => r.status === "fulfilled" && r.value !== null).length
    const failed = results.length - successful

    return NextResponse.json({
      message: `Updated ${successful} shipments, ${failed} failed`,
      total: shipments.length,
      successful,
      failed,
    })
  } catch (error) {
    console.error("Error in shipping updates:", error)
    return NextResponse.json({ error: "Failed to update shipments" }, { status: 500 })
  }
}
