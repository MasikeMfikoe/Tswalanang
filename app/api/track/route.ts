import { type NextRequest, NextResponse } from "next/server"
import { MultiProviderTrackingService } from "@/lib/services/multi-provider-tracking-service"
import { detectShipmentInfo } from "@/lib/services/container-detection-service"
import type { ShipmentType } from "@/types/tracking"

// --- CONCEPTUAL: Replace with your actual third-party detection service ---
// You would create a file like lib/services/third-party-detection-service.ts
// and implement its logic to call the external API.
interface DetectedInfoFromThirdParty {
  type: ShipmentType
  carrierHint?: string
  confidence?: number // Optional: how confident the detection is
}

class ThirdPartyDetectionService {
  async detect(trackingNumber: string): Promise<DetectedInfoFromThirdParty | null> {
    // In a real scenario, this would make an API call to a service like AfterShip, ParcelPanel, etc.
    // For demonstration, let's simulate a detection based on a simple rule.
    console.log(`[ThirdPartyDetectionService] Attempting to detect for: ${trackingNumber}`)

    // Example: Simulate a more advanced detection than local rules
    if (trackingNumber.startsWith("ABC")) {
      return { type: "air", carrierHint: "SomeAirCarrier", confidence: 0.9 }
    }
    if (trackingNumber.startsWith("XYZ")) {
      return { type: "ocean", carrierHint: "SomeOceanCarrier", confidence: 0.85 }
    }

    // Fallback to local detection if no specific third-party rule matches
    const localDetection = detectShipmentInfo(trackingNumber)
    if (localDetection.type !== "unknown") {
      return { type: localDetection.type, carrierHint: localDetection.carrierHint, confidence: 0.7 }
    }

    return null // No detection from third-party or local fallback
  }
}
// --- END CONCEPTUAL ---

export async function POST(request: NextRequest) {
  try {
    const { trackingNumber } = await request.json()

    if (!trackingNumber) {
      return NextResponse.json({ success: false, error: "Tracking number is required" }, { status: 400 })
    }

    let shipmentType: ShipmentType = "unknown"
    let carrierHint: string | undefined

    // Step 1: Try to detect using a (hypothetical) third-party detection service
    const thirdPartyDetectionService = new ThirdPartyDetectionService()
    const thirdPartyDetectedInfo = await thirdPartyDetectionService.detect(trackingNumber)

    if (thirdPartyDetectedInfo && thirdPartyDetectedInfo.type !== "unknown") {
      shipmentType = thirdPartyDetectedInfo.type
      carrierHint = thirdPartyDetectedInfo.carrierHint
      console.log(`[API/Track] Detected via Third-Party Service: Type: ${shipmentType}, Carrier Hint: ${carrierHint}`)
    } else {
      // Step 2: Fallback to local detection if third-party detection fails or is not used
      const localDetectedInfo = detectShipmentInfo(trackingNumber)
      shipmentType = localDetectedInfo.type
      carrierHint = localDetectedInfo.carrierHint
      console.log(`[API/Track] Detected via Local Rules: Type: ${shipmentType}, Carrier Hint: ${carrierHint}`)
    }

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
