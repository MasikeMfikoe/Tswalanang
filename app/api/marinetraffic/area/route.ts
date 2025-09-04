import { type NextRequest, NextResponse } from "next/server"
import { MarineTrafficService } from "@/lib/services/marinetraffic-service"

const MARINETRAFFIC_API_KEY = process.env.MARINETRAFFIC_API_KEY

export async function GET(request: NextRequest) {
  try {
    if (!MARINETRAFFIC_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Server configuration error: MARINETRAFFIC_API_KEY is not set.",
        },
        { status: 500 }
      )
    }

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
        { status: 400 }
      )
    }

    const minLatNum = Number.parseFloat(minLat)
    const maxLatNum = Number.parseFloat(maxLat)
    const minLonNum = Number.parseFloat(minLon)
    const maxLonNum = Number.parseFloat(maxLon)

    if (
      !Number.isFinite(minLatNum) ||
      !Number.isFinite(maxLatNum) ||
      !Number.isFinite(minLonNum) ||
      !Number.isFinite(maxLonNum)
    ) {
      return NextResponse.json(
        { success: false, error: "All coordinates must be valid numbers" },
        { status: 400 }
      )
    }

    // Pass the required constructor argument (API key)
    const marineTrafficService = new MarineTrafficService(MARINETRAFFIC_API_KEY)

    const result = await marineTrafficService.searchVesselsByArea(
      minLatNum,
      maxLatNum,
      minLonNum,
      maxLonNum
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
      { status: 500 }
    )
  }
}
