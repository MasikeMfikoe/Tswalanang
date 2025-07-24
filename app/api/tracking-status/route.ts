// This file was left out for brevity. Assume it is correct and does not need any modifications.
// Placeholder content for app/api/tracking-status/route.ts
import { NextResponse } from "next/server"
import { getLiveTrackingStatus } from "@/lib/services/live-tracking-status"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const trackingNumber = searchParams.get("trackingNumber")

  if (!trackingNumber) {
    return NextResponse.json({ error: "Tracking number is required" }, { status: 400 })
  }

  try {
    const status = await getLiveTrackingStatus(trackingNumber)
    return NextResponse.json(status)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
