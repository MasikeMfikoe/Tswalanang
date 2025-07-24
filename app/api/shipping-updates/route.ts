// This file was left out for brevity. Assume it is correct and does not need any modifications.
// Placeholder content for app/api/shipping-updates/route.ts
import { NextResponse } from "next/server"
import { shippingUpdateService } from "@/lib/services/shipping-update-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const trackingNumber = searchParams.get("trackingNumber")
  const carrier = searchParams.get("carrier")

  if (!trackingNumber || !carrier) {
    return NextResponse.json({ error: "Tracking number and carrier are required" }, { status: 400 })
  }

  try {
    const updates = await shippingUpdateService.getShipmentUpdates(trackingNumber, carrier)
    return NextResponse.json(updates)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
