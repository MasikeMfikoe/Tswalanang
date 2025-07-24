import { NextResponse } from "next/server"
import { UnifiedTrackingService } from "@/lib/services/unified-tracking-service"
import { GoCometService } from "@/lib/services/gocomet-service"
import { MaerskAPI } from "@/lib/shipping-lines/maersk-api"
import { MSCAPI } from "@/lib/shipping-lines/msc-api"
import { TrackShipService } from "@/lib/services/trackship-service"
import { MockTrackingService } from "@/lib/services/mock-tracking-service"
import { SearatesService } from "@/lib/services/searates-service"
import { WebScrapingService } from "@/lib/services/web-scraping-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const trackingNumber = searchParams.get("trackingNumber")
  const provider = searchParams.get("provider")
  const gocometToken = searchParams.get("gocometToken") // Get GoComet token from query params

  if (!trackingNumber) {
    return NextResponse.json({ error: "Tracking number is required" }, { status: 400 })
  }

  try {
    const unifiedTrackingService = new UnifiedTrackingService(
      new GoCometService(),
      new MaerskAPI(),
      new MSCAPI(),
      new TrackShipService(),
      new MockTrackingService(),
      new SearatesService(),
      new WebScrapingService(),
    )

    const trackingData = await unifiedTrackingService.trackShipment(trackingNumber, provider, gocometToken || undefined) // Pass token

    if (!trackingData) {
      return NextResponse.json({ message: "No tracking data found for this number." }, { status: 404 })
    }

    return NextResponse.json(trackingData)
  } catch (error) {
    console.error("Error tracking shipment:", error)
    return NextResponse.json({ error: "Failed to retrieve tracking information." }, { status: 500 })
  }
}
