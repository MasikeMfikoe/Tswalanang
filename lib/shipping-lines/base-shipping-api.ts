import type { ShippingLine, ContainerStatus, ShippingLineCredentials } from "@/types/shipping"

export abstract class BaseShippingAPI {
  protected credentials: ShippingLineCredentials
  protected shippingLine: ShippingLine

  constructor(shippingLine: ShippingLine, credentials: ShippingLineCredentials) {
    this.shippingLine = shippingLine
    this.credentials = credentials
  }

  // All shipping line APIs must implement these methods
  abstract authenticate(): Promise<boolean>
  abstract getContainerStatus(containerNumber: string): Promise<ContainerStatus>
  abstract getBookingStatus(bookingReference: string): Promise<ContainerStatus>
  abstract trackShipment(trackingNumber: string): Promise<any>

  // Helper methods
  protected async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    // Implement common auth logic here
    return fetch(url, options)
  }

  // Normalize status codes to our internal format
  protected normalizeStatus(externalStatus: string): string {
    // Map external status codes to internal ones
    const statusMap: Record<string, string> = {
      // Common Maersk statuses
      "Gate out empty": "at-origin",
      "Gate in": "at-origin",
      "Loaded on vessel": "cargo-departed",
      "Vessel departure": "cargo-departed",
      "Vessel arrival": "at-destination",
      Discharged: "at-destination",
      Delivered: "delivered",

      // Add mappings for other carriers
    }

    return statusMap[externalStatus] || "in-transit" // Default to in-transit
  }
}
