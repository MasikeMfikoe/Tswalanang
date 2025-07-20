import type { TrackingResult, TrackingData, TrackingEvent, ShipmentType } from "@/types/tracking"

export class GocometService {
  private email: string
  private password: string
  private loginUrl: string
  private trackingUrl: string
  private token: string | null = null
  private tokenExpiry = 0 // Unix timestamp

  constructor() {
    this.email = process.env.GOCOMET_EMAIL || "ofentse@tlogistics.net.za" // Use env var, fallback to provided email
    this.password = process.env.GOCOMET_PASSWORD || "Tswa#@2025" // Use env var, fallback to provided password
    this.loginUrl = "https://login.gocomet.com/api/v1/integrations/generate-token-number"
    this.trackingUrl = "https://tracking.gocomet.com/api/v1/integrations/live-tracking"
  }

  private async getToken(): Promise<string | null> {
    // Check if token is still valid
    if (this.token && this.tokenExpiry > Date.now()) {
      return this.token
    }

    if (!this.email || !this.password) {
      console.error("Gocomet email or password not configured.")
      return null
    }

    try {
      const response = await fetch(this.loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Gocomet token generation error (${response.status}): ${errorText}`)
        return null
      }

      const data = await response.json()
      if (data.token) {
        this.token = data.token
        // Assuming token is valid for 1 hour (3600 seconds), adjust if Gocomet specifies otherwise
        this.tokenExpiry = Date.now() + 3500 * 1000 // Set expiry slightly before actual expiry
        return this.token
      } else {
        console.error("Gocomet token not found in response:", data)
        return null
      }
    } catch (error) {
      console.error("Error generating Gocomet token:", error)
      return null
    }
  }

  async trackShipment(
    trackingNumber: string,
    options?: {
      shipmentType?: ShipmentType
      carrierHint?: string
    },
  ): Promise<TrackingResult> {
    const currentToken = await this.getToken()

    if (!currentToken) {
      return {
        success: false,
        error: "Failed to obtain Gocomet API token.",
        source: "Gocomet",
      }
    }

    try {
      const response = await fetch(
        `${this.trackingUrl}?start_date=01/01/2024&tracking_numbers[]=${trackingNumber}&token=${currentToken}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Gocomet tracking API error (${response.status}): ${errorText}`)
        return {
          success: false,
          error: `Gocomet API returned status ${response.status}. Details: ${errorText}`,
          source: "Gocomet",
        }
      }

      const data = await response.json()

      if (data && data.updated_trackings && data.updated_trackings.length > 0) {
        const gocometTrackingInfo = data.updated_trackings[0]
        return {
          success: true,
          data: this.transformGocometData(gocometTrackingInfo, trackingNumber, options?.shipmentType),
          source: "Gocomet",
          isLiveData: true,
          scrapedAt: new Date().toISOString(),
        }
      } else {
        console.warn("Gocomet API response indicates no tracking info or unexpected format:", data)
        return {
          success: false,
          error: data.message || "No tracking information found for this number via Gocomet.",
          source: "Gocomet",
        }
      }
    } catch (error) {
      console.error("Error tracking with Gocomet:", error)
      return {
        success: false,
        error: `Failed to connect to Gocomet service: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "Gocomet",
      }
    }
  }

  private transformGocometData(
    gocometData: any,
    originalTrackingNumber: string,
    detectedShipmentType?: ShipmentType,
  ): TrackingData {
    const timeline: Array<{ location: string; terminal?: string; events: TrackingEvent[] }> = []

    if (gocometData.events && Array.isArray(gocometData.events)) {
      gocometData.events.forEach((event: any) => {
        const eventDate = new Date(event.actual_date || event.event_date || new Date())
        timeline.push({
          location: event.location || "N/A",
          events: [
            {
              type: "event",
              status: event.display_event || event.event_type || "N/A",
              location: event.location || "N/A",
              timestamp: eventDate.toISOString(),
              date: eventDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
              time: eventDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
              description: event.event_description || event.display_event,
              vessel: gocometData.vessel_name, // Gocomet often provides vessel at top level
              voyage: gocometData.voyage_number, // Gocomet often provides voyage at top level
            },
          ],
        })
      })
    }

    return {
      shipmentNumber: gocometData.reference_no || originalTrackingNumber,
      status: gocometData.status || "UNKNOWN",
      containerNumber: gocometData.container_no || "N/A",
      containerType: gocometData.container_type || "N/A",
      weight: gocometData.weight_value ? `${gocometData.weight_value} ${gocometData.weight_unit || "KG"}` : "N/A",
      origin: gocometData.pol_name || "N/A",
      destination: gocometData.pod_name || "N/A",
      pol: gocometData.pol_name || "N/A",
      pod: gocometData.pod_name || "N/A",
      estimatedArrival: gocometData.eta_date || "N/A",
      estimatedDeparture: gocometData.etd_date || "N/A", // Added estimated departure
      lastLocation: gocometData.last_location || "N/A",
      timeline: timeline,
      documents: [], // Gocomet API might provide document links, populate if available
      details: {
        shipmentType: detectedShipmentType || "unknown", // Use detected type or default
        packages: gocometData.package_count
          ? `${gocometData.package_count} ${gocometData.package_unit || "packages"}`
          : undefined,
        specialInstructions: undefined, // Not typically in Gocomet tracking response
        dimensions: undefined, // Not typically in Gocomet tracking response
        pieces: gocometData.package_count,
        volume: gocometData.volume_value
          ? `${gocometData.volume_value} ${gocometData.volume_unit || "CBM"}`
          : undefined,
      },
      raw: gocometData,
    }
  }
}
