import { NextResponse } from "next/server"
import { MultiProviderTrackingService } from "@/lib/services/multi-provider-tracking-service"
import type { ShipmentType } from "@/types/tracking"

export async function POST(request: Request) {
  try {
    const { trackingNumber, bookingType, carrierHint, gocometToken } = await request.json()

    if (!trackingNumber) {
      return NextResponse.json({ error: "Tracking number is required" }, { status: 400 })
    }

    // Initialize the multi-provider service with the GoComet token
    const trackingService = new MultiProviderTrackingService(gocometToken)

    // Attempt to track using the multi-provider service
    const result = await trackingService.trackShipment(trackingNumber, {
      shipmentType: bookingType as ShipmentType,
      carrierHint: carrierHint,
    })

    if (result.success) {
      return NextResponse.json(result)
    } else {
      // If tracking failed, return the error and any fallback options
      return NextResponse.json(result, { status: 200 }) // Still 200 if it's a valid fallback/no data found scenario
    }
  } catch (error: any) {
    console.error("Error in /api/track route:", error)
    return NextResponse.json({ success: false, error: error.message || "Internal server error" }, { status: 500 })
  }
}
