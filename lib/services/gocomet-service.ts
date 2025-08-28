import type { TrackingResult, TrackingEvent } from "@/types/tracking"
import type { TrackingProvider } from "@/types/tracking"

interface GocometCredentials {
  email: string
  password: string
}

interface GocometAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface GocometTrackingResponse {
  success: boolean
  data: {
    tracking_number: string
    status: string
    current_location: string
    estimated_delivery: string
    events: Array<{
      status: string
      location: string
      timestamp: string
      description: string
    }>
    carrier: string
    origin: string
    destination: string
  }
}

export class GocometService implements TrackingProvider {
  private baseUrl = "https://api.gocomet.com/v1"
  private credentials: GocometCredentials
  private accessToken: string | null = null
  private tokenExpiry: number | null = null

  constructor() {
    this.credentials = {
      email: process.env.GOCOMET_EMAIL || "",
      password: process.env.GOCOMET_PASSWORD || "",
    }
    console.log("[v0] 🔍 Gocomet credentials check:")
    console.log("[v0] Email exists:", !!this.credentials.email)
    console.log("[v0] Password exists:", !!this.credentials.password)
    console.log("[v0] Email length:", this.credentials.email.length)
    console.log("[v0] Password length:", this.credentials.password.length)
  }

  async authenticate(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      console.log("[v0] 🔐 Attempting Gocomet authentication...")
      console.log("[v0] API URL:", `${this.baseUrl}/auth/login`)
      console.log("[v0] Credentials valid:", !!this.credentials.email && !!this.credentials.password)

      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.credentials),
      })

      console.log("[v0] 📡 Gocomet API response status:", response.status)
      console.log("[v0] 📡 Gocomet API response ok:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] ❌ Gocomet API error response:", errorText)
        throw new Error(`Authentication failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data: GocometAuthResponse = await response.json()
      console.log("[v0] ✅ Gocomet authentication successful")

      this.accessToken = data.access_token
      this.tokenExpiry = Date.now() + data.expires_in * 1000

      return this.accessToken
    } catch (error) {
      console.error("[v0] ❌ Gocomet authentication error:", error)
      throw new Error(
        `Failed to authenticate with Gocomet: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  async trackShipment(trackingNumber: string): Promise<TrackingResult> {
    try {
      const token = await this.authenticate()

      const response = await fetch(`${this.baseUrl}/tracking/${trackingNumber}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Tracking request failed: ${response.statusText}`)
      }

      const data: GocometTrackingResponse = await response.json()

      if (!data.success) {
        throw new Error("Tracking data not found")
      }

      // Parse and format dates safely
      const parseDate = (dateString: string): Date | null => {
        if (!dateString) return null
        const date = new Date(dateString)
        return isNaN(date.getTime()) ? null : date
      }

      const formatDateString = (dateString: string): string => {
        const date = parseDate(dateString)
        return date ? date.toISOString() : new Date().toISOString()
      }

      const formatTimeString = (dateString: string): string => {
        const date = parseDate(dateString)
        return date ? date.getTime().toString() : Date.now().toString()
      }

      // Process events with null-safe date handling
      const events: TrackingEvent[] = data.data.events.map((event, index) => ({
        id: `gocomet-${index}`,
        status: event.status || "Unknown",
        location: event.location || "Unknown Location",
        timestamp: formatDateString(event.timestamp),
        description: event.description || event.status || "No description available",
        time: formatTimeString(event.timestamp),
      }))

      // Sort events by timestamp (newest first)
      events.sort((a, b) => {
        const timeA = parseDate(a.timestamp)
        const timeB = parseDate(b.timestamp)
        if (!timeA || !timeB) return 0
        return timeB.getTime() - timeA.getTime()
      })

      return {
        trackingNumber,
        status: this.mapStatus(data.data.status),
        currentLocation: data.data.current_location || "Unknown",
        estimatedDelivery: formatDateString(data.data.estimated_delivery),
        events,
        carrier: data.data.carrier || "Gocomet",
        origin: data.data.origin || "Unknown Origin",
        destination: data.data.destination || "Unknown Destination",
        provider: "gocomet" as const,
        lastUpdated: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error tracking with Gocomet:", error)
      throw new Error(`Gocomet tracking failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private mapStatus(gocometStatus: string): TrackingResult["status"] {
    const status = gocometStatus?.toLowerCase() || ""

    if (status.includes("delivered")) return "delivered"
    if (status.includes("transit") || status.includes("progress")) return "in-transit"
    if (status.includes("picked") || status.includes("collected")) return "in-transit"
    if (status.includes("pending") || status.includes("waiting")) return "pending"
    if (status.includes("exception") || status.includes("error") || status.includes("failed")) return "exception"

    return "pending"
  }

  getName(): string {
    return "Gocomet"
  }

  canTrack(trackingNumber: string): boolean {
    // Gocomet can potentially track various formats
    return trackingNumber.length >= 6 && trackingNumber.length <= 50
  }
}
