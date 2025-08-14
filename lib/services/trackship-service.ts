export interface TrackShipCredentials {
  apiKey: string
  baseUrl: string
}

export interface TrackShipResponse {
  success: boolean
  data?: {
    tracking_number: string
    carrier: string
    status: string
    status_detail: string
    location: string
    estimated_delivery: string
    events: Array<{
      status: string
      location: string
      timestamp: string
      description: string
    }>
    shipment_info: {
      origin: string
      destination: string
      service_type: string
      weight?: string
      dimensions?: string
    }
  }
  error?: string
  message?: string
}

export class TrackShipService {
  private credentials: TrackShipCredentials

  constructor() {
    this.credentials = {
      apiKey: process.env.TRACKSHIP_API_KEY || "",
      baseUrl: process.env.TRACKSHIP_API_URL || "https://api.trackship.com/v1",
    }
  }

  async trackShipment(trackingNumber: string, carrier?: string): Promise<TrackShipResponse> {
    try {
      if (!this.credentials.apiKey) {
        return {
          success: false,
          error: "TrackShip API key not configured",
        }
      }

      const url = `${this.credentials.baseUrl}/track`
      const payload = {
        tracking_number: trackingNumber,
        carrier: carrier || "auto-detect", // Let TrackShip auto-detect carrier
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.credentials.apiKey}`,
          "User-Agent": "TSW-SmartLog/1.0",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: `TrackShip API error: ${response.status}`,
          message: errorData.message || "Unknown error",
        }
      }

      const data = await response.json()

      // Transform TrackShip response to our standard format
      return {
        success: true,
        data: this.transformTrackShipData(data),
      }
    } catch (error) {
      console.error("TrackShip service error:", error)
      return {
        success: false,
        error: "Failed to connect to TrackShip service",
        message: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  async trackMultipleShipments(trackingNumbers: string[]): Promise<TrackShipResponse[]> {
    try {
      const url = `${this.credentials.baseUrl}/track/batch`
      const payload = {
        tracking_numbers: trackingNumbers,
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.credentials.apiKey}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`TrackShip batch API error: ${response.status}`)
      }

      const data = await response.json()
      return data.results.map((result: any) => ({
        success: result.success,
        data: result.success ? this.transformTrackShipData(result.data) : undefined,
        error: result.error,
      }))
    } catch (error) {
      console.error("TrackShip batch service error:", error)
      return trackingNumbers.map(() => ({
        success: false,
        error: "Batch tracking failed",
      }))
    }
  }

  async getSupportedCarriers(): Promise<string[]> {
    try {
      const response = await fetch(`${this.credentials.baseUrl}/carriers`, {
        headers: {
          Authorization: `Bearer ${this.credentials.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get carriers: ${response.status}`)
      }

      const data = await response.json()
      return data.carriers || []
    } catch (error) {
      console.error("Error getting supported carriers:", error)
      return []
    }
  }

  private transformTrackShipData(trackShipData: any) {
    return {
      tracking_number: trackShipData.tracking_number,
      carrier: trackShipData.carrier?.name || "Unknown",
      status: this.normalizeStatus(trackShipData.status),
      status_detail: trackShipData.status_detail || "",
      location: trackShipData.location || "Unknown",
      estimated_delivery: trackShipData.estimated_delivery,
      events: (trackShipData.events || []).map((event: any) => ({
        status: event.status,
        location: event.location,
        timestamp: event.timestamp,
        description: event.description || event.status,
      })),
      shipment_info: {
        origin: trackShipData.origin || "Unknown",
        destination: trackShipData.destination || "Unknown",
        service_type: trackShipData.service_type || "Standard",
        weight: trackShipData.weight,
        dimensions: trackShipData.dimensions,
      },
    }
  }

  private normalizeStatus(status: string): string {
    // Map TrackShip statuses to your internal status system
    const statusMap: Record<string, string> = {
      in_transit: "in-transit",
      out_for_delivery: "out-for-delivery",
      delivered: "delivered",
      exception: "exception",
      pending: "pending",
      pre_transit: "pre-transit",
    }

    return statusMap[status.toLowerCase()] || status
  }
}
