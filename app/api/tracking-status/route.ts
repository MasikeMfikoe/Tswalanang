import { NextResponse } from "next/server"
import { getLiveTrackingStatus } from "@/lib/services/live-tracking-status"

export async function GET() {
  try {
    const carriers = getLiveTrackingStatus()

    const carriersLength = Array.isArray(carriers) ? carriers.length : 0
    const activeLength = Array.isArray(carriers) ? carriers.filter((c) => c.status === "active").length : 0
    const supportedLength = Array.isArray(carriers) ? carriers.filter((c) => c.isLiveSupported).length : 0

    return NextResponse.json({
      success: true,
      carriers,
      summary: {
        total: carriersLength,
        active: activeLength,
        supported: supportedLength,
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
