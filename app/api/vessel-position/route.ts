import { type NextRequest, NextResponse } from "next/server"
import { MarineTrafficService } from "@/lib/services/marinetraffic-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const imo = searchParams.get("imo")

    if (!imo) {
      return NextResponse.json(
        {
          success: false,
          error: "IMO number is required",
        },
        { status: 400 },
      )
    }

    // Use the server-side environment variable for the API key
    const marineTrafficService = new MarineTrafficService(process.env.MARINETRAFFIC_API_KEY || "")
    const result = await marineTrafficService.getVesselPosition(imo)

    return NextResponse.json(result)
  } catch (error) {
    console.error("API vessel position error:", error)
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
