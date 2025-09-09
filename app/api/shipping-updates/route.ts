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

    const shipmentsLength = Array.isArray(shipments) ? shipments.length : 0

    if (shipmentsLength === 0) {
      return NextResponse.json({ message: "No shipments to update" })
    }

    // Update each shipment
    const results = await Promise.allSettled(shipments.map((shipment) => updateService.updateShipment(shipment)))

    const resultsLength = Array.isArray(results) ? results.length : 0
    const successful = Array.isArray(results)
      ? results.filter((r) => r.status === "fulfilled" && r.value !== null).length
      : 0
    const failed = resultsLength - successful

    return NextResponse.json({
      message: `Updated ${successful} shipments, ${failed} failed`,
      total: shipmentsLength,
      successful,
      failed,
    })
  } catch (error) {
    console.error("Error in shipping updates:", error)
    return NextResponse.json({ error: "Failed to update shipments" }, { status: 500 })
  }
}
