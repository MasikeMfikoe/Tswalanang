import { type NextRequest, NextResponse } from "next/server"
import { TrackShipService } from "@/lib/services/trackship-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { trackingNumber, carrier } = body

    if (!trackingNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Tracking number is required",
        },
        { status: 400 },
      )
    }

    const trackShipService = new TrackShipService()
    const result = await trackShipService.trackShipment(trackingNumber, carrier)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("TrackShip API route error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const trackShipService = new TrackShipService()
    const carriers = await trackShipService.getSupportedCarriers()

    return NextResponse.json({
      success: true,
      carriers,
      message: "TrackShip service is active",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get carriers",
      },
      { status: 500 },
    )
  }
}
