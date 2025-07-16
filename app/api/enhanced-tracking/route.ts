import { type NextRequest, NextResponse } from "next/server"
import { enhancedTrackingService } from "@/lib/services/enhanced-tracking-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { containerNumber, preferScraping = false, carrierHint, enableFallback = true } = body

    if (!containerNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Container number is required",
        },
        { status: 400 },
      )
    }

    console.log(`🚀 Enhanced tracking request for: ${containerNumber}`)
    console.log(`⚙️ Options:`, { preferScraping, carrierHint, enableFallback })

    const result = await enhancedTrackingService.trackContainer(containerNumber, {
      preferScraping,
      carrierHint,
      enableFallback,
    })

    if (result.success) {
      console.log(`✅ Enhanced tracking successful for ${containerNumber}`)
      return NextResponse.json({
        success: true,
        data: result.data,
        source: result.source,
        isLiveData: result.isLiveData,
        scrapedAt: result.scrapedAt,
      })
    } else {
      console.log(`❌ Enhanced tracking failed for ${containerNumber}`)
      return NextResponse.json({
        success: false,
        error: result.error,
        source: result.source,
        fallbackOptions: result.fallbackOptions,
      })
    }
  } catch (error) {
    console.error("Enhanced tracking API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Enhanced tracking service temporarily unavailable",
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

  if (!containerNumber) {
    return NextResponse.json(
      {
        success: false,
        error: "Container number is required",
      },
      { status: 400 },
    )
  }

  try {
    const result = await enhancedTrackingService.trackContainer(containerNumber, {
      preferScraping,
      carrierHint: carrierHint || undefined,
      enableFallback: true,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Enhanced tracking API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Enhanced tracking service temporarily unavailable",
      },
      { status: 500 },
    )
  }
}
