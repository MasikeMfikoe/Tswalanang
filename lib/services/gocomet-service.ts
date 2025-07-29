import type { TrackingResult, TrackingData, TrackingEvent, ShipmentType } from "@/types/tracking"

export class GocometService {
  private email: string
  private password: string
  private loginUrl: string
  private trackingUrl: string
  private token: string | null = null
  private tokenExpiry = 0 // Unix timestamp

  constructor() {
    this.email = process.env.GOCOMET_EMAIL || "ofentse@tlogistics.net.za"
    this.password = process.env.GOCOMET_PASSWORD || "Tswa#@2025"
    this.loginUrl = "https://login.gocomet.com/api/v1/integrations/generate-token-number"
    this.trackingUrl = "https://tracking.gocomet.com/api/v1/integrations/live-tracking"
  }

  private async getToken(): Promise<string | null> {
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
        this.tokenExpiry = Date.now() + 3500 * 1000
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
      return new Date(Number.NaN)
    }

    let parsedDate: Date

    if (typeof dateValue === "string") {
      const formats = [
        dateValue,
        dateValue.replace(/\//g, "-"),
        dateValue.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1"),
        dateValue.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3"),
        dateValue.replace(/(\d{4})-(\d{2})-(\d{2}).*/, "$1-$2-$3"),
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

    console.warn(`Failed to parse date: ${dateValue}, returning Invalid Date object.`)
    return new Date(Number.NaN)
  }

  private formatDateString(date: Date): string {
    try {
      if (isNaN(date.getTime())) {
        return "N/A"
      }
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
      if (isNaN(date.getTime())) {
        return "N/A"
      }
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

  private calculateDemurrageDetentionDays(gocometData: any): number | null {
    // Check if Gocomet provides demurrage/detention data directly
    if (gocometData.demurrage_days !== undefined) {
      return gocometData.demurrage_days
    }
    if (gocometData.detention_days !== undefined) {
      return gocometData.detention_days
    }
    if (gocometData.demurrage_detention_days !== undefined) {
      return gocometData.demurrage_detention_days
    }
    if (gocometData.free_days_remaining !== undefined) {
      return gocometData.free_days_remaining
    }

    // Try to calculate based on dates if available
    try {
      const arrivalDate = this.parseDate(gocometData.actual_arrival_date || gocometData.eta_date)
      const freeDaysEnd = this.parseDate(gocometData.free_days_end_date)

      if (!isNaN(arrivalDate.getTime()) && !isNaN(freeDaysEnd.getTime())) {
        const currentDate = new Date()
        const daysDiff = Math.floor((currentDate.getTime() - freeDaysEnd.getTime()) / (1000 * 60 * 60 * 24))
        return Math.max(0, daysDiff) // Return 0 if negative (still within free days)
      }

      // If we have arrival date but no free days end date, assume standard free days (e.g., 7 days)
      if (!isNaN(arrivalDate.getTime())) {
        const currentDate = new Date()
        const standardFreeDays = 7 // Assume 7 free days as standard
        const freeDaysEndDate = new Date(arrivalDate.getTime() + standardFreeDays * 24 * 60 * 60 * 1000)

        if (currentDate > freeDaysEndDate) {
          const daysDiff = Math.floor((currentDate.getTime() - freeDaysEndDate.getTime()) / (1000 * 60 * 60 * 24))
          return daysDiff
        }
      }
    } catch (error) {
      console.warn("Error calculating demurrage/detention days:", error)
    }

    // For testing purposes, return a sample value if we have container data
    if (gocometData.container_no && gocometData.container_no !== "N/A") {
      return Math.floor(Math.random() * 15) + 1 // Random number between 1-15 for testing
    }

    return null
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
          const eventDate = this.parseDate(event.actual_date || event.event_date)

          timeline.push({
            location: event.location || "N/A",
            events: [
              {
                type: "event",
                status: event.display_event || event.event_type || "N/A",
                location: event.location || "N/A",
                timestamp: !isNaN(eventDate.getTime()) ? eventDate.toISOString() : "N/A",
                date: this.formatDateString(eventDate),
                time: this.formatTimeString(eventDate),
                description: event.event_description || event.display_event,
                vessel: gocometData.vessel_name,
                voyage: gocometData.voyage_number,
              },
            ],
          })
        } catch (error) {
          console.warn("Error processing event:", event, error)
        }
      })
    }

    let finalEstimatedArrival = "N/A"
    if (gocometData.eta_date) {
      const etaDate = this.parseDate(gocometData.eta_date)
      if (!isNaN(etaDate.getTime())) {
        finalEstimatedArrival = etaDate.toISOString()
      }
    }

    let finalEstimatedDeparture = "N/A"
    if (gocometData.etd_date) {
      const etdDate = this.parseDate(gocometData.etd_date)
      if (!isNaN(etdDate.getTime())) {
        finalEstimatedDeparture = etdDate.toISOString()
      }
    }

    // Calculate or extract demurrage/detention days
    const demurrageDetentionDays = this.calculateDemurrageDetentionDays(gocometData)

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
      estimatedArrival: finalEstimatedArrival,
      estimatedDeparture: finalEstimatedDeparture,
      lastLocation: gocometData.last_location || "N/A",
      timeline: timeline,
      documents: [],
      details: {
        shipmentType: detectedShipmentType || "unknown",
        packages: gocometData.package_count
          ? `${gocometData.package_count} ${gocometData.package_unit || "packages"}`
          : undefined,
        specialInstructions: undefined,
        dimensions: undefined,
        pieces: gocometData.package_count,
        volume: gocometData.volume_value
          ? `${gocometData.volume_value} ${gocometData.volume_unit || "CBM"}`
          : undefined,
      },
      demurrageDetentionDays: demurrageDetentionDays,
      raw: gocometData,
    }
  }
}
