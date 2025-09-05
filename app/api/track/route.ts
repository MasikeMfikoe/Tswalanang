import { type NextRequest, NextResponse } from "next/server"
import { MultiProviderTrackingService } from "@/lib/services/multi-provider-tracking-service"
import { detectShipmentInfo } from "@/lib/services/container-detection-service"
import type { ShipmentType } from "@/types/tracking"

// --- Demo stub for a third-party detector. Replace with your real integration.
interface DetectedInfoFromThirdParty {
  type: ShipmentType
  carrierHint?: string
  confidence?: number
}

class ThirdPartyDetectionService {
  async detect(trackingNumber: string): Promise<DetectedInfoFromThirdParty | null> {
    console.log(`[ThirdPartyDetectionService] Attempting to detect for: ${trackingNumber}`)
    if (trackingNumber.startsWith("ABC")) return { type: "air", carrierHint: "SomeAirCarrier", confidence: 0.9 }
    if (trackingNumber.startsWith("XYZ")) return { type: "ocean", carrierHint: "SomeOceanCarrier", confidence: 0.85 }

    const local = detectShipmentInfo(trackingNumber)
    if (local.type !== "unknown") return { type: local.type, carrierHint: local.carrierHint, confidence: 0.7 }
    return null
  }
}
// --- End stub ---

export async function POST(request: NextRequest) {
  try {
    const { trackingNumber } = await request.json()

    if (!trackingNumber) {
      return NextResponse.json({ success: false, error: "Tracking number is required" }, { status: 400 })
    }

    let shipmentType: ShipmentType = "unknown"
    let carrierHint: string | undefined

    // Try third-party detection first
    const thirdPartyDetectionService = new ThirdPartyDetectionService()
    const thirdPartyDetectedInfo = await thirdPartyDetectionService.detect(trackingNumber)

    if (thirdPartyDetectedInfo && thirdPartyDetectedInfo.type !== "unknown") {
      shipmentType = thirdPartyDetectedInfo.type
      carrierHint = thirdPartyDetectedInfo.carrierHint
      console.log(`[API/Track] Detected via Third-Party: type=${shipmentType}, carrierHint=${carrierHint}`)
    } else {
      // Fallback to local rules
      const local = detectShipmentInfo(trackingNumber)
      shipmentType = local.type
      carrierHint = local.carrierHint
      console.log(`[API/Track] Detected via Local Rules: type=${shipmentType}, carrierHint=${carrierHint}`)
    }

    const svc = new MultiProviderTrackingService()
    const result = await svc.trackShipment(trackingNumber, { shipmentType, carrierHint })

    // Use safe narrowing instead of assuming a discriminated union
    if (result && result.success === true) {
      console.log(`[API/Track] Tracking SUCCESS for ${trackingNumber}. Source: ${("source" in result) ? (result as any).source : "unknown"}`)
      return NextResponse.json({
        success: true,
        data: ("data" in result) ? (result as any).data : undefined,
        source: ("source" in result) ? (result as any).source : undefined,
        isLiveData: ("isLiveData" in result) ? (result as any).isLiveData : undefined,
        scrapedAt: ("scrapedAt" in result) ? (result as any).scrapedAt : undefined,
      })
    } else {
      const errorMsg = (result && "error" in result) ? (result as any).error : "Tracking failed"
      const source = (result && "source" in result) ? (result as any).source : undefined
      const fallbackOptions = (result && "fallbackOptions" in result) ? (result as any).fallbackOptions : undefined

      console.error(`[API/Track] Tracking FAILED for ${trackingNumber}. Error: ${errorMsg}`)
      return NextResponse.json(
        { success: false, error: errorMsg, source, fallbackOptions },
        { status: 502 },
      )
    }
  } catch (error: any) {
    console.error("[API/Track] Uncaught API error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error during tracking.", details: error?.message ?? String(error) },
      { status: 500 },
    )
  }
}
