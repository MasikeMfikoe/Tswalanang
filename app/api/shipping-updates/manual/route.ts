import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { updateShipmentStatus } from "@/lib/services/shipping-update-service"

export async function POST(request: Request) {
  const { trackingNumber, newStatus, location, eventTime, remarks } = await request.json()

  if (!trackingNumber || !newStatus) {
    return NextResponse.json({ error: "Tracking number and new status are required" }, { status: 400 })
  }

  try {
    const result = await updateShipmentStatus(trackingNumber, newStatus, location, eventTime, remarks)

    if (result.success) {
      return NextResponse.json({ message: result.message }, { status: 200 })
    } else {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Error processing manual shipping update:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
