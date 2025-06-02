import { NextResponse } from "next/server"
import { getLiveTrackingStatus } from "@/lib/services/live-tracking-status"

export async function GET() {
  try {
    const carriers = getLiveTrackingStatus()

    return NextResponse.json({
      success: true,
      carriers,
      summary: {
        total: carriers.length,
        active: carriers.filter((c) => c.status === "active").length,
        supported: carriers.filter((c) => c.isLiveSupported).length,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error getting tracking status:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get tracking status",
      },
      { status: 500 },
    )
  }
}
