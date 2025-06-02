import { type NextRequest, NextResponse } from "next/server"
import { trackContainerExternal } from "@/lib/services/external-tracking-service"
import { detectContainerInfo, getShippingLineInfo } from "@/lib/services/container-detection-service"

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
    console.log(`Live tracking request for: ${cleanTrackingNumber} (${bookingType})`)

    // Try live tracking first
    const liveResult = await trackContainerExternal(cleanTrackingNumber)

    if (liveResult.success && liveResult.data) {
      console.log(`Live tracking successful from ${liveResult.source}`)
      return NextResponse.json({
        success: true,
        data: transformToTrackingResult(liveResult.data, cleanTrackingNumber, bookingType),
        source: liveResult.source,
        isLiveData: true,
      })
    }

    // Live tracking failed, check if we can provide carrier info
    const containerInfo = detectContainerInfo(cleanTrackingNumber)
    const shippingLineInfo = getShippingLineInfo(containerInfo.prefix)

    if (shippingLineInfo) {
      // Return carrier info with external link
      return NextResponse.json({
        success: false,
        error: `Live tracking not available for ${shippingLineInfo.name}. Please use their website directly.`,
        carrierInfo: {
          name: shippingLineInfo.name,
          trackingUrl: `${shippingLineInfo.trackingUrl}${cleanTrackingNumber}`,
          apiSupported: shippingLineInfo.apiSupported,
        },
        fallbackToMock: true,
      })
    }

    // Unknown carrier
    return NextResponse.json({
      success: false,
      error: "Unable to identify shipping line for this tracking number",
      fallbackToMock: true,
    })
  } catch (error) {
    console.error("Tracking API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while processing tracking request",
        fallbackToMock: true,
      },
      { status: 500 },
    )
  }
}

// Transform external API data to our internal format
function transformToTrackingResult(externalData: any, trackingNumber: string, bookingType: string) {
  return {
    shipmentNumber: trackingNumber,
    status: externalData.status || "Unknown",
    containerNumber: externalData.containerNumber || trackingNumber,
    containerType: externalData.cargoDetails?.containerType || getContainerTypeByBooking(bookingType),
    weight: externalData.cargoDetails?.weight || "Unknown",
    origin: extractOrigin(externalData.events),
    destination: extractDestination(externalData.events),
    pol: extractOrigin(externalData.events),
    pod: extractDestination(externalData.events),
    estimatedArrival: externalData.eta || "Unknown",
    lastLocation: `${externalData.status} • ${externalData.location}`,
    timeline: transformEventsToTimeline(externalData.events),
    documents: generateDocumentsForBookingType(bookingType),
    details: {
      packages: externalData.cargoDetails?.packages || "Unknown",
      specialInstructions: "Live tracking data",
      dimensions: externalData.cargoDetails?.volume || "Unknown",
      shipmentType: getShipmentTypeByBooking(bookingType),
    },
  }
}

function getContainerTypeByBooking(bookingType: string): string {
  switch (bookingType) {
    case "air":
      return "Air Cargo"
    case "lcl":
      return "LCL Consolidation"
    default:
      return "40ft High Cube"
  }
}

function getShipmentTypeByBooking(bookingType: string): string {
  switch (bookingType) {
    case "air":
      return "Air Freight Express"
    case "lcl":
      return "LCL Ocean Freight"
    default:
      return "Ocean Freight"
  }
}

function extractOrigin(events: any[]): string {
  if (!events || events.length === 0) return "Unknown"
  return events[0]?.location || "Unknown"
}

function extractDestination(events: any[]): string {
  if (!events || events.length === 0) return "Unknown"
  return events[events.length - 1]?.location || "Unknown"
}

function transformEventsToTimeline(events: any[]) {
  if (!events || events.length === 0) return []

  const groupedByLocation = events.reduce((acc, event) => {
    const location = event.location || "Unknown"
    if (!acc[location]) {
      acc[location] = []
    }
    acc[location].push({
      type: determineEventType(event.status),
      status: event.status,
      vessel: event.description,
      timestamp: event.timestamp,
      time: new Date(event.timestamp).toLocaleTimeString(),
      date: new Date(event.timestamp).toLocaleDateString(),
    })
    return acc
  }, {})

  return Object.entries(groupedByLocation).map(([location, events]) => ({
    location,
    events: events as any[],
  }))
}

function determineEventType(status: string): string {
  const statusLower = status.toLowerCase()
  if (statusLower.includes("departure") || statusLower.includes("sailed")) return "vessel-departure"
  if (statusLower.includes("arrival") || statusLower.includes("arrived")) return "vessel-arrival"
  if (statusLower.includes("gate")) return "gate"
  if (statusLower.includes("load")) return "load"
  return "event"
}

function generateDocumentsForBookingType(bookingType: string) {
  const baseDate = new Date().toLocaleDateString()

  switch (bookingType) {
    case "air":
      return [
        { name: "Air Waybill", type: "PDF", url: "#", date: baseDate },
        { name: "Commercial Invoice", type: "PDF", url: "#", date: baseDate },
        { name: "Packing List", type: "PDF", url: "#", date: baseDate },
      ]
    case "lcl":
      return [
        { name: "House Bill of Lading", type: "PDF", url: "#", date: baseDate },
        { name: "Master Bill of Lading", type: "PDF", url: "#", date: baseDate },
        { name: "Commercial Invoice", type: "PDF", url: "#", date: baseDate },
        { name: "Packing List", type: "PDF", url: "#", date: baseDate },
      ]
    default:
      return [
        { name: "Commercial Invoice", type: "PDF", url: "#", date: baseDate },
        { name: "Packing List", type: "PDF", url: "#", date: baseDate },
        { name: "Bill of Lading", type: "PDF", url: "#", date: baseDate },
        { name: "Certificate of Origin", type: "PDF", url: "#", date: baseDate },
      ]
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Live Tracking API is active",
    timestamp: new Date().toISOString(),
    mode: "live",
  })
}
