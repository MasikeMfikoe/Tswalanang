import type { TrackingResult } from "@/types/tracking" // Ensure correct path for TrackingResult

export interface GocometCredentials {
  apiKey: string
  baseUrl: string
}

export class GocometService {
  private credentials: GocometCredentials
  private GOCOMET_API_URL = process.env.GOCOMET_API_URL || "https://api.gocomet.com"
  private GOCOMET_API_KEY = process.env.GOCOMET_API_KEY

  constructor() {
    this.credentials = {
      apiKey: this.GOCOMET_API_KEY || "",
      baseUrl: this.GOCOMET_API_URL,
    }

    if (!this.GOCOMET_API_KEY) {
      console.warn("GOCOMET_API_KEY is not set. Gocomet integration may not work.")
    }
  }

  async trackShipment(trackingNumber: string, options?: any): Promise<TrackingResult> {
    if (!this.credentials.apiKey) {
      return { success: false, error: "Gocomet API Key not configured.", source: "Gocomet" }
    }

    try {
      console.log(`Calling Gocomet API for tracking number: ${trackingNumber}`)
      console.log(`Gocomet API URL: ${this.credentials.baseUrl}/track`)

      // Simulate API call
      const response = await fetch(`${this.credentials.baseUrl}/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.credentials.apiKey, // Assuming API key is passed in a header
        },
        body: JSON.stringify({ tracking_number: trackingNumber, ...options }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: `Gocomet API error: ${response.status} - ${errorData.message || "Unknown error"}`,
          source: "Gocomet",
        }
      }

      const data = await response.json()

      // Transform Gocomet response to your TrackingResult format
      // This is a simplified transformation. You'll need to adjust it based on actual Gocomet API response.
      const transformedData: TrackingResult["data"] = {
        shipmentNumber: data.tracking_number || trackingNumber,
        containerNumber: data.container_number || trackingNumber,
        status: data.status || "In Transit",
        location: data.current_location || "Unknown",
        estimatedArrival: data.estimated_delivery || "N/A",
        carrier: data.carrier_name || options?.carrierHint || "Unknown",
        vesselName: data.vessel_name || "Unknown",
        voyage: data.voyage_number || "Unknown",
        events: (data.events || []).map((event: any) => ({
          status: event.status,
          location: event.location,
          timestamp: event.timestamp,
          description: event.description,
        })),
        raw: data, // Keep raw response for debugging
      }

      return {
        success: true,
        data: transformedData,
        source: "Gocomet API",
        isLiveData: true,
      }
    } catch (error: any) {
      console.error("Error tracking with Gocomet:", error)
      return { success: false, error: error.message || "Failed to track with Gocomet", source: "Gocomet" }
    }
  }
}
