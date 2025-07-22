import type { TrackingResult, ShipmentType } from "@/types/tracking"
import { GocometService } from "./gocomet-service"
import { MaerskApi } from "../shipping-lines/maersk-api"
import { MscApi } from "../shipping-lines/msc-api"
import { MockTrackingService } from "./mock-tracking-service"
import { TrackshipService } from "./trackship-service" // Declare TrackshipService

interface TrackingOptions {
  shipmentType?: ShipmentType
  carrierHint?: string
  gocometToken?: string // Add gocometToken to options
}

export class MultiProviderTrackingService {
  private gocometService: GocometService
  private maerskApi: MaerskApi
  private mscApi: MscApi
  private trackshipService: TrackshipService
  private mockTrackingService: MockTrackingService

  constructor() {
    this.gocometService = new GocometService()
    this.maerskApi = new MaerskApi()
    this.mscApi = new MscApi()
    this.trackshipService = new TrackshipService()
    this.mockTrackingService = new MockTrackingService()
  }

  async trackShipment(trackingNumber: string, options?: TrackingOptions): Promise<TrackingResult> {
    const { shipmentType, carrierHint, gocometToken } = options || {}

    // Prioritize GoComet if explicitly hinted or detected as a container and GoComet is the primary provider
    // Only attempt GoComet if a token is available
    if (gocometToken && (carrierHint?.toLowerCase() === "gocomet" || (shipmentType === "container" && !carrierHint))) {
      const result = await this.gocometService.trackShipment(trackingNumber, gocometToken, options)
      if (result.success) {
        return result
      } else {
        console.warn(`GoComet tracking failed for ${trackingNumber}: ${result.error}`)
        // If GoComet explicitly says "no info found", we can try others.
        // If it's a general API error, we might want to return it directly.
        if (result.error?.includes("No live tracking information found")) {
          // Continue to other providers
        } else {
          return result // Return GoComet's specific error if it's not just "no info"
        }
      }
    }

    // Try Maersk
    if (carrierHint?.toLowerCase() === "maersk" || trackingNumber.startsWith("MAEU")) {
      const result = await this.maerskApi.trackShipment(trackingNumber, options)
      if (result.success) return result
    }

    // Try MSC
    if (carrierHint?.toLowerCase() === "msc" || trackingNumber.startsWith("MSCU")) {
      const result = await this.mscApi.trackShipment(trackingNumber, options)
      if (result.success) return result
    }

    // Try Trackship (if applicable, e.g., for parcel or specific formats)
    if (carrierHint?.toLowerCase() === "trackship" || shipmentType === "parcel") {
      const result = await this.trackshipService.trackShipment(trackingNumber, options)
      if (result.success) return result
    }

    // Fallback to mock service if no live data found or specific provider failed
    const mockResult = await this.mockTrackingService.trackShipment(trackingNumber, options)
    if (mockResult.success) {
      return { ...mockResult, source: "MockProvider", isLiveData: false }
    }

    // If all else fails, return a generic error
    return {
      success: false,
      error: "Live tracking not available. Please use carrier website.",
      source: "fallback",
      isLiveData: false,
      fallbackOptions: {
        carrier: carrierHint || "GoComet", // Default to GoComet as it was detected
        trackingUrl: `https://www.gocomet.com/track?tracking_number=${trackingNumber}`, // Example URL
      },
    }
  }
}
