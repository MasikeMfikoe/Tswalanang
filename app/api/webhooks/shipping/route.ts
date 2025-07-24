import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { v4 as uuidv4 } from "uuid"
import type { ShipmentUpdate, ShippingLine } from "@/types/shipping"

export async function POST(request: Request) {
  try {
    // Verify the webhook signature if provided
    // This would be different for each shipping line

    // Parse the request body
    const body = await request.json()
    console.log("Received shipping webhook:", body)

    // Determine which shipping line sent the webhook
    const shippingLine = determineShippingLine(request.headers)

    // Process the webhook data
    const update = await processWebhook(shippingLine, body)

    if (!update) {
      return NextResponse.json({ error: "Could not process webhook data" }, { status: 400 })
    }

    return NextResponse.json({ success: true, update })
  } catch (error) {
    console.error("Error processing shipping webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
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

async function processWebhook(shippingLine: ShippingLine, data: any): Promise<ShipmentUpdate | null> {
  try {
    // Extract container number or booking reference
    let containerNumber, bookingReference

    if (shippingLine === "maersk") {
      containerNumber = data.container?.number
      bookingReference = data.booking?.reference
    } else if (shippingLine === "msc") {
      containerNumber = data.containerNumber
      bookingReference = data.bookingReference
    } else {
      // Generic extraction attempt
      containerNumber = data.containerNumber || data.container_number
      bookingReference = data.bookingReference || data.booking_reference
    }

    if (!containerNumber && !bookingReference) {
      console.error("Webhook data missing container number and booking reference")
      return null
    }

    // Find the shipment in our database
    const { data: shipments, error } = await supabase
      .from("shipments")
      .select("*")
      .or(`container_number.eq.${containerNumber},booking_reference.eq.${bookingReference}`)
      .limit(1)

    if (error || !shipments || shipments.length === 0) {
      console.error("Shipment not found for webhook data:", { containerNumber, bookingReference })
      return null
    }

    const shipment = shipments[0]

    // Extract status information based on shipping line
    let status, location, timestamp, vessel, voyage, eta, details

    if (shippingLine === "maersk") {
      status = normalizeStatus(data.event?.type)
      location = `${data.location?.city}, ${data.location?.country}`
      timestamp = data.event?.timestamp
      vessel = data.vessel?.name
      voyage = data.vessel?.voyage
      eta = data.estimatedArrival?.dateTime
      details = data.event?.description
    } else if (shippingLine === "msc") {
      status = normalizeStatus(data.eventName)
      location = data.location
      timestamp = data.eventDate
      vessel = data.vesselName
      voyage = data.voyageReference
      eta = data.estimatedArrival
      details = data.remarks
    } else {
      // Generic extraction attempt
      status = normalizeStatus(data.status || data.eventType || data.eventName)
      location = data.location
      timestamp = data.timestamp || data.eventDate || data.date
      vessel = data.vessel || data.vesselName
      voyage = data.voyage || data.voyageReference
      eta = data.eta || data.estimatedArrival
      details = data.details || data.description || data.remarks
    }

    // Create update record
    const update: ShipmentUpdate = {
      id: uuidv4(),
      shipmentId: shipment.id,
      containerNumber: containerNumber || shipment.container_number,
      bookingReference: bookingReference || shipment.booking_reference,
      shippingLine,
      status,
      previousStatus: shipment.status,
      location,
      timestamp,
      eta,
      vessel,
      voyage,
      details,
      source: "webhook",
      raw: JSON.stringify(data),
      createdAt: new Date().toISOString(),
    }

    // Save the update to the database
    const { error: updateError } = await supabase.from("shipment_updates").insert(update)

    if (updateError) {
      throw updateError
    }

    // Update the shipment with new status
    const { error: shipmentError } = await supabase
      .from("shipments")
      .update({
        status,
        location,
        last_updated: new Date().toISOString(),
        eta,
        vessel,
        voyage,
      })
      .eq("id", shipment.id)

    if (shipmentError) {
      throw shipmentError
    }

    return update
  } catch (error) {
    console.error("Error processing webhook:", error)
    return null
  }
}

function normalizeStatus(externalStatus: string): string {
  // Map external status codes to internal ones
  const statusMap: Record<string, string> = {
    // Common Maersk statuses
    "Gate out empty": "at-origin",
    "Gate in": "at-origin",
    "Loaded on vessel": "cargo-departed",
    "Vessel departure": "cargo-departed",
    "Vessel arrival": "at-destination",
    Discharged: "at-destination",
    Delivered: "delivered",

    // Add mappings for other carriers
  }

  return statusMap[externalStatus] || "in-transit" // Default to in-transit
}
