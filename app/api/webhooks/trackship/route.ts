import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { v4 as uuidv4 } from "uuid"
import type { ShipmentUpdate } from "@/types/shipping"
import crypto from "crypto"
import { updateShipmentStatus } from "@/lib/services/shipping-update-service"

export async function GET() {
  return NextResponse.json({
    message: "TrackShip webhook endpoint is active",
    timestamp: new Date().toISOString(),
    app: "TSW SmartLog",
    version: "1.0",
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log("TrackShip webhook received")

    const body = await request.text()
    console.log("Webhook body:", body)

    // Basic processing without signature verification for now
    let data
    try {
      data = JSON.parse(body)
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError)
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    console.log("Parsed data:", data)

    // Assuming TrackShip webhook payload structure:
    // {
    //   "tracking_number": "YOUR_TRACKING_NUMBER",
    //   "status": "DELIVERED",
    //   "location": "New York",
    //   "event_time": "2023-10-27T10:00:00Z",
    //   "description": "Package delivered successfully"
    // }

    const trackingNumber = data.tracking_number
    const newStatus = data.status
    const location = data.location
    const eventTime = data.event_time
    const remarks = data.description

    if (!trackingNumber || !newStatus) {
      return NextResponse.json({ error: "Missing tracking_number or status in TrackShip webhook payload" }, { status: 400 })
    }

    const result = await updateShipmentStatus(trackingNumber, newStatus, location, eventTime, remarks)

    if (result.success) {
      return NextResponse.json({ message: result.message }, { status: 200 })
    } else {
      console.error("Failed to process TrackShip webhook:", result.message)
      return NextResponse.json({ error: result.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Error handling TrackShip webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function verifyTrackShipSignature(
  body: string,
  signature: string,
  timestamp: string | null,
  secret: string,
): Promise<boolean> {
  try {
    // TrackShip typically uses different signature formats
    // Let's try multiple common formats

    // Format 1: HMAC-SHA256 of just the body
    const hmac1 = crypto.createHmac("sha256", secret)
    hmac1.update(body, "utf8")
    const signature1 = hmac1.digest("hex")

    // Format 2: HMAC-SHA256 with timestamp (if provided)
    let signature2 = ""
    if (timestamp) {
      const hmac2 = crypto.createHmac("sha256", secret)
      hmac2.update(timestamp + "." + body, "utf8")
      signature2 = hmac2.digest("hex")
    }

    // Format 3: Base64 encoded
    const hmac3 = crypto.createHmac("sha256", secret)
    hmac3.update(body, "utf8")
    const signature3 = hmac3.digest("base64")

    // Format 4: With sha256= prefix (like GitHub)
    const signature4 = "sha256=" + signature1

    console.log("Signature verification attempts:")
    console.log("Received:", signature)
    console.log("Method 1 (hex):", signature1)
    console.log("Method 2 (timestamp+hex):", signature2)
    console.log("Method 3 (base64):", signature3)
    console.log("Method 4 (sha256=hex):", signature4)

    // Check all possible formats
    const possibleSignatures = [signature1, signature2, signature3, signature4].filter(Boolean)

    for (const possibleSig of possibleSignatures) {
      if (crypto.timingSafeEqual(Buffer.from(signature, "utf8"), Buffer.from(possibleSig, "utf8"))) {
        console.log("Signature match found with method:", possibleSig)
        return true
      }
    }

    return false
  } catch (error) {
    console.error("Error verifying signature:", error)
    return false
  }
}

function normalizeTrackShipStatus(status: string): string {
  if (!status) return "in-transit"

  const statusMap: Record<string, string> = {
    in_transit: "in-transit",
    out_for_delivery: "out-for-delivery",
    delivered: "delivered",
    exception: "exception",
    pending: "pending",
    pre_transit: "at-origin",
    available_for_pickup: "at-destination",
    picked_up: "cargo-departed",
    departed: "cargo-departed",
    arrived: "cargo-arrived",
    customs_cleared: "customs-cleared",
  }

  return statusMap[status.toLowerCase()] || "in-transit"
}

function mapCarrierToShippingLine(
  carrier: string,
): "maersk" | "msc" | "cma-cgm" | "hapag-lloyd" | "one" | "evergreen" | "cosco" | "other" {
  if (!carrier) return "other"

  const carrierMap: Record<string, any> = {
    maersk: "maersk",
    msc: "msc",
    "cma cgm": "cma-cgm",
    "hapag lloyd": "hapag-lloyd",
    "hapag-lloyd": "hapag-lloyd",
    one: "one",
    evergreen: "evergreen",
    cosco: "cosco",
  }

  return carrierMap[carrier.toLowerCase()] || "other"
}
