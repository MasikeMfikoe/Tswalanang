import { type NextRequest, NextResponse } from "next/server"
import { MultiProviderTrackingService } from "@/lib/services/multi-provider-tracking-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trackingNumber, bookingType, preferScraping = false, carrierHint } = body

    console.log(
      `[API/Tracking] Received request for trackingNumber: ${trackingNumber}, bookingType: ${bookingType}, preferScraping: ${preferScraping}, carrierHint: ${carrierHint}`,
    )

    if (!trackingNumber) {
      console.warn("[API/Tracking] Missing tracking number in request.")
      return NextResponse.json(
        {
          success: false,
          error: "Tracking number is required",
        },
        { status: 400 },
      )
    }

    const multiProviderTrackingService = new MultiProviderTrackingService()
    console.log("[API/Tracking] MultiProviderTrackingService initialized.")

    const result = await multiProviderTrackingService.trackShipment(trackingNumber, {
      carrierHint,
      shipmentType: bookingType,
      preferScraping, // Pass preferScraping option to the service
    })

    if (result.success) {
      console.log(`[API/Tracking] Tracking successful for ${trackingNumber}. Source: ${result.source}`)
      return NextResponse.json({
        success: true,
        data: result.data,
        source: result.source,
        isLiveData: result.isLiveData,
        scrapedAt: result.scrapedAt,
      })
    } else {
      console.log(
        `[API/Tracking] Tracking failed for ${trackingNumber}. Error: ${result.error}, Source: ${result.source}`,
      )
      return NextResponse.json({
        success: false,
        error: result.error,
        source: result.source,
        fallbackOptions: result.fallbackOptions,
      })
    }
  } catch (error) {
    console.error("[API/Tracking] Uncaught API error:", error)
    // Log the full error object for debugging
    if (error instanceof Error) {
      console.error("[API/Tracking] Error name:", error.name)
      console.error("[API/Tracking] Error message:", error.message)
      console.error("[API/Tracking] Error stack:", error.stack)
    } else {
      console.error("[API/Tracking] Unknown error type:", typeof error, error)
    }

    return NextResponse.json(
      {
        success: false,
        error: "Tracking service temporarily unavailable",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const containerNumber = searchParams.get("container")
  const preferScraping = searchParams.get("scraping") === "true"
  const carrierHint = searchParams.get("carrier")
  const bookingType = searchParams.get("bookingType") || "ocean" // Added bookingType for GET requests

  console.log(
    `[API/Tracking] Received GET request for container: ${containerNumber}, scraping: ${preferScraping}, carrier: ${carrierHint}, bookingType: ${bookingType}`,
  )

  if (!containerNumber) {
    console.warn("[API/Tracking] Missing container number in GET request.")
    return NextResponse.json(
      {
        success: false,
        error: "Container number is required",
      },
      { status: 400 },
    )
  }

  try {
    const multiProviderTrackingService = new MultiProviderTrackingService()
    const result = await multiProviderTrackingService.trackShipment(containerNumber, {
      preferScraping,
      carrierHint: carrierHint || undefined,
      shipmentType: bookingType as "ocean" | "air" | "lcl", // Cast to valid type
    })

    console.log(
      `[API/Tracking] GET request result for ${containerNumber}: Success: ${result.success}, Source: ${result.source}`,
    )
    return NextResponse.json(result)
  } catch (error) {
    console.error("[API/Tracking] Uncaught API GET error:", error)
    if (error instanceof Error) {
      console.error("[API/Tracking] GET Error name:", error.name)
      console.error("[API/Tracking] GET Error message:", error.message)
      console.error("[API/Tracking] GET Error stack:", error.stack)
    } else {
      console.error("[API/Tracking] GET Unknown error type:", typeof error, error)
    }
    return NextResponse.json(
      {
        success: false,
        error: "Enhanced tracking service temporarily unavailable",
      },
      { status: 500 },
    )
  }
}
