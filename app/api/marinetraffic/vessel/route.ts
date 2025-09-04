import { type NextRequest, NextResponse } from "next/server"
import { MarineTrafficService } from "@/lib/services/marinetraffic-service"

const MARINETRAFFIC_API_KEY = process.env.MARINETRAFFIC_API_KEY

export async function GET(request: NextRequest) {
  try {
    if (!MARINETRAFFIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Server config error: MARINETRAFFIC_API_KEY is not set." },
        { status: 500 },
      )
    }

    const searchParams = request.nextUrl.searchParams
    const imo = searchParams.get("imo")
    const name = searchParams.get("name")
    const includePorts = searchParams.get("includePorts") === "true"

    if (!imo && !name) {
      return NextResponse.json(
        { success: false, error: "Either IMO number or vessel name is required" },
        { status: 400 },
      )
    }

    // Pass API key to the service constructor
    const marineTrafficService = new MarineTrafficService(MARINETRAFFIC_API_KEY)

    let result: any
    if (imo) {
      result = await marineTrafficService.trackVesselByIMO(imo)
    } else {
      result = await marineTrafficService.trackVesselByName(name!)
    }

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Failed to track vessel" },
        { status: 500 },
      )
    }

    // Optionally include recent port calls
    if (result.success && result.data && includePorts && result.data.vessel?.imo) {
      const portCallsResult = await marineTrafficService.getVesselPortCalls(
        String(result.data.vessel.imo),
      )
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
    if (!MARINETRAFFIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Server config error: MARINETRAFFIC_API_KEY is not set." },
        { status: 500 },
      )
    }

    const body = await request.json().catch(() => ({}))
    const vessels = body?.vessels

    if (!Array.isArray(vessels)) {
      return NextResponse.json(
        { success: false, error: "Vessels array is required" },
        { status: 400 },
      )
    }

    const marineTrafficService = new MarineTrafficService(MARINETRAFFIC_API_KEY)

    const results = await Promise.all(
      vessels.map(async (v: any) => {
        let res: any
        if (v?.imo) {
          res = await marineTrafficService.trackVesselByIMO(v.imo)
        } else if (v?.name) {
          res = await marineTrafficService.trackVesselByName(v.name)
        } else {
          res = { success: false, error: "Either IMO or name is required for each vessel" }
        }
        return { input: v, result: res }
      }),
    )

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
      successful: results.filter((r) => r.result?.success).length,
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
