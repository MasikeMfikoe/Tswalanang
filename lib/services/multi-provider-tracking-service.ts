import type { TrackingResult, ShipmentType, DetectedShipmentInfo } from "@/types/tracking"
import { SeaRatesService } from "./searates-service"
import { GocometService } from "./gocomet-service"

interface TrackingProvider {
  name: string
  priority: number
  service: any
  track: (trackingNumber: string, options?: TrackingOptions) => Promise<TrackingResult>
}

interface TrackingOptions {
  shipmentType?: ShipmentType
  carrierHint?: string
  preferScraping?: boolean
}

export class MultiProviderTrackingService {
  private providers: TrackingProvider[] = []

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    // Register Gocomet with highest priority
    this.registerProvider({
      name: "Gocomet",
      priority: 1, // Highest priority
      service: new GocometService(),
      track: (trackingNumber, options) =>
        new GocometService().trackShipment(trackingNumber, {
          shipmentType: options?.shipmentType,
          carrierHint: options?.carrierHint,
        }),
    })

    // Register SeaRates with lower priority
    this.registerProvider({
      name: "SeaRates",
      priority: 2, // Lower priority
      service: new SeaRatesService(),
      track: (trackingNumber, options) =>
        new SeaRatesService().trackShipment(trackingNumber, {
          sealine: options?.carrierHint,
          type: this.mapShipmentTypeToSeaRatesType(options?.shipmentType),
        }),
    })
  }

  private registerProvider(provider: TrackingProvider) {
    this.providers.push(provider)
    // Sort providers by priority (lower number = higher priority)
    this.providers.sort((a, b) => a.priority - b.priority)
  }

  private mapShipmentTypeToSeaRatesType(shipmentType?: ShipmentType): string {
    switch (shipmentType) {
      case "ocean":
        return "ocean"
      case "air":
        return "air"
      case "lcl":
        return "lcl"
      default:
        return "ocean" // Default to ocean freight
    }
  }

  async trackShipment(
    trackingNumber: string,
    options?: TrackingOptions
  ): Promise<TrackingResult> {
    console.log(`Starting multi-provider tracking for: ${trackingNumber}`)
    console.log(`Available providers (in priority order):`, this.providers.map(p => `${p.name} (priority: ${p.priority})`))

    const errors: string[] = []

    for (const provider of this.providers) {
      try {
        console.log(`Attempting tracking with ${provider.name}...`)
        const result = await provider.track(trackingNumber, options)
        
        if (result.success) {
          console.log(`✅ Successfully tracked with ${provider.name}`)
          return result
        } else {
          console.log(`❌ ${provider.name} failed:`, result.error)
          errors.push(`${provider.name}: ${result.error}`)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        console.log(`❌ ${provider.name} threw error:`, errorMessage)
        errors.push(`${provider.name}: ${errorMessage}`)
      }
    }

    // If all providers failed, return a consolidated error
    return {
      success: false,
      error: `All tracking providers failed. Errors: ${errors.join("; ")}`,
      source: "MultiProviderTrackingService",
      fallbackOptions: this.providers.map(p => p.name),
    }
  }

  getAvailableProviders(): string[] {
    return this.providers.map(p => p.name)
  }

  getProviderPriority(providerName: string): number | null {
    const provider = this.providers.find(p => p.name === providerName)
    return provider ? provider.priority : null
  }
}
