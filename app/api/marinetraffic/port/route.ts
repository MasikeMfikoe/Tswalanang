import { type NextRequest, NextResponse } from "next/server"
import { MarineTrafficService } from "@/lib/services/marinetraffic-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const portId = searchParams.get("portId")

    if (!portId) {
      return NextResponse.json(
        {
          success: false,
          error: "Port ID is required",
        },
        { status: 400 },
      )
    }

    const apiKey = process.env.MARINETRAFFIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "MarineTraffic API key not configured",
        },
        { status: 500 },
      )
    }

    const marineTrafficService = new MarineTrafficService(apiKey)
    const result = await marineTrafficService.getVesselsInPort(Number.parseInt(portId))

    return NextResponse.json(result)
  } catch (error) {
    console.error("MarineTraffic port API error:", error)
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
