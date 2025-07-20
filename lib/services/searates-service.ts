import type { TrackingResult, TrackingData, TrackingEvent } from "@/types/tracking"

export class SeaRatesService {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.SEARATES_API_KEY || ""
    this.baseUrl = "https://tracking.searates.com/tracking" // Updated API endpoint
  }

  async trackShipment(
    trackingNumber: string,
    options?: {
      sealine?: string
      type?: "CT" | "BL" | "BK"
      forceUpdate?: boolean
      includeRoute?: boolean
      includeAis?: boolean
    },
  ): Promise<TrackingResult> {
    if (!this.apiKey) {
      return {
        success: false,
        error: "SeaRates API key not configured.",
        source: "SeaRates",
      }
    }

    const params = new URLSearchParams({
      api_key: this.apiKey,
      number: trackingNumber,
    })

    if (options?.sealine) {
      params.append("sealine", options.sealine)
    }
    if (options?.type) {
      params.append("type", options.type)
    }
    if (options?.forceUpdate) {
      params.append("force_update", "true")
    }
    if (options?.includeRoute) {
      params.append("route", "true")
    }
    if (options?.includeAis) {
      params.append("ais", "true")
    }

    try {
      const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
        method: "GET", // Changed to GET
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`SeaRates API error (${response.status}): ${errorText}`)
        return {
          success: false,
          error: `SeaRates API returned status ${response.status}.`,
          source: "SeaRates",
        }
      }

      const data = await response.json()

      if (data.status === "success" && data.data) {
        return {
          success: true,
          data: this.transformSeaRatesData(data.data),
          source: "SeaRates",
          isLiveData: !data.data.metadata?.from_cache, // Assuming 'from_cache' indicates live data
          scrapedAt: data.data.metadata?.updated_at,
        }
      } else {
        console.warn("SeaRates API response indicates failure or no tracking info:", data)
        return {
          success: false,
          error: data.message || "No tracking information found for this number via SeaRates.",
          source: "SeaRates",
        }
      }
    } catch (error) {
      console.error("Error tracking with SeaRates:", error)
      return {
        success: false,
        error: `Failed to connect to SeaRates service: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "SeaRates",
      }
    }
  }

  private transformSeaRatesData(seaRatesData: any): TrackingData {
    const locationsMap = new Map<number, any>()
    seaRatesData.locations?.forEach((loc: any) => locationsMap.set(loc.id, loc))

    const facilitiesMap = new Map<number, any>()
    seaRatesData.facilities?.forEach((fac: any) => facilitiesMap.set(fac.id, fac))

    const vesselsMap = new Map<number, any>()
    seaRatesData.vessels?.forEach((vessel: any) => vesselsMap.set(vessel.id, vessel))

    const containers = seaRatesData.containers || []
    const firstContainer = containers[0] || {}

    const timeline: Array<{ location: string; terminal?: string; events: TrackingEvent[] }> = []
    const groupedEvents = new Map<string, TrackingEvent[]>()

    let lastLocationName = "N/A"

    containers.forEach((container: any) => {
      container.events?.forEach((event: any) => {
        const location = locationsMap.get(event.location)
        const facility = facilitiesMap.get(event.facility)
        const vessel = vesselsMap.get(event.vessel)

        const eventLocationName = location?.name || "Unknown Location"
        const eventTerminalName = facility?.name || undefined

        const eventDate = event.date ? new Date(event.date) : new Date()
        const formattedDate = eventDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
        const formattedTime = eventDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })

        let eventType: TrackingEvent["type"] = "event"
        switch (event.event_code) {
          case "DEPA":
            eventType = event.type === "sea" ? "vessel-departure" : "event"
            break
          case "ARRI":
            eventType = event.type === "sea" ? "vessel-arrival" : "event"
            break
          case "GTOT":
          case "GTIN":
            eventType = "gate"
            break
          case "LOAD":
            eventType = "load"
            break
          case "RECE":
            eventType = "cargo-received"
            break
          case "CUSR":
            eventType = "customs-cleared"
            break
          case "DISC":
            eventType = "event" // Discharge could be cargo-received or other, keeping general
            break
          default:
            eventType = "event"
        }

        const transformedEvent: TrackingEvent = {
          type: eventType,
          status: event.description || event.status || "Unknown Status",
          location: eventLocationName,
          timestamp: event.date || new Date().toISOString(),
          date: formattedDate,
          time: formattedTime,
          description: event.description,
          vessel: vessel?.name,
          voyage: event.voyage,
          // SeaRates API doesn't provide pieces, volume, weight per event directly in this structure
        }

        if (!groupedEvents.has(eventLocationName)) {
          groupedEvents.set(eventLocationName, [])
        }
        groupedEvents.get(eventLocationName)?.push(transformedEvent)
      })
    })

    // Sort events within each location group by timestamp
    groupedEvents.forEach((events, locationName) => {
      events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      timeline.push({
        location: locationName,
        terminal: events[0]?.description?.includes("Terminal") ? events[0].description : undefined, // Simple heuristic for terminal
        events: events,
      })
    })

    // Sort location groups by the timestamp of their first event
    timeline.sort((a, b) => {
      const firstEventA = a.events[0] ? new Date(a.events[0].timestamp).getTime() : 0
      const firstEventB = b.events[0] ? new Date(b.events[0].timestamp).getTime() : 0
      return firstEventA - firstEventB
    })

    // Determine last location from the latest event in the sorted timeline
    if (timeline.length > 0) {
      const lastGroup = timeline[timeline.length - 1]
      if (lastGroup.events.length > 0) {
        lastLocationName = lastGroup.events[lastGroup.events.length - 1].location
      }
    }

    const polLocation = locationsMap.get(seaRatesData.route?.pol?.location)
    const podLocation = locationsMap.get(seaRatesData.route?.pod?.location)
    const originLocation = locationsMap.get(seaRatesData.route?.prepol?.location)
    const destinationLocation = locationsMap.get(seaRatesData.route?.postpod?.location)

    return {
      shipmentNumber: seaRatesData.metadata?.number || "N/A",
      status: seaRatesData.metadata?.status || "UNKNOWN",
      containerNumber: firstContainer.number || seaRatesData.metadata?.number || "N/A",
      containerType: firstContainer.size_type || "N/A",
      weight: "N/A", // Not directly available in the provided JSON structure
      origin: originLocation?.name || "N/A",
      destination: destinationLocation?.name || "N/A",
      pol: polLocation?.name || "N/A",
      pod: podLocation?.name || "N/A",
      estimatedArrival: seaRatesData.route?.pod?.date || seaRatesData.route?.pod?.predictive_eta || "N/A",
      estimatedDeparture: seaRatesData.route?.pol?.date || "N/A", // Added estimated departure
      lastLocation: lastLocationName,
      timeline: timeline,
      documents: [], // Not available in the provided JSON structure
      details: {
        packages: "N/A", // Not available
        specialInstructions: "N/A", // Not available
        dimensions: "N/A", // Not available
        shipmentType: seaRatesData.metadata?.type || "N/A",
        pieces: undefined, // Not available
        volume: undefined, // Not available
      },
      raw: seaRatesData,
    }
  }
}
