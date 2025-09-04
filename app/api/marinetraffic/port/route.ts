import { type NextRequest, NextResponse } from "next/server"
import { MarineTrafficService } from "@/lib/services/marinetraffic-service"

const MARINETRAFFIC_API_KEY = process.env.MARINETRAFFIC_API_KEY

export async function GET(request: NextRequest) {
  try {
    if (!MARINETRAFFIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Server config error: MARINETRAFFIC_API_KEY is not set." },
        { status: 500 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const portId = searchParams.get("portId")

    if (!portId) {
      return NextResponse.json(
        { success: false, error: "Port ID is required" },
        { status: 400 }
      )
    }

    const portIdNum = Number.parseInt(portId, 10)
    if (!Number.isInteger(portIdNum) || portIdNum <= 0) {
      return NextResponse.json(
        { success: false, error: "Port ID must be a positive integer" },
        { status: 400 }
      )
    }

    // Pass the required constructor argument (API key)
    const marineTrafficService = new MarineTrafficService(MARINETRAFFIC_API_KEY)

    const result = await marineTrafficService.getVesselsInPort(portIdNum)

    return NextResponse.json(result)
  } catch (error) {
    console.error("MarineTraffic port API error:", error)
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
