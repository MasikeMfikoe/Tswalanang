import { type NextRequest, NextResponse } from "next/server"
import { MarineTrafficService } from "@/lib/services/marinetraffic-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const imo = searchParams.get("imo")
    const name = searchParams.get("name")
    const includePorts = searchParams.get("includePorts") === "true"

    if (!imo && !name) {
      return NextResponse.json(
        {
          success: false,
          error: "Either IMO number or vessel name is required",
        },
        { status: 400 },
      )
    }

    const marineTrafficService = new MarineTrafficService()
    let result

    if (imo) {
      result = await marineTrafficService.trackVesselByIMO(imo)
    } else if (name) {
      result = await marineTrafficService.trackVesselByName(name)
    }

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to track vessel",
        },
        { status: 500 },
      )
    }

    // If successful and port calls are requested, fetch them
    if (result.success && result.data && includePorts && result.data.vessel.imo) {
      const portCallsResult = await marineTrafficService.getVesselPortCalls(result.data.vessel.imo.toString())
      if (portCallsResult.success && portCallsResult.port_calls) {
        result.data.port_calls = portCallsResult.port_calls
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("MarineTraffic vessel API error:", error)
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

export async function POST(request: NextRequest) {
  try {
    const { vessels } = await request.json()

    if (!vessels || !Array.isArray(vessels)) {
      return NextResponse.json(
        {
          success: false,
          error: "Vessels array is required",
        },
        { status: 400 },
      )
    }

    const marineTrafficService = new MarineTrafficService()
    const results = []

    for (const vessel of vessels) {
      let result
      if (vessel.imo) {
        result = await marineTrafficService.trackVesselByIMO(vessel.imo)
      } else if (vessel.name) {
        result = await marineTrafficService.trackVesselByName(vessel.name)
      } else {
        result = {
          success: false,
          error: "Either IMO or name is required for each vessel",
        }
      }

      results.push({
        input: vessel,
        result,
      })
    }

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
      successful: results.filter((r) => r.result.success).length,
    })
  } catch (error) {
    console.error("MarineTraffic batch vessel API error:", error)
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
