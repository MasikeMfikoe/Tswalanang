import type { TrackingResult } from "@/types/tracking"
import { webScrapingService } from "./web-scraping-service"

export interface TrackingProvider {
  name: string
  priority: number
  isAvailable: () => boolean
  track: (trackingNumber: string, options?: any) => Promise<TrackingResult>
  supportedCarriers: string[]
}

export class MultiProviderTrackingService {
  private providers: TrackingProvider[] = []

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    this.providers = [] // Clear existing providers

    // Gocomet Provider (Priority 1 - default)
    // Now checks for GOCOMET_EMAIL and GOCOMET_PASSWORD
    if (process.env.GOCOMET_EMAIL && process.env.GOCOMET_PASSWORD) {
      this.providers.push({
        name: "Gocomet",
        priority: 1, // Highest priority
        isAvailable: () => !!process.env.GOCOMET_EMAIL && !!process.env.GOCOMET_PASSWORD,
        track: this.trackWithGocomet.bind(this),
        supportedCarriers: ["*"], // GoComet supports all modes
      })
    }

    // SeaRates Provider (Priority 2)
    if (process.env.SEARATES_API_KEY) {
      this.providers.push({
        name: "SeaRates",
        priority: 2,
        isAvailable: () => !!process.env.SEARATES_API_KEY,
        track: this.trackWithSeaRates.bind(this),
        supportedCarriers: ["*"],
      })
    }

    // Add Web Scraping as a fallback (Priority 3)
    this.providers.push({
      name: "Web Scraping",
      priority: 3,
      isAvailable: () => true, // Web scraping is generally always available as a last resort
      track: this.trackWithWebScraping.bind(this),
      supportedCarriers: ["*"],
    })

    // Sort by priority
    this.providers.sort((a, b) => a.priority - b.priority)
  }

  async trackShipment(
    trackingNumber: string,
    options: {
      preferredProvider?: string
      carrierHint?: string
      shipmentType?: "ocean" | "air" | "lcl"
      preferScraping?: boolean // Added this option
    } = {},
  ): Promise<TrackingResult> {
    const cleanTrackingNumber = trackingNumber.trim().toUpperCase().replace(/[\s-]/g, "")

    // If preferScraping is true, prioritize web scraping
    if (options.preferScraping) {
      const webScrapingProvider = this.providers.find((p) => p.name === "Web Scraping")
      if (webScrapingProvider?.isAvailable()) {
        try {
          console.log(`[MultiProviderTrackingService] Attempting tracking with Web Scraping (preferred)...`)
          const result = await webScrapingProvider.track(cleanTrackingNumber, options.carrierHint) // Pass carrierHint to scraping
          if (result.success && result.data) {
            console.log(`[MultiProviderTrackingService] ✅ Tracking successful with Web Scraping (preferred)`)
            return { ...result, source: webScrapingProvider.name, isLiveData: true }
          }
        } catch (error) {
          console.warn(`[MultiProviderTrackingService] Preferred Web Scraping failed:`, error)
        }
      }
    }

    // Try preferred provider first if specified (excluding web scraping if already tried)
    if (options.preferredProvider && options.preferredProvider !== "Web Scraping") {
      const preferredProvider = this.providers.find((p) => p.name === options.preferredProvider)
      if (preferredProvider?.isAvailable()) {
        try {
          console.log(
            `[MultiProviderTrackingService] Attempting tracking with ${options.preferredProvider} (preferred)...`,
          )
          const result = await preferredProvider.track(cleanTrackingNumber, options)
          if (result.success) {
            return { ...result, source: preferredProvider.name, isLiveData: true }
          }
        } catch (error) {
          console.warn(`[MultiProviderTrackingService] Preferred provider ${options.preferredProvider} failed:`, error)
        }
      }
    }

    // Try providers in priority order
    for (const provider of this.providers) {
      // Skip if provider was already tried as preferred, or if it's web scraping and not explicitly preferred
      if (
        (options.preferredProvider && provider.name === options.preferredProvider) ||
        (provider.name === "Web Scraping" && options.preferScraping) // If web scraping was preferred and already tried, skip
      ) {
        continue
      }

      if (!provider.isAvailable()) {
        console.log(`[MultiProviderTrackingService] Provider ${provider.name} is not available. Skipping.`)
        continue
      }

      // Skip if provider doesn't support the detected carrier
      if (
        options.carrierHint &&
        !provider.supportedCarriers.includes("*") &&
        !provider.supportedCarriers.includes(options.carrierHint)
      ) {
        console.log(
          `[MultiProviderTrackingService] Provider ${provider.name} does not support carrier hint ${options.carrierHint}. Skipping.`,
        )
        continue
      }

      try {
        console.log(`[MultiProviderTrackingService] Attempting tracking with ${provider.name}...`)
        const result = await provider.track(cleanTrackingNumber, options)

        if (result.success && result.data) {
          console.log(`[MultiProviderTrackingService] ✅ Tracking successful with ${provider.name}`)
          return {
            ...result,
            source: provider.name,
            isLiveData: true,
          }
        } else {
          console.warn(
            `[MultiProviderTrackingService] Provider ${provider.name} returned no data or failed: ${result.error || "No specific error message."}`,
          )
        }
      } catch (error) {
        console.error(`[MultiProviderTrackingService] Provider ${provider.name} threw an unexpected error:`, error)
        continue
      }
    }

    // All providers failed
    console.error(`[MultiProviderTrackingService] All tracking providers failed for ${trackingNumber}.`)
    return {
      success: false,
      error: "Unable to track shipment with any available provider",
      source: "none",
    }
  }

  private async trackWithTrackShip(trackingNumber: string, carrierHint?: string): Promise<TrackingResult> {
    const { TrackShipService } = await import("./trackship-service")
    const trackShipService = new TrackShipService()
    return await trackShipService.trackShipment(trackingNumber, carrierHint)
  }

  private async trackWithSeaRates(trackingNumber: string, options: any): Promise<TrackingResult> {
    const { SeaRatesService } = await import("./searates-service")
    const seaRatesService = new SeaRatesService()
    return await seaRatesService.trackShipment(trackingNumber, {
      forceUpdate: options.preferScraping, // Use forceUpdate if preferScraping is true
      includeRoute: true, // Always request route data
      includeAis: true, // Always request AIS data
      sealine: options.carrierHint, // Pass carrier hint as sealine
      type:
        options.shipmentType === "air"
          ? undefined
          : options.shipmentType === "ocean" || options.shipmentType === "lcl"
            ? "CT"
            : undefined, // Attempt to map bookingType to SeaRates type, or let it auto-detect
    })
  }

  private async trackWithGocomet(trackingNumber: string, options: any): Promise<TrackingResult> {
    const { GocometService } = await import("./gocomet-service")
    const gocometService = new GocometService()
    return await gocometService.trackShipment(trackingNumber, options)
  }

  private async trackWithAfterShip(trackingNumber: string, options: any): Promise<TrackingResult> {
    // Placeholder for AfterShip implementation
    console.log("AfterShip tracking not fully implemented yet.")
    return { success: false, error: "AfterShip not implemented", source: "AfterShip" }
  }

  private async trackWithEasyPost(trackingNumber: string, options: any): Promise<TrackingResult> {
    // Placeholder for EasyPost implementation
    console.log("EasyPost tracking not fully implemented yet.")
    return { success: false, error: "EasyPost not implemented", source: "EasyPost" }
  }

  private async trackWithDirectAPIs(trackingNumber: string): Promise<TrackingResult> {
    const { trackContainerExternal } = await import("./external-tracking-service")
    return await trackContainerExternal(trackingNumber)
  }

  private async trackWithWebScraping(containerNumber: string, carrierHint?: string): Promise<TrackingResult> {
    // Ensure webScrapingService is imported and used correctly
    const result = carrierHint
      ? await webScrapingService.scrapeByCarrier(containerNumber, carrierHint)
      : await webScrapingService.scrapeContainer(containerNumber)

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data, // Assuming scraped data is compatible with TrackingResult data structure
        source: result.source,
        isLiveData: true,
        scrapedAt: result.scrapedAt,
      }
    } else {
      return {
        success: false,
        error: result.error || "Web scraping failed",
        source: result.source,
        isLiveData: false,
      }
    }
  }

  // Get provider status for monitoring
  getProviderStatus() {
    return this.providers.map((provider) => ({
      name: provider.name,
      available: provider.isAvailable(),
      priority: provider.priority,
      supportedCarriers: provider.supportedCarriers,
    }))
  }
}
