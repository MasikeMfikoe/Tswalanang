import type {
  GoCometAuthResponse,
  GoCometLiveTrackingResponse,
  GoCometLiveTrackingItem,
  TrackingData,
  TrackingEvent,
  ShipmentType,
  TrackingResult,
} from "@/types/tracking"

const GOCOMET_AUTH_URL = "https://login.gocomet.com/api/v1/integrations/generate-token-number"
const GOCOMET_LIVE_TRACKING_URL = "https://tracking.gocomet.com/api/v1/integrations/live-tracking"

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
  if (lowerEventName.includes("pickup")) return "pickup"
  if (lowerEventName.includes("out for delivery")) return "out-for-delivery"
  return "event"
}

export class GocometService {
  async authenticate(email: string, password: string): Promise<string | null> {
    try {
      const response = await fetch(GOCOMET_AUTH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`GoComet authentication failed with status ${response.status}: ${errorText}`)
        throw new Error(`GoComet authentication failed: ${errorText}`)
      }

      const data: GoCometAuthResponse = await response.json()
      return data.token
    } catch (error) {
      console.error("Error authenticating with GoComet:", error)
      return null
    }
  }

  async trackShipment(
    trackingNumber: string,
    token: string, // Accept the token as a parameter
    options?: { shipmentType?: ShipmentType; carrierHint?: string },
  ): Promise<TrackingResult> {
    if (!token) {
      return {
        success: false,
        error: "GoComet authentication token is missing.",
        source: "GoComet API",
        isLiveData: false,
      }
    }

    try {
      const url = new URL(GOCOMET_LIVE_TRACKING_URL)
      url.searchParams.append("tracking_numbers[]", trackingNumber)
      url.searchParams.append("token", token) // Use the passed token

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error(`GoComet live tracking API returned status ${response.status}: ${errorBody}`)
        return {
          success: false,
          error: `GoComet API error: ${response.status} - ${errorBody || "Unknown error"}`,
          source: "GoComet API",
          isLiveData: false,
        }
      }

      const result: GoCometLiveTrackingResponse = await response.json()

      if (result.updated_trackings && result.updated_trackings.length > 0) {
        const gocometData = result.updated_trackings[0]
        const transformedData: TrackingData = transformGocometData(gocometData)
        return { success: true, data: transformedData, source: "GoComet API", isLiveData: true }
      } else {
        return {
          success: false,
          error: "No live tracking information found for this number from GoComet.",
          source: "GoComet API",
          isLiveData: false,
        }
      }
    } catch (error: any) {
      console.error("Error fetching from GoComet API:", error)
      return {
        success: false,
        error: error.message || "Network error with GoComet API.",
        source: "GoComet API",
        isLiveData: false,
      }
    }
  }
}

// Helper function to parse DD/MM/YYYY HH:MM:SS to ISO string
function parseGoCometDateTime(dateStr?: string, timeStr?: string): string | undefined {
  if (!dateStr) return undefined
  const [day, month, year] = dateStr.split("/").map(Number)
  if (isNaN(day) || isNaN(month) || isNaN(year)) return undefined

  let isoString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`

  if (timeStr) {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number)
    if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
      isoString += `T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    }
  } else {
    isoString += "T00:00:00" // Default time if none provided
  }

  // GoComet dates are DD/MM/YYYY, so we need to construct a Date object carefully
  // Using YYYY-MM-DD format for Date constructor is safer
  try {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) {
      // Fallback for cases where direct ISO string might not work due to timezone or other issues
      return undefined
    }
    return date.toISOString()
  } catch (e) {
    console.error("Error parsing GoComet date:", dateStr, timeStr, e)
    return undefined
  }
}

function transformGocometData(gocometData: GoCometLiveTrackingItem): TrackingData {
  const timelineMap = new Map<string, { location: string; terminal?: string; events: TrackingEvent[] }>()

  gocometData.events.forEach((event) => {
    const locationKey = event.location || "Unknown Location"
    if (!timelineMap.has(locationKey)) {
      timelineMap.set(locationKey, { location: locationKey, events: [] })
    }

    // Combine date and time for timestamp, handling different formats
    const eventTimestamp =
      parseGoCometDateTime(event.actual_date, event.actual_datetime?.split(" ")[1]) ||
      parseGoCometDateTime(event.planned_date, event.planned_datetime?.split(" ")[1]) ||
      new Date().toISOString() // Fallback to current time if no date/time

    timelineMap.get(locationKey)?.events.push({
      timestamp: eventTimestamp,
      date: event.actual_date || event.planned_date,
      time: event.actual_datetime?.split(" ")[1] || event.planned_datetime?.split(" ")[1],
      status: event.display_event || event.event,
      location: event.location,
      description: event.remarks,
      vessel: event.vessel_details?.vessel_name,
      flightNumber: event.mode === "AIR" ? event.vessel_details?.vessel_num : undefined, // Assuming vessel_num is flight number for air
      type: mapGoCometEventType(event.event),
      mode: event.mode,
      voyage: event.vessel_details?.voyage_num,
      originalPlan: parseGoCometDateTime(event.original_planned_date, event.original_planned_datetime?.split(" ")[1]),
      currentPlan: parseGoCometDateTime(event.planned_date, event.planned_datetime?.split(" ")[1]),
      terminal: event.connected_port, // Using connected_port as terminal hint
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

  // Derive ETA and ETD from events
  const arrivalEvent = gocometData.events.find((e) => e.event === "arrival" || e.display_event === "Arrival")
  const departureEvent = gocometData.events.find(
    (e) => e.event === "origin_departure" || e.display_event === "Origin Departure",
  )

  const estimatedArrival = arrivalEvent?.planned_date
  const estimatedDeparture = departureEvent?.actual_date || departureEvent?.planned_date

  return {
    shipmentNumber: gocometData.tracking_number,
    status: gocometData.status,
    carrier: gocometData.carrier_name,
    containerNumber: gocometData.container_number,
    containerType: gocometData.container_type,
    weight: gocometData.other_data?.weight, // Assuming weight might be in other_data
    origin: gocometData.pol_name,
    destination: gocometData.pod_name,
    pol: gocometData.pol_name,
    pod: gocometData.pod_name,
    eta: estimatedArrival,
    etd: estimatedDeparture,
    lastLocation: gocometData.events[gocometData.events.length - 1]?.location, // Last event's location
    timeline: timeline,
    documents: [], // GoComet live tracking response doesn't seem to include documents directly in this structure
    details: {
      packages: gocometData.other_data?.packages, // Assuming packages might be in other_data
      dimensions: gocometData.other_data?.dimensions, // Assuming dimensions might be in other_data
      specialInstructions: gocometData.other_data?.special_instructions, // Assuming specialInstructions might be in other_data
      shipmentType: gocometData.mode?.toLowerCase() as ShipmentType,
      freeDaysBeforeDemurrage: gocometData.stats?.demurrage?.days_left || null,
    },
  }
}
