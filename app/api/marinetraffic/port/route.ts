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

    const marineTrafficService = new MarineTrafficService()
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
