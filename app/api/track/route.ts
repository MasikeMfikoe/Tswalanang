import { NextResponse } from "next/server"
import { MultiProviderTrackingService } from "@/lib/services/multi-provider-tracking-service"
import { detectShipmentInfo } from "@/lib/services/container-detection-service"
import type { ShipmentType } from "@/types/tracking"

export async function POST(request: Request) {
  try {
    const { trackingNumber, bookingType, carrierHint, gocometToken } = await request.json() // Receive gocometToken

    if (!trackingNumber) {
      return NextResponse.json({ success: false, error: "Tracking number is required." }, { status: 400 })
    }

    // Detect shipment type and carrier hint (can be overridden by client-provided bookingType/carrierHint)
    const detectedInfo = detectShipmentInfo(trackingNumber)
    const finalShipmentType: ShipmentType = bookingType || detectedInfo.type
    const finalCarrierHint: string | undefined = carrierHint || detectedInfo.carrierHint

    const trackingService = new MultiProviderTrackingService()
    const result = await trackingService.trackShipment(trackingNumber, {
      shipmentType: finalShipmentType,
      carrierHint: finalCarrierHint,
      gocometToken: gocometToken, // Pass the received token
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        source: result.source,
        isLiveData: result.isLiveData,
      })
    } else {
      // If tracking failed, return the error and any fallback options
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to retrieve tracking information.",
          source: result.source,
          fallbackOptions: result.fallbackOptions,
          isLiveData: result.isLiveData,
        },
        { status: 200 }, // Return 200 even on tracking failure, as it's a valid response from the service
      )
    }
  } catch (error: any) {
    console.error("Error in /api/track route:", error)
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 })
  }
}
