import { type NextRequest, NextResponse } from "next/server"
import { MultiProviderTrackingService } from "@/lib/services/multi-provider-tracking-service"
import { detectShipmentInfo } from "@/lib/services/container-detection-service"

export async function POST(request: NextRequest) {
  try {
    const { trackingNumber } = await request.json()

    if (!trackingNumber) {
      return NextResponse.json({ success: false, error: "Tracking number is required" }, { status: 400 })
    }

    // Auto-detect shipment type and carrier hint
    const detectedInfo = detectShipmentInfo(trackingNumber)
    const shipmentType = detectedInfo.type
    const carrierHint = detectedInfo.carrierHint

    console.log(
      `[API/Track] Received request for: ${trackingNumber}, Detected Type: ${shipmentType}, Carrier Hint: ${carrierHint}`,
    )

    const multiProviderTrackingService = new MultiProviderTrackingService()
    const result = await multiProviderTrackingService.trackShipment(trackingNumber, {
      shipmentType,
      carrierHint,
      // preferScraping: false, // As per the prompt, we are focusing on API first
    })

    if (result.success) {
      console.log(`[API/Track] Tracking successful for ${trackingNumber}. Source: ${result.source}`)
      return NextResponse.json({
        success: true,
        data: result.data,
        source: result.source,
        isLiveData: result.isLiveData,
        scrapedAt: result.scrapedAt,
      })
    } else {
      console.error(`[API/Track] Tracking failed for ${trackingNumber}. Error: ${result.error}`)
      return NextResponse.json({
        success: false,
        error: result.error,
        source: result.source,
        fallbackOptions: result.fallbackOptions,
      })
    }
  } catch (error: any) {
    console.error("[API/Track] Uncaught API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during tracking.",
        details: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
