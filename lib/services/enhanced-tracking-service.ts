import { webScrapingService } from "./web-scraping-service"
import { trackContainerExternal } from "./external-tracking-service"
import { detectContainerInfo } from "./container-detection-service"

export interface EnhancedTrackingResult {
  success: boolean
  data?: any
  source: string
  isLiveData: boolean
  scrapedAt?: string
  error?: string
  fallbackOptions?: Array<{
    name: string
    url: string
    type: "website" | "api"
  }>
}

export class EnhancedTrackingService {
  constructor() {}

  async trackContainer(
    containerNumber: string,
    options: {
      preferScraping?: boolean
      carrierHint?: string
      enableFallback?: boolean
    } = {},
  ): Promise<EnhancedTrackingResult> {
    const cleanContainer = containerNumber.trim().toUpperCase()
    const containerInfo = detectContainerInfo(cleanContainer)

    console.log(`🔍 Enhanced tracking for: ${cleanContainer}`)
    console.log(`📦 Container info:`, containerInfo)

    const trackingMethods = []

    // If user prefers scraping or we have a specific carrier hint, try scraping first
    if (options.preferScraping || options.carrierHint) {
      trackingMethods.push({
        name: "Web Scraping",
        method: () => this.tryWebScraping(cleanContainer, options.carrierHint),
      })
    }

    // Add direct carrier APIs
    trackingMethods.push({
      name: "Direct Carrier APIs",
      method: () => this.tryDirectAPIs(cleanContainer),
    })

    // If scraping wasn't tried first, add it as fallback
    if (!options.preferScraping && !options.carrierHint) {
      trackingMethods.push({
        name: "Web Scraping Fallback",
        method: () => this.tryWebScraping(cleanContainer, containerInfo.carrier),
      })
    }

    // Try each method in sequence
    for (const trackingMethod of trackingMethods) {
      try {
        console.log(`🚀 Trying ${trackingMethod.name}...`)
        const result = await trackingMethod.method()

        if (result.success && result.data) {
          console.log(`✅ Success with ${trackingMethod.name}`)
          return {
            ...result,
            source: `${trackingMethod.name} - ${result.source || "Unknown"}`,
            isLiveData: true,
          }
        } else {
          console.log(`❌ ${trackingMethod.name} failed: ${result.error}`)
        }
      } catch (error) {
        console.error(`💥 ${trackingMethod.name} error:`, error)
        continue
      }
    }

    // All methods failed - provide fallback options
    const fallbackOptions = this.generateFallbackOptions(cleanContainer, containerInfo)

    return {
      success: false,
      error: "Unable to retrieve live tracking data from any source",
      source: "Enhanced Tracking Service",
      isLiveData: false,
      fallbackOptions,
    }
  }

  private async tryWebScraping(containerNumber: string, carrierHint?: string): Promise<EnhancedTrackingResult> {
    try {
      const result = await webScrapingService.scrapeContainer(containerNumber, carrierHint)

      if (result.success && result.data) {
        return {
          success: true,
          data: this.transformScrapedData(result.data),
          source: result.source,
          isLiveData: true,
          scrapedAt: new Date().toISOString(),
        }
      } else {
        return {
          success: false,
          error: result.error || "Web scraping failed",
          source: result.source,
          isLiveData: false,
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Web scraping error: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "Web Scraping Service",
        isLiveData: false,
      }
    }
  }

  private async tryDirectAPIs(containerNumber: string): Promise<EnhancedTrackingResult> {
    try {
      const result = await trackContainerExternal(containerNumber)

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          source: result.source || "Direct Carrier API",
          isLiveData: true,
        }
      } else {
        return {
          success: false,
          error: result.error || "Direct API failed",
          source: "Direct Carrier APIs",
          isLiveData: false,
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Direct API error: ${error instanceof Error ? error.message : "Unknown error"}`,
        source: "Direct Carrier APIs",
        isLiveData: false,
      }
    }
  }

  private transformScrapedData(scrapedData: any) {
    return {
      shipmentNumber: scrapedData.containerNumber,
      status: scrapedData.status,
      containerNumber: scrapedData.containerNumber,
      containerType: "Container",
      weight: "Unknown",
      origin: "Unknown",
      destination: "Unknown",
      pol: "Unknown",
      pod: "Unknown",
      estimatedArrival: scrapedData.eta || "Unknown",
      lastLocation: scrapedData.location || "Unknown",
      timeline: this.transformScrapedEvents(scrapedData.events || []),
      documents: [],
      details: {
        packages: "Unknown",
        specialInstructions: `Data scraped from ${scrapedData.source || "carrier website"}`,
        dimensions: "Unknown",
        shipmentType: "Ocean Freight",
        vessel: scrapedData.vessel,
      },
    }
  }

  private transformScrapedEvents(events: any[]) {
    const groupedEvents: Record<string, any> = {}

    events.forEach((event) => {
      const location = event.location || "Unknown"
      if (!groupedEvents[location]) {
        groupedEvents[location] = {
          location,
          events: [],
        }
      }

      groupedEvents[location].events.push({
        type: "event",
        status: event.status,
        timestamp: `${event.date} ${event.time}`,
        date: event.date,
        time: event.time,
        description: event.description,
      })
    })

    return Object.values(groupedEvents)
  }

  private generateFallbackOptions(containerNumber: string, containerInfo: any) {
    const fallbackOptions = []

    if (containerInfo.carrier) {
      const carrierUrls: Record<string, string> = {
        MAERSK: `https://www.maersk.com/tracking/${containerNumber}`,
        MSC: `https://www.msc.com/track-a-shipment?agencyPath=msc&trackingNumber=${containerNumber}`,
        "CMA CGM": `https://www.cma-cgm.com/ebusiness/tracking/search?number=${containerNumber}`,
        "HAPAG-LLOYD": `https://www.hapag-lloyd.com/en/online-business/track/track-by-container-solution.html?container=${containerNumber}`,
        COSCO: `https://elines.coscoshipping.com/ebusiness/cargoTracking?trackingType=CONTAINER&number=${containerNumber}`,
        EVERGREEN: `https://www.evergreen-line.com/emodal/stpb/stpb_show.do?lang=en&f_cmd=track&f_container_no=${containerNumber}`,
        OOCL: `https://www.oocl.com/eng/ourservices/eservices/cargotracking/Pages/cargotracking.aspx?ContainerNo=${containerNumber}`,
        ONE: `https://ecomm.one-line.com/ecom/CUP_HOM_3301.do?trackingNumber=${containerNumber}`,
      }

      const carrierUrl = carrierUrls[containerInfo.carrier]
      if (carrierUrl) {
        fallbackOptions.push({
          name: `${containerInfo.carrier} Official Website`,
          url: carrierUrl,
          type: "website" as const,
        })
      }
    }

    // Add generic tracking sites
    fallbackOptions.push(
      {
        name: "Container Tracking",
        url: `https://www.track-trace.com/container/${containerNumber}`,
        type: "website" as const,
      },
      {
        name: "SeaRates Container Tracking",
        url: `https://www.searates.com/container/tracking/?container=${containerNumber}`,
        type: "website" as const,
      },
    )

    return fallbackOptions
  }
}

export const enhancedTrackingService = new EnhancedTrackingService()
