import { type NextRequest, NextResponse } from "next/server"
import { MultiProviderTrackingService } from "@/lib/services/multi-provider-tracking-service"

export async function GET() {
  try {
    const trackingService = new MultiProviderTrackingService()
    const providerStatus = trackingService.getProviderStatus()

    const providersLength = Array.isArray(providerStatus) ? providerStatus.length : 0
    const availableProvidersLength = Array.isArray(providerStatus)
      ? providerStatus.filter((p) => p.available).length
      : 0

    return NextResponse.json({
      success: true,
      providers: providerStatus,
      totalProviders: providersLength,
      availableProviders: availableProvidersLength,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to get provider status" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { trackingNumber, preferredProvider, carrierHint, shipmentType } = await request.json()

    if (!trackingNumber) {
      return NextResponse.json({ success: false, error: "Tracking number is required" }, { status: 400 })
    }

    const trackingService = new MultiProviderTrackingService()
    const result = await trackingService.trackShipment(trackingNumber, {
      preferredProvider,
      carrierHint,
      shipmentType,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Multi-provider tracking error:", error)
    return NextResponse.json({ success: false, error: "Tracking service error" }, { status: 500 })
  }
}
