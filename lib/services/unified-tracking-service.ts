import { trackContainerExternal } from "./external-tracking-service"
import { detectContainerInfo } from "./container-detection-service"

export class UnifiedTrackingService {
  constructor() {}

  async trackShipment(trackingNumber: string) {
    const cleanTrackingNumber = trackingNumber.trim().toUpperCase().replace(/[\s-]/g, "")

    const trackingMethods = [
      () => this.tryDirectAPI(cleanTrackingNumber),
      () => this.tryFallbackMethods(cleanTrackingNumber),
    ]

    for (const method of trackingMethods) {
      try {
        const result = await method()
        if (result.success) {
          return result
        }
      } catch (error) {
        console.error("Tracking method failed:", error)
        continue
      }
    }

    return {
      success: false,
      error: "Unable to track shipment with any available method",
      trackingNumber: cleanTrackingNumber,
    }
  }

  private async tryDirectAPI(trackingNumber: string) {
    console.log("Trying direct carrier APIs for:", trackingNumber)
    const result = await trackContainerExternal(trackingNumber)

    if (result.success && result.data) {
      return {
        success: true,
        data: this.transformToStandardFormat(result.data, result.source),
        source: result.source,
        isLiveData: true,
      }
    }

    return { success: false, error: result.error }
  }

  private async tryFallbackMethods(trackingNumber: string) {
    // Detect carrier and provide website link
    const containerInfo = detectContainerInfo(trackingNumber)

    if (containerInfo.isValid) {
      return {
        success: false,
        error: "Live tracking not available. Please use carrier website.",
        carrierInfo: {
          name: containerInfo.carrier || "Unknown",
          trackingUrl: `https://www.${containerInfo.carrier?.toLowerCase()}.com/track?number=${trackingNumber}`,
        },
        source: "fallback",
      }
    }

    return { success: false, error: "Invalid tracking number format" }
  }

  private transformToStandardFormat(data: any, source: string) {
    // Transform different API responses to a unified format
    return {
      shipmentNumber: data.tracking_number || data.containerNumber,
      status: data.status,
      containerNumber: data.tracking_number,
      location: data.location,
      estimatedArrival: data.estimated_delivery || data.eta,
      carrier: data.carrier,
      events: data.events || [],
      source,
      lastUpdated: new Date().toISOString(),
    }
  }
}
