import type { TrackingData, TrackingEvent } from "@/types/tracking"
import { GOCOMET_EMAIL, GOCOMET_PASSWORD } from "../apiKeys" // Assuming these are defined

export class GoCometService {
  private GOCOMET_API_URL = "https://api.gocomet.com/v1" // Example API URL
  private token: string | null = null

  constructor() {
    if (!GOCOMET_EMAIL || !GOCOMET_PASSWORD) {
      console.warn("GoComet API credentials are not set. GoComet tracking will not function.")
    }
  }

  private async getAuthToken(): Promise<string | null> {
    if (this.token) {
      return this.token
    }

    if (!GOCOMET_EMAIL || !GOCOMET_PASSWORD) {
      return null
    }

    try {
      const response = await fetch(`${this.GOCOMET_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: GOCOMET_EMAIL,
          password: GOCOMET_PASSWORD,
        }),
      })

      if (!response.ok) {
        console.error(`Failed to get GoComet auth token: ${response.statusText}`)
        return null
      }

      const data = await response.json()
      this.token = data.token // Assuming the token is in data.token
      return this.token
    } catch (error) {
      console.error("Error fetching GoComet auth token:", error)
      return null
    }
  }

  async trackShipment(trackingNumber: string, token?: string): Promise<TrackingData | null> {
    let authToken = token
    if (!authToken) {
      authToken = await this.getAuthToken()
    }

    if (!authToken) {
      console.error("No GoComet authentication token available.")
      return null
    }

    try {
      const response = await fetch(`${this.GOCOMET_API_URL}/trackings/${trackingNumber}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error(`Failed to track shipment with GoComet: ${response.statusText}`)
        return null
      }

      const data = await response.json()

      // Map GoComet response to your TrackingData type
      const events: TrackingEvent[] =
        data.events?.map((event: any) => ({
          timestamp: new Date(event.timestamp).toISOString(),
          location: event.location,
          status: event.status,
          description: event.description,
        })) || []

      return {
        trackingNumber: data.trackingNumber,
        status: data.status,
        carrier: "GoComet",
        events: events,
        origin: data.origin,
        destination: data.destination,
        eta: data.eta ? new Date(data.eta).toISOString() : undefined,
        // Add other relevant fields from GoComet response
      }
    } catch (error) {
      console.error(`Error tracking shipment ${trackingNumber} with GoComet:`, error)
      return null
    }
  }
}
