import type { TrackingResult, ShipmentType } from "@/types/tracking"
import { SeaRatesService } from "./searates-service"
import { GocometService } from "./gocomet-service"

// Define an internal interface for how providers are stored
interface InternalTrackingProvider {
  name: string;
  priority: number;
  serviceInstance: SeaRatesService | GocometService; // Holds the actual service instance
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
      serviceInstance: new GocometService(),
    });

    // SeaRates Service - Assigned lower priority
    this.providers.push({
      name: "SeaRates",
      priority: 2,
      serviceInstance: new SeaRatesService(),
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

    // Helper function to attempt tracking with a specific provider
    const attemptTrack = async (provider: InternalTrackingProvider): Promise<TrackingResult | null> => {
      console.log(`Attempting to track with: ${provider.name}`);
      try {
        if (provider.name === "Gocomet") {
          // GocometService expects { shipmentType, carrierHint }
          const gocometService = provider.serviceInstance as GocometService;
          return await gocometService.trackShipment(trackingNumber, {
            shipmentType: options?.shipmentType,
            carrierHint: options?.carrierHint,
          });
        } else if (provider.name === "SeaRates") {
          // SeaRatesService expects { sealine, type }
          const seaRatesService = provider.serviceInstance as SeaRatesService;
          return await seaRatesService.trackShipment(trackingNumber, {
            sealine: options?.carrierHint, // SeaRates uses 'sealine' for carrier hint
            type: this.mapShipmentTypeToSeaRatesType(options?.shipmentType),
          });
        }
        // Fallback for any other unhandled service types, though currently only Gocomet and SeaRates
        return { success: false, error: `Unsupported tracking provider: ${provider.name}`, source: provider.name };
      } catch (error: any) {
        console.warn(`Provider ${provider.name} failed: ${error.message}`);
        return { success: false, error: error.message, source: provider.name };
      }
    };

    // If a preferred provider is specified, try it first
    if (options?.preferredProvider) {
      const preferred = this.providers.find((p) => p.name === options.preferredProvider)
      if (preferred) {
        const result = await attemptTrack(preferred);
        if (result && result.success) {
          return result;
        } else if (result) {
          lastError = result.error;
        }
      }
    }

    // Iterate through other providers by priority
    for (const provider of this.providers) {
      // Skip if it was the preferred provider and it already failed
      if (options?.preferredProvider && provider.name === options.preferredProvider) {
        continue
      }

      const result = await attemptTrack(provider);
      if (result && result.success) {
        return result;
      } else if (result) {
        lastError = result.error;
      }
    }

    return {
      success: false,
      error: lastError || "No tracking information found from any available provider.",
      source: "MultiProvider",
    }
  }
}
