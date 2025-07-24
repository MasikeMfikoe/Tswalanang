import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { v4 as uuidv4 } from "uuid"
import type { ShipmentUpdate } from "@/types/shipping"
import crypto from "crypto"

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

    // Verify signature
    const signature = request.headers.get("X-TrackShip-Signature")
    const timestamp = request.headers.get("X-TrackShip-Timestamp")
    const secret = process.env.TRACKSHIP_WEBHOOK_SECRET || ""

    if (!signature) {
      console.error("Missing signature in TrackShip webhook")
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    const isSignatureValid = await verifyTrackShipSignature(body, signature, timestamp, secret)
    if (!isSignatureValid) {
      console.error("Invalid signature in TrackShip webhook")
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    // Process the webhook data
    const update = await processTrackShipWebhook(data)
    if (!update) {
      console.error("Failed to process TrackShip webhook data")
      return NextResponse.json({ error: "Failed to process webhook data" }, { status: 500 })
    }

    // Simple success response
    return NextResponse.json({
      success: true,
      message: "Webhook received and processed successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
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

async function processTrackShipWebhook(data: any): Promise<ShipmentUpdate | null> {
  try {
    console.log("Processing TrackShip webhook data:", data)

    // Handle different TrackShip webhook formats
    const trackingData = data.data || data.tracking || data
    const trackingNumber = trackingData.tracking_number || trackingData.trackingNumber || data.tracking_number
    const carrier = trackingData.carrier?.name || trackingData.carrier || "unknown"
    const status = normalizeTrackShipStatus(trackingData.status || trackingData.delivery_status)
    const location = trackingData.location || trackingData.current_location || "Unknown"
    const timestamp = trackingData.timestamp || trackingData.updated_at || new Date().toISOString()
    const estimatedDelivery = trackingData.estimated_delivery || trackingData.eta
    const statusDetail = trackingData.status_detail || trackingData.description
    const events = trackingData.events || trackingData.tracking_events || []

    if (!trackingNumber) {
      console.error("TrackShip webhook missing tracking number. Available fields:", Object.keys(trackingData))
      return null
    }

    console.log("Extracted tracking info:", {
      trackingNumber,
      carrier,
      status,
      location,
      timestamp,
    })

    // Find the shipment in our database
    const { data: shipments, error } = await supabase
      .from("shipments")
      .select("*")
      .or(`container_number.eq.${trackingNumber},booking_reference.eq.${trackingNumber}`)
      .limit(1)

    if (error) {
      console.error("Error finding shipment:", error)
      return null
    }

    if (!shipments || shipments.length === 0) {
      console.log("Creating new shipment record for tracking number:", trackingNumber)

      // Create a new shipment record if it doesn't exist
      const newShipment = {
        id: uuidv4(),
        container_number: trackingNumber,
        booking_reference: trackingNumber,
        status: status,
        location: location,
        carrier: carrier,
        eta: estimatedDelivery,
        last_updated: timestamp,
        created_at: new Date().toISOString(),
      }

      const { data: createdShipment, error: createError } = await supabase
        .from("shipments")
        .insert(newShipment)
        .select()
        .single()

      if (createError) {
        console.error("Error creating shipment:", createError)
        return null
      }

      shipments.push(createdShipment)
    }

    const shipment = shipments[0]

    // Create update record
    const update: ShipmentUpdate = {
      id: uuidv4(),
      shipmentId: shipment.id,
      containerNumber: trackingNumber,
      bookingReference: shipment.booking_reference,
      shippingLine: mapCarrierToShippingLine(carrier),
      status: status,
      previousStatus: shipment.status,
      location: location,
      timestamp: timestamp,
      eta: estimatedDelivery,
      vessel: trackingData.vessel?.name || trackingData.vessel_name,
      voyage: trackingData.voyage?.number || trackingData.voyage_number,
      details: statusDetail || `${status} - ${location}`,
      source: "trackship-webhook",
      raw: JSON.stringify(data),
      createdAt: new Date().toISOString(),
    }

    // Save the update to the database
    const { error: updateError } = await supabase.from("shipment_updates").insert(update)

    if (updateError) {
      console.error("Error saving shipment update:", updateError)
      return null
    }

    // Update the shipment with new status
    const { error: shipmentError } = await supabase
      .from("shipments")
      .update({
        status: status,
        location: location,
        last_updated: timestamp,
        eta: estimatedDelivery,
        carrier: carrier,
      })
      .eq("id", shipment.id)

    if (shipmentError) {
      console.error("Error updating shipment:", shipmentError)
    }

    console.log("Successfully processed TrackShip webhook for:", trackingNumber)
    return update
  } catch (error) {
    console.error("Error processing TrackShip webhook:", error)
    return null
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
