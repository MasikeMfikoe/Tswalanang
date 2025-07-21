import { NextResponse } from "next/server"
import { MultiProviderTrackingService } from "@/lib/services/multi-provider-tracking-service"
import { detectShipmentInfo } from "@/lib/services/container-detection-service"
import type { ShipmentType } from "@/types/tracking"

export async function POST(request: Request) {
  try {
    const { trackingNumber, gocometToken } = await request.json()

    if (!trackingNumber) {
      return NextResponse.json({ success: false, error: "Tracking number is required." }, { status: 400 })
    }

    // Detect shipment type and carrier hint
    const detectedInfo = detectShipmentInfo(trackingNumber)
    const shipmentType: ShipmentType = detectedInfo.type
    const carrierHint: string | undefined = detectedInfo.carrierHint

    const trackingService = new MultiProviderTrackingService(gocometToken)
    const result = await trackingService.trackShipment(trackingNumber, {
      shipmentType,
      carrierHint,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        source: result.source,
        isLiveData: result.isLiveData,
      })
    } else {
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
