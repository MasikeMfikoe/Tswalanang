import { type NextRequest, NextResponse } from "next/server"
import { detectContainerInfo, trackContainerExternal } from "@/lib/utils"
import { TrackShipService } from "@/lib/services/trackship-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trackingNumber, bookingType } = body

    if (!trackingNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Tracking number is required",
        },
        { status: 400 },
      )
    }

    const cleanTrackingNumber = trackingNumber.trim().toUpperCase().replace(/[\s-]/g, "")

    // Try TrackShip first (if API key is configured)
    const trackShipService = new TrackShipService()
    const trackShipResult = await trackShipService.trackShipment(cleanTrackingNumber)

    if (trackShipResult.success && trackShipResult.data) {
      console.log("✅ TrackShip tracking successful for:", cleanTrackingNumber)
      return NextResponse.json({
        success: true,
        data: transformTrackShipToStandardFormat(trackShipResult.data),
        source: "TrackShip",
        isLiveData: true,
      })
    }

    // Fallback to existing direct API tracking
    console.log("⚠️ TrackShip failed, trying direct APIs for:", cleanTrackingNumber)
    const directResult = await trackContainerExternal(cleanTrackingNumber)

    if (directResult.success && directResult.data) {
      console.log("✅ Direct API tracking successful for:", cleanTrackingNumber)
      return NextResponse.json({
        success: true,
        data: directResult.data,
        source: directResult.source,
        isLiveData: true,
      })
    }

    // Final fallback - carrier website redirect
    const containerInfo = detectContainerInfo(cleanTrackingNumber)
    if (containerInfo.isValid && containerInfo.carrier) {
      const carrierUrls: Record<string, string> = {
        MSC: `https://www.msc.com/track-a-shipment?agencyPath=msc&trackingNumber=${cleanTrackingNumber}`,
        MAERSK: `https://www.maersk.com/tracking/${cleanTrackingNumber}`,
        CMA: `https://www.cma-cgm.com/ebusiness/tracking/search?number=${cleanTrackingNumber}`,
        HAPAG: `https://www.hapag-lloyd.com/en/online-business/track/track-by-container-solution.html?container=${cleanTrackingNumber}`,
      }

      const trackingUrl =
        carrierUrls[containerInfo.carrier] ||
        `https://www.${containerInfo.carrier.toLowerCase()}.com/track?number=${cleanTrackingNumber}`

      return NextResponse.json({
        success: false,
        error: "Live tracking not available. Redirecting to carrier website.",
        carrierInfo: {
          name: containerInfo.carrier,
          trackingUrl,
        },
        source: "carrier-redirect",
      })
    }

    return NextResponse.json({
      success: false,
      error: "Unable to track this shipment. Please verify the tracking number format.",
      source: "error",
    })
  } catch (error) {
    console.error("Tracking API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Tracking service temporarily unavailable",
      },
      { status: 500 },
    )
  }
}

// Helper function to transform TrackShip data to your existing format
function transformTrackShipToStandardFormat(trackShipData: any) {
  return {
    shipmentNumber: trackShipData.tracking_number,
    status: trackShipData.status,
    containerNumber: trackShipData.tracking_number,
    containerType: trackShipData.shipment_info?.service_type || "Container",
    weight: trackShipData.shipment_info?.weight || "Unknown",
    origin: trackShipData.shipment_info?.origin || "Unknown",
    destination: trackShipData.shipment_info?.destination || "Unknown",
    pol: trackShipData.shipment_info?.origin || "Unknown",
    pod: trackShipData.shipment_info?.destination || "Unknown",
    estimatedArrival: trackShipData.estimated_delivery || "Unknown",
    lastLocation: trackShipData.location || "Unknown",
    timeline: transformTrackShipEvents(trackShipData.events || []),
    documents: [], // TrackShip doesn't provide documents
    details: {
      packages: "Unknown",
      specialInstructions: trackShipData.status_detail || "",
      dimensions: trackShipData.shipment_info?.dimensions || "Unknown",
      shipmentType: trackShipData.shipment_info?.service_type || "Container Freight",
    },
  }
}

function transformTrackShipEvents(events: any[]) {
  const groupedEvents: Record<string, any> = {}

  events.forEach((event) => {
    const location = event.location || "Unknown"
    if (!groupedEvents[location]) {
      groupedEvents[location] = {
        location,
        events: [],
      }
    }

    groupedEvents[location].events.push({
      type: "event",
      status: event.description || event.status,
      timestamp: event.timestamp,
      date: new Date(event.timestamp).toLocaleDateString(),
      time: new Date(event.timestamp).toLocaleTimeString(),
    })
  })

  return Object.values(groupedEvents)
}
