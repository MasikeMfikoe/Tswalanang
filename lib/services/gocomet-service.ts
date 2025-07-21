import type { TrackingData, TrackingEvent, ShipmentType, TrackingResult } from "@/types/tracking"

interface GoCometTrackingResponse {
  status: string
  message: string
  data: {
    tracking_number: string
    current_status: string
    container_number?: string
    container_type?: string
    weight?: string
    origin?: string
    destination?: string
    pol?: string
    pod?: string
    eta?: string // Estimated Time of Arrival
    etd?: string // Estimated Time of Departure
    last_location?: string
    milestones: Array<{
      event_name: string
      location: string
      event_date: string // "YYYY-MM-DD"
      event_time: string // "HH:MM"
      description?: string
      vessel_name?: string
      flight_number?: string
      mode?: string // e.g., "Ocean", "Air"
      voyage_number?: string // Added for GoComet
    }>
    documents?: Array<{
      document_type?: string
      document_url: string
      document_description?: string
    }>
    // Assuming GoComet might provide more details under a 'details' object
    details?: {
      packages?: string
      dimensions?: string
      special_instructions?: string
      shipment_type?: string // "Ocean", "Air", "LCL"
    }
  }
}

// Helper to map GoComet event names to a more standardized type
const mapGoCometEventType = (eventName: string): TrackingEvent["type"] => {
  const lowerEventName = eventName.toLowerCase()
  if (lowerEventName.includes("departure") || lowerEventName.includes("departed")) return "vessel-departure"
  if (lowerEventName.includes("arrival") || lowerEventName.includes("arrived")) return "vessel-arrival"
  if (lowerEventName.includes("takeoff")) return "plane-takeoff"
  if (lowerEventName.includes("landing")) return "plane-landing"
  if (lowerEventName.includes("gate")) return "gate"
  if (lowerEventName.includes("load") || lowerEventName.includes("loaded")) return "load"
  if (lowerEventName.includes("received")) return "cargo-received"
  if (lowerEventName.includes("customs cleared")) return "customs-cleared"
  return "event"
}

export class GocometService {
  async trackShipment(
    trackingNumber: string,
    options?: { shipmentType?: ShipmentType; carrierHint?: string },
  ): Promise<TrackingResult> {
    const gocometToken = process.env.GOCOMET_API_KEY // Assuming API key is used as token

    if (!gocometToken) {
      return { success: false, error: "GoComet API key is not configured.", source: "GoComet API" }
    }

    try {
      const response = await fetch("https://api.gocomet.com/api/v1/integrations/track-shipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${gocometToken}`,
        },
        body: JSON.stringify({ tracking_number: trackingNumber }),
      })

      const result: GoCometTrackingResponse = await response.json()

      if (response.ok && result.status === "success" && result.data) {
        const transformedData: TrackingData = transformGocometData(result.data)
        return { success: true, data: transformedData, source: "GoComet API", isLiveData: true }
      } else {
        return {
          success: false,
          error: result.message || "Failed to retrieve tracking information from GoComet.",
          source: "GoComet API",
        }
      }
    } catch (error: any) {
      console.error("Error fetching from GoComet API:", error)
      return { success: false, error: error.message || "Network error with GoComet API.", source: "GoComet API" }
    }
  }
}

function transformGocometData(gocometData: GoCometTrackingResponse["data"]): TrackingData {
  const timelineMap = new Map<string, { location: string; terminal?: string; events: TrackingEvent[] }>()

  gocometData.milestones.forEach((milestone) => {
    const locationKey = milestone.location || "Unknown Location"
    if (!timelineMap.has(locationKey)) {
      timelineMap.set(locationKey, { location: locationKey, events: [] })
    }

    const eventTimestamp = `${milestone.event_date}T${milestone.event_time}:00` // Assuming time is HH:MM

    timelineMap.get(locationKey)?.events.push({
      timestamp: eventTimestamp,
      date: milestone.event_date,
      time: milestone.event_time,
      status: milestone.event_name,
      location: milestone.location,
      description: milestone.description,
      vessel: milestone.vessel_name,
      flightNumber: milestone.flight_number,
      type: mapGoCometEventType(milestone.event_name),
      mode: milestone.mode,
      voyage: milestone.voyage_number,
      originalPlan: "N/A (GoComet API does not provide)", // Placeholder
      currentPlan: "N/A (GoComet API does not provide)", // Placeholder
    })
  })

  // Sort events within each location by timestamp
  timelineMap.forEach((locationEntry) => {
    locationEntry.events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  })

  // Convert map to array and sort locations by the timestamp of their first event
  const timeline = Array.from(timelineMap.values()).sort((a, b) => {
    const firstEventA = a.events[0]?.timestamp ? new Date(a.events[0].timestamp).getTime() : 0
    const firstEventB = b.events[0]?.timestamp ? new Date(b.events[0].timestamp).getTime() : 0
    return firstEventA - firstEventB
  })

  return {
    shipmentNumber: gocometData.tracking_number,
    status: gocometData.current_status,
    containerNumber: gocometData.container_number,
    containerType: gocometData.container_type,
    weight: gocometData.weight,
    origin: gocometData.origin,
    destination: gocometData.destination,
    pol: gocometData.pol,
    pod: gocometData.pod,
    estimatedArrival: gocometData.eta,
    estimatedDeparture: gocometData.etd,
    lastLocation: gocometData.last_location,
    timeline: timeline,
    documents: gocometData.documents?.map((doc) => ({
      type: doc.document_type,
      url: doc.document_url,
      description: doc.document_description,
    })),
    details: gocometData.details
      ? {
          packages: gocometData.details.packages,
          dimensions: gocometData.details.dimensions,
          specialInstructions: gocometData.details.special_instructions,
          shipmentType: gocometData.details.shipment_type?.toLowerCase() as ShipmentType,
        }
      : undefined,
  }
}
