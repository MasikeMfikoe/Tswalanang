import type { TrackingResult, ShipmentType } from "@/types/tracking"
import { SeaRatesService } from "./searates-service"
import { GocometService } from "./gocomet-service"
import { BaseShippingApi } from '../shipping-lines/base-shipping-api';
import { TrackingProvider } from '../../types/tracking';

interface TrackingProviderConfig {
  service: BaseShippingApi | any; // 'any' is used here for flexibility if specific BaseShippingApi implementations aren't strictly typed to it
  priority: number;
}

interface TrackingOptions {
  preferredProvider?: "SeaRates" | "Gocomet" // Add other providers as needed
  carrierHint?: string
  shipmentType?: ShipmentType
  preferScraping?: boolean // Not used in this simplified version, but kept for interface consistency
}

export class MultiProviderTrackingService {
  private providers: TrackingProviderConfig[];

  constructor() {
    this.providers = [
      { service: new GocometService(), priority: 1 }, // Gocomet now has the highest priority
      { service: new SeaRatesService(), priority: 2 }, // SeaRates has a lower priority
      // Add other providers here with their priorities if needed
    ].sort((a, b) => a.priority - b.priority); // Ensure providers are sorted by priority
  }

  async trackShipment(trackingNumber: string, options?: TrackingOptions): Promise<TrackingResult | null> {
    let lastError: string | undefined

    // If a preferred provider is specified, try it first
    if (options?.preferredProvider) {
      const preferred = this.providers.find((p) => p.service.name === options.preferredProvider)
      if (preferred) {
        console.log(`Attempting to track with preferred provider: ${preferred.service.name}`)
        try {
          const result = await preferred.service.track(trackingNumber);
          if (result) {
            return result;
          }
        } catch (error) {
          console.error(`Error tracking with preferred provider (priority ${preferred.priority}):`, error);
          lastError = error.message;
        }
      }
    }

    // Iterate through other providers by priority
    for (const providerConfig of this.providers) {
      // Skip if it was the preferred provider and it already failed
      if (options?.preferredProvider && providerConfig.service.name === options.preferredProvider) {
        continue
      }

      console.log(`Attempting to track with: ${providerConfig.service.name}`)
      try {
        const result = await providerConfig.service.track(trackingNumber);
        if (result) {
          return result;
        }
      } catch (error) {
        console.error(`Error tracking with provider (priority ${providerConfig.priority}):`, error);
        lastError = error.message;
      }
    }

    return {
      success: false,
      error: lastError || "No tracking information found from any available provider.",
      source: "MultiProvider",
    }
  }
}
