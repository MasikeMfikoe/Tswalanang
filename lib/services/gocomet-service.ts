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
    this.password = process.env.GOCOMET_PASSWORD || "Tswa#@2025" // Corrected password
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

  private parseDate(dateValue: any): Date {
    if (!dateValue) {
      return new Date()
    }

    // Handle different date formats that Gocomet might return
    let parsedDate: Date

    if (typeof dateValue === "string") {
      // Try different date formats
      const formats = [
        dateValue, // Original format
        dateValue.replace(/\//g, "-"), // Replace slashes with dashes
        dateValue.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1"), // DD/MM/YYYY to YYYY-MM-DD
        dateValue.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3"), // DD/MM/YYYY to MM/DD/YYYY
      ]

      for (const format of formats) {
        parsedDate = new Date(format)
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate
        }
      }
    } else if (typeof dateValue === "number") {
      parsedDate = new Date(dateValue)
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate
      }
    } else if (dateValue instanceof Date) {
      if (!isNaN(dateValue.getTime())) {
        return dateValue
      }
    }

    // If all parsing attempts fail, return current date
    console.warn(`Failed to parse date: ${dateValue}, using current date`)
    return new Date()
  }

  private formatDateString(date: Date): string {
    try {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      console.warn("Error formatting date:", error)
      return "N/A"
    }
  }

  private formatTimeString(date: Date): string {
    try {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    } catch (error) {
      console.warn("Error formatting time:", error)
      return "N/A"
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
      console.log("Gocomet API response:", JSON.stringify(data, null, 2))

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
        try {
          // Use the safe date parsing method
          const eventDate = this.parseDate(event.actual_date || event.event_date)

          timeline.push({
            location: event.location || "N/A",
            events: [
              {
                type: "event",
                status: event.display_event || event.event_type || "N/A",
                location: event.location || "N/A",
                timestamp: eventDate.toISOString(),
                date: this.formatDateString(eventDate),
                time: this.formatTimeString(eventDate),
                description: event.event_description || event.display_event,
                vessel: gocometData.vessel_name, // Gocomet often provides vessel at top level
                voyage: gocometData.voyage_number, // Gocomet often provides voyage at top level
              },
            ],
          })
        } catch (error) {
          console.warn("Error processing event:", event, error)
          // Skip this event if there's an error processing it
        }
      })
    }

    // Safe date parsing for ETA and ETD
    let estimatedArrival = "N/A"
    let estimatedDeparture = "N/A"

    try {
      if (gocometData.eta_date) {
        const etaDate = this.parseDate(gocometData.eta_date)
        estimatedArrival = etaDate.toISOString()
      }
    } catch (error) {
      console.warn("Error parsing ETA date:", gocometData.eta_date, error)
    }

    try {
      if (gocometData.etd_date) {
        const etdDate = this.parseDate(gocometData.etd_date)
        estimatedDeparture = etdDate.toISOString()
      }
    } catch (error) {
      console.warn("Error parsing ETD date:", gocometData.etd_date, error)
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
      estimatedArrival: estimatedArrival,
      estimatedDeparture: estimatedDeparture,
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
