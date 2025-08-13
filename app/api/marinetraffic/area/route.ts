import { type NextRequest, NextResponse } from "next/server"
import { MarineTrafficService } from "@/lib/services/marinetraffic-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const minLat = searchParams.get("minLat")
    const maxLat = searchParams.get("maxLat")
    const minLon = searchParams.get("minLon")
    const maxLon = searchParams.get("maxLon")

    if (!minLat || !maxLat || !minLon || !maxLon) {
      return NextResponse.json(
        {
          success: false,
          error: "All coordinates (minLat, maxLat, minLon, maxLon) are required",
        },
        { status: 400 },
      )
    }

    const apiKey = process.env.MARINETRAFFIC_API_KEY || ""
    const marineTrafficService = new MarineTrafficService(apiKey)
    const result = await marineTrafficService.searchVesselsByArea(
      Number.parseFloat(minLat),
      Number.parseFloat(maxLat),
      Number.parseFloat(minLon),
      Number.parseFloat(maxLon),
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("MarineTraffic area search API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
