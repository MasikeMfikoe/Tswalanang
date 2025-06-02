import { detectContainerInfo, getShippingLineInfo } from "./container-detection-service"
import { ShippingAPIFactory } from "../shipping-lines/shipping-api-factory"

export interface ExternalTrackingResult {
  success: boolean
  data?: {
    containerNumber: string
    status: string
    location: string
    vessel?: string
    voyage?: string
    eta?: string
    events: Array<{
      status: string
      location: string
      timestamp: string
      description?: string
    }>
    cargoDetails?: {
      weight?: string
      volume?: string
      containerType?: string
      packages?: string
      commodity?: string
    }
  }
  error?: string
  source: string
}

export async function trackContainerExternal(trackingNumber: string): Promise<ExternalTrackingResult> {
  try {
    const containerInfo = detectContainerInfo(trackingNumber)

    if (!containerInfo.isValid) {
      return {
        success: false,
        error: "Invalid tracking number format",
        source: "validation",
      }
    }

    const shippingLineInfo = getShippingLineInfo(containerInfo.prefix)

    if (!shippingLineInfo) {
      return {
        success: false,
        error: `Unsupported shipping line for prefix: ${containerInfo.prefix}`,
        source: "unsupported_carrier",
      }
    }

    // Check if we have API support for this shipping line
    if (!shippingLineInfo.apiSupported) {
      return {
        success: false,
        error: `Real-time tracking not available for ${shippingLineInfo.name}. Please use their website directly.`,
        source: "no_api_support",
      }
    }

    // Check if we have valid credentials for this shipping line
    if (!ShippingAPIFactory.hasValidCredentials(shippingLineInfo.code as any)) {
      return {
        success: false,
        error: `API credentials not configured for ${shippingLineInfo.name}`,
        source: "missing_credentials",
      }
    }

    // Get the appropriate API client
    const credentials = ShippingAPIFactory.getCredentials(shippingLineInfo.code as any)
    const apiClient = ShippingAPIFactory.getApiClient(shippingLineInfo.code as any, credentials)

    // Authenticate with the shipping line API
    const isAuthenticated = await apiClient.authenticate()
    if (!isAuthenticated) {
      return {
        success: false,
        error: `Failed to authenticate with ${shippingLineInfo.name} API`,
        source: "authentication_failed",
      }
    }

    // Determine if this is a container number or booking reference
    let trackingResult
    if (containerInfo.type === "container") {
      trackingResult = await apiClient.getContainerStatus(trackingNumber)
    } else if (containerInfo.type === "bl" || containerInfo.type === "booking") {
      trackingResult = await apiClient.getBookingStatus(trackingNumber)
    } else {
      return {
        success: false,
        error: "Unable to determine tracking type",
        source: "invalid_type",
      }
    }

    // Transform the API response to our standard format
    const standardizedData = {
      containerNumber: trackingResult.containerNumber,
      status: trackingResult.status,
      location: trackingResult.location,
      vessel: trackingResult.vessel,
      voyage: trackingResult.voyage,
      eta: trackingResult.eta,
      events: [
        {
          status: trackingResult.status,
          location: trackingResult.location,
          timestamp: trackingResult.timestamp,
          description: trackingResult.details,
        },
      ],
      cargoDetails: {
        containerType: "40HC", // This would come from the API response
        weight: "24,500 kg", // This would come from the API response
        volume: "67.5 CBM", // This would come from the API response
      },
    }

    return {
      success: true,
      data: standardizedData,
      source: `${shippingLineInfo.code}_api`,
    }
  } catch (error) {
    console.error("External tracking error:", error)

    // If it's a specific API error, return more details
    if (error instanceof Error) {
      return {
        success: false,
        error: `API Error: ${error.message}`,
        source: "api_error",
      }
    }

    return {
      success: false,
      error: "Failed to fetch tracking data from external API",
      source: "external_api",
    }
  }
}

// Fallback function for unsupported carriers - provides website links
export function getCarrierWebsiteInfo(trackingNumber: string) {
  const containerInfo = detectContainerInfo(trackingNumber)
  const shippingLineInfo = getShippingLineInfo(containerInfo.prefix)

  if (!shippingLineInfo) {
    return null
  }

  return {
    carrierName: shippingLineInfo.name,
    trackingUrl: `${shippingLineInfo.trackingUrl}${trackingNumber}`,
    message: `Real-time API tracking not available for ${shippingLineInfo.name}. Please visit their website for live tracking.`,
  }
}
