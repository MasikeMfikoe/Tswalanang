import { BaseShippingAPI } from "./base-shipping-api"
import type { ContainerStatus, ShippingLineCredentials } from "@/types/shipping"

export class MaerskAPI extends BaseShippingAPI {
  private authToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor(credentials: ShippingLineCredentials) {
    super("maersk", credentials)
  }

  async authenticate(): Promise<boolean> {
    try {
      // Check if credentials are properly configured
      if (!this.credentials.clientId || !this.credentials.clientSecret || !this.credentials.baseUrl) {
        console.log("Maersk API credentials not configured")
        return false
      }

      if (this.credentials.clientId === "undefined" || this.credentials.clientSecret === "undefined") {
        console.log("Maersk API credentials are undefined")
        return false
      }

      // Check if we have a valid token
      if (this.authToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
        return true
      }

      // Authenticate with Maersk API
      const response = await fetch(`${this.credentials.baseUrl}/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: this.credentials.clientId || "",
          client_secret: this.credentials.clientSecret || "",
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Maersk authentication failed: ${response.status} ${response.statusText}`, errorText)
        return false
      }

      const data = await response.json()
      this.authToken = data.access_token

      // Set token expiry (usually 1 hour)
      const expiresIn = data.expires_in || 3600
      this.tokenExpiry = new Date(Date.now() + expiresIn * 1000)

      return true
    } catch (error) {
      console.error("Maersk authentication error:", error)
      return false
    }
  }

  async getContainerStatus(containerNumber: string): Promise<ContainerStatus> {
    const isAuthenticated = await this.authenticate()
    if (!isAuthenticated) {
      throw new Error("Failed to authenticate with Maersk API")
    }

    try {
      const response = await fetch(`${this.credentials.baseUrl}/shipping/v2/containers/${containerNumber}/tracking`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get container status: ${response.statusText}`)
      }

      const data = await response.json()

      // Extract the latest event
      const latestEvent = data.events && data.events.length > 0 ? data.events[0] : null

      if (!latestEvent) {
        throw new Error("No tracking events found")
      }

      return {
        containerNumber,
        status: this.normalizeStatus(latestEvent.eventType),
        location: `${latestEvent.location.city}, ${latestEvent.location.country}`,
        timestamp: latestEvent.eventDateTime,
        vessel: data.vessel?.name,
        voyage: data.vessel?.voyage,
        eta: data.estimatedArrival?.dateTime,
        details: latestEvent.eventDescription,
        raw: data,
      }
    } catch (error) {
      console.error(`Error fetching Maersk container status for ${containerNumber}:`, error)
      throw error
    }
  }

  async getBookingStatus(bookingReference: string): Promise<ContainerStatus> {
    const isAuthenticated = await this.authenticate()
    if (!isAuthenticated) {
      throw new Error("Failed to authenticate with Maersk API")
    }

    try {
      const response = await fetch(`${this.credentials.baseUrl}/shipping/v2/bookings/${bookingReference}/tracking`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get booking status: ${response.statusText}`)
      }

      const data = await response.json()

      // Extract container number and latest event
      const containerNumber =
        data.containers && data.containers.length > 0 ? data.containers[0].containerNumber : bookingReference

      const latestEvent = data.events && data.events.length > 0 ? data.events[0] : null

      if (!latestEvent) {
        throw new Error("No tracking events found")
      }

      return {
        containerNumber,
        status: this.normalizeStatus(latestEvent.eventType),
        location: `${latestEvent.location.city}, ${latestEvent.location.country}`,
        timestamp: latestEvent.eventDateTime,
        vessel: data.vessel?.name,
        voyage: data.vessel?.voyage,
        eta: data.estimatedArrival?.dateTime,
        details: latestEvent.eventDescription,
        raw: data,
      }
    } catch (error) {
      console.error(`Error fetching Maersk booking status for ${bookingReference}:`, error)
      throw error
    }
  }
}
