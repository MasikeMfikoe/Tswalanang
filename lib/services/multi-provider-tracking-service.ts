import type { TrackingResult, ShipmentType } from "@/types/tracking"
import { SeaRatesService } from "./searates-service"
import { GocometService } from "./gocomet-service"
import { TrackShipService } from "./trackship-service"
import { detectShipmentInfo } from "./container-detection-service"

export interface TrackingProvider {
  name: string
  priority: number
  service: SeaRatesService | GocometService | TrackShipService // Union type for all services
  track: (
    trackingNumber: string,
    options?: { shipmentType?: ShipmentType; carrierHint?: string },
  ) => Promise<TrackingResult>
}

interface TrackShipmentOptions {
  shipmentType?: ShipmentType
  carrierHint?: string
  preferScraping?: boolean
  gocometToken?: string | null // Pass gocometToken here
}

export class MultiProviderTrackingService {
  private providers: TrackingProvider[] = []
  private gocometService: GocometService
  private trackShipService: TrackShipService
  private seaRatesService: SeaRatesService

  constructor(gocometToken: string | null = null) {
    this.gocometService = new GocometService() // GoCometService now handles its own token internally
    this.trackShipService = new TrackShipService(gocometToken) // TrackShipService might still need it for its mock
    this.seaRatesService = new SeaRatesService()

    // Initialize and register tracking providers with priorities
    // Lower priority number means higher preference
    this.registerProvider({
      name: "GoComet",
      priority: 1, // Highest priority for GoComet
      service: this.gocometService,
      track: (trackingNumber, options) =>
        this.gocometService.trackShipment(trackingNumber, {
          shipmentType: options?.shipmentType,
          carrierHint: options?.carrierHint,
        }),
    })

    this.registerProvider({
      name: "SeaRates",
      priority: 2, // Second highest priority
      service: this.seaRatesService,
      track: (trackingNumber, options) =>
        this.seaRatesService.trackShipment(trackingNumber, {
          sealine: options?.carrierHint,
          type: this.mapShipmentTypeToSeaRatesType(options?.shipmentType),
        }),
    })

    this.registerProvider({
      name: "TrackShip",
      priority: 3, // Third highest priority (mocked)
      service: this.trackShipService,
      track: (trackingNumber, options) =>
        this.trackShipService.trackShipment(trackingNumber, {
          shipmentType: options?.shipmentType,
          carrierHint: options?.carrierHint,
        }),
    })

    // Sort providers by priority
    this.providers.sort((a, b) => a.priority - b.priority)
  }

  private registerProvider(provider: TrackingProvider) {
    this.providers.push(provider)
  }

  private mapShipmentTypeToSeaRatesType(shipmentType?: ShipmentType): "CT" | "BL" | "BK" | undefined {
    switch (shipmentType) {
      case "ocean":
      case "lcl":
        return "CT" // SeaRates often uses CT for container, or BL for Bill of Lading
      case "air":
        return "BK" // SeaRates might treat AWB as a booking number
      default:
        return undefined
    }
  }

  async trackShipment(trackingNumber: string, options: TrackShipmentOptions = {}): Promise<TrackingResult> {
    const cleanTrackingNumber = trackingNumber.trim().toUpperCase().replace(/[\s-]/g, "")
    const { shipmentType, carrierHint, preferScraping } = options

    // Iterate through providers by priority
    for (const provider of this.providers) {
      console.log(`[MultiProviderTrackingService] Attempting to track with: ${provider.name}`)
      const result = await provider.track(cleanTrackingNumber, {
        shipmentType,
        carrierHint,
      })
      if (result.success) {
        console.log(`[MultiProviderTrackingService] Successfully tracked with ${provider.name}`)
        return result
      } else {
        console.warn(`[MultiProviderTrackingService] Provider ${provider.name} failed: ${result.error}`)
      }
    }

    // Fallback if no provider succeeds
    const detectedInfo = detectShipmentInfo(cleanTrackingNumber)
    if (detectedInfo.isValid) {
      return {
        success: false,
        error: "Live tracking not available. Please use carrier website.",
        fallbackOptions: {
          carrier: detectedInfo.carrier || "Unknown",
          trackingUrl: `https://www.${detectedInfo.carrier?.toLowerCase()}.com/track?number=${cleanTrackingNumber}`,
        },
        source: "fallback",
        isLiveData: false,
      }
    }

    return {
      success: false,
      error: "No tracking information found from any available provider or invalid format.",
      source: "MultiProvider",
      isLiveData: false,
    }
  }
}
