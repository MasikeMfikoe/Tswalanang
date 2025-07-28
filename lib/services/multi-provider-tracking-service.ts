import type { TrackingResult, ShipmentType } from "@/types/tracking"
import { SeaRatesService } from "./searates-service"
import { GocometService } from "./gocomet-service"

export interface TrackingProvider {
  name: string
  priority: number
  service: SeaRatesService | GocometService // Union type for all services
  track: (
    trackingNumber: string,
    options?: { shipmentType?: ShipmentType; carrierHint?: string },
  ) => Promise<TrackingResult>
}

interface TrackingOptions {
  preferredProvider?: "SeaRates" | "Gocomet" // Add other providers as needed
  carrierHint?: string
  shipmentType?: ShipmentType
  preferScraping?: boolean // Not used in this simplified version, but kept for interface consistency
}

export class MultiProviderTrackingService {
  private providers: TrackingProvider[] = []

  constructor() {
    // Initialize and register tracking providers with priorities
    // Lower priority number means higher preference
    this.registerProvider({
      name: "SeaRates",
      priority: 1, // Highest priority
      service: new SeaRatesService(),
      track: (trackingNumber, options) =>
        new SeaRatesService().trackShipment(trackingNumber, {
          sealine: options?.carrierHint,
          type: this.mapShipmentTypeToSeaRatesType(options?.shipmentType),
        }),
    })

    this.registerProvider({
      name: "Gocomet",
      priority: 2, // Second highest priority
      service: new GocometService(),
      track: (trackingNumber, options) =>
        new GocometService().trackShipment(trackingNumber, {
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

  async trackShipment(trackingNumber: string, options?: TrackingOptions): Promise<TrackingResult> {
    let lastError: string | undefined

    // If a preferred provider is specified, try it first
    if (options?.preferredProvider) {
      const preferred = this.providers.find((p) => p.name === options.preferredProvider)
      if (preferred) {
        console.log(`Attempting to track with preferred provider: ${preferred.name}`)
        const result = await preferred.track(trackingNumber, {
          shipmentType: options.shipmentType,
          carrierHint: options.carrierHint,
        })
        if (result.success) {
          return result
        } else {
          console.warn(`Preferred provider ${preferred.name} failed: ${result.error}`)
          lastError = result.error
        }
      }
    }

    // Iterate through other providers by priority
    for (const provider of this.providers) {
      // Skip if it was the preferred provider and it already failed
      if (options?.preferredProvider && provider.name === options.preferredProvider) {
        continue
      }

      console.log(`Attempting to track with: ${provider.name}`)
      const result = await provider.track(trackingNumber, {
        shipmentType: options?.shipmentType,
        carrierHint: options?.carrierHint,
      })
      if (result.success) {
        return result
      } else {
        console.warn(`Provider ${provider.name} failed: ${result.error}`)
        lastError = result.error
      }
    }

    return {
      success: false,
      error: lastError || "No tracking information found from any available provider.",
      source: "MultiProvider",
    }
  }
}
