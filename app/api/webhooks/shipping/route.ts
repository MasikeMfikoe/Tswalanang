import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { v4 as uuidv4 } from "uuid"
import type { ShipmentUpdate, ShippingLine } from "@/types/shipping"
import { updateShipmentStatus } from "@/lib/services/shipping-update-service"

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    console.log("Received shipping webhook:", JSON.stringify(payload, null, 2))

    // Determine which shipping line sent the webhook
    const shippingLine = determineShippingLine(request.headers)

    // Process the webhook data
    const result = await updateShipmentStatus(payload, shippingLine)

    if (result.success) {
      return NextResponse.json({ message: result.message }, { status: 200 })
    } else {
      console.error("Failed to process shipping webhook:", result.message)
      return NextResponse.json({ error: result.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Error handling shipping webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function determineShippingLine(headers: Headers): ShippingLine {
  // Check headers or other identifiers to determine which shipping line sent the webhook
  const source = headers.get("X-Webhook-Source")

  if (source?.includes("maersk")) {
    return "maersk"
  } else if (source?.includes("msc")) {
    return "msc"
  }

  // Default to 'other' if we can't determine
  return "other"
}
