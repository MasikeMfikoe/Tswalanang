import type { TrackingResult, ShipmentType } from "@/types/tracking"
import { SeaRatesService } from "./searates-service"
import { GocometService } from "./gocomet-service"

// Define an internal interface for how providers are stored and called
interface InternalTrackingProvider {
  name: string;
  priority: number;
  // The 'track' function here will wrap the specific service's method (e.g., trackShipment)
  track: (
    trackingNumber: string,
    options?: { shipmentType?: ShipmentType; carrierHint?: string },
  ) => Promise<TrackingResult>;
}

interface TrackingOptions {
  preferredProvider?: "SeaRates" | "Gocomet" // Add other providers as needed
  carrierHint?: string
  shipmentType?: ShipmentType
  preferScraping?: boolean // Not used in this simplified version, but kept for interface consistency
}

export class MultiProviderTrackingService {
  private providers: InternalTrackingProvider[] = []

  constructor() {
    // Initialize and register tracking providers with priorities
    // Lower priority number means higher preference

    // Gocomet Service - Assigned highest priority
    this.providers.push({
      name: "Gocomet",
      priority: 1,
      track: (trackingNumber, options) =>
        new GocometService().trackShipment(trackingNumber, {
          shipmentType: options?.shipmentType,
          carrierHint: options?.carrierHint,
        }),
    });

    // SeaRates Service - Assigned lower priority
    this.providers.push({
      name: "SeaRates",
      priority: 2,
      track: (trackingNumber, options) =>
        new SeaRatesService().trackShipment(trackingNumber, {
          sealine: options?.carrierHint,
          type: this.mapShipmentTypeToSeaRatesType(options?.shipmentType),
        }),
    });

    // Sort providers by priority to ensure correct order of attempts
    this.providers.sort((a, b) => a.priority - b.priority)
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
