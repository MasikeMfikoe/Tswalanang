import { BaseShippingAPI } from "./base-shipping-api"
import type { ContainerStatus, ShippingLineCredentials } from "@/types/shipping"

export class MSCAPI extends BaseShippingAPI {
  constructor(credentials: ShippingLineCredentials) {
    super("msc", credentials)
  }

  async authenticate(): Promise<boolean> {
    try {
      // MSC typically uses basic auth
      // No need to store token as we'll use basic auth for each request
      return true
    } catch (error) {
      console.error("MSC authentication error:", error)
      return false
    }
  }

  async getContainerStatus(containerNumber: string): Promise<ContainerStatus> {
    try {
      // Basic auth headers
      const headers = new Headers()
      headers.set("Authorization", "Basic " + btoa(`${this.credentials.username}:${this.credentials.password}`))
      headers.set("Accept", "application/json")

      const response = await fetch(`${this.credentials.baseUrl}/track/v1/containers/${containerNumber}`, { headers })

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
        status: this.normalizeStatus(latestEvent.eventName),
        location: latestEvent.location || "Unknown",
        timestamp: latestEvent.eventDate,
        vessel: data.vesselName,
        voyage: data.voyageReference,
        eta: data.estimatedArrival,
        details: latestEvent.remarks,
        raw: data,
      }
    } catch (error) {
      console.error(`Error fetching MSC container status for ${containerNumber}:`, error)
      throw error
    }
  }

  async getBookingStatus(bookingReference: string): Promise<ContainerStatus> {
    try {
      // Basic auth headers
      const headers = new Headers()
      headers.set("Authorization", "Basic " + btoa(`${this.credentials.username}:${this.credentials.password}`))
      headers.set("Accept", "application/json")

      const response = await fetch(`${this.credentials.baseUrl}/track/v1/bookings/${bookingReference}`, { headers })

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
        status: this.normalizeStatus(latestEvent.eventName),
        location: latestEvent.location || "Unknown",
        timestamp: latestEvent.eventDate,
        vessel: data.vesselName,
        voyage: data.voyageReference,
        eta: data.estimatedArrival,
        details: latestEvent.remarks,
        raw: data,
      }
    } catch (error) {
      console.error(`Error fetching MSC booking status for ${bookingReference}:`, error)
      throw error
    }
  }
}
