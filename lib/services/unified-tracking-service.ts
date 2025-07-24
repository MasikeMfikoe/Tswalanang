import type { GoCometService } from "./gocomet-service"
import type { MaerskAPI } from "../shipping-lines/maersk-api"
import type { MSCAPI } from "../shipping-lines/msc-api"
import type { TrackShipService } from "./trackship-service"
import type { MockTrackingService } from "./mock-tracking-service"
import type { SearatesService } from "./searates-service"
import type { WebScrapingService } from "./web-scraping-service"
import type { TrackingData } from "@/types/tracking"

export class UnifiedTrackingService {
  private gocometService: GoCometService
  private maerskApi: MaerskAPI
  private mscApi: MSCAPI
  private trackShipService: TrackShipService
  private mockTrackingService: MockTrackingService
  private searatesService: SearatesService
  private webScrapingService: WebScrapingService

  constructor(
    gocometService: GoCometService,
    maerskApi: MaerskAPI,
    mscApi: MSCAPI,
    trackShipService: TrackShipService,
    mockTrackingService: MockTrackingService,
    searatesService: SearatesService,
    webScrapingService: WebScrapingService,
  ) {
    this.gocometService = gocometService
    this.maerskApi = maerskApi
    this.mscApi = mscApi
    this.trackShipService = trackShipService
    this.mockTrackingService = mockTrackingService
    this.searatesService = searatesService
    this.webScrapingService = webScrapingService
  }

  async trackShipment(
    trackingNumber: string,
    provider?: string | null,
    gocometToken?: string,
  ): Promise<TrackingData | null> {
    try {
      let trackingData: TrackingData | null = null

      switch (provider?.toLowerCase()) {
        case "gocomet":
          if (gocometToken) {
            trackingData = await this.gocometService.trackShipment(trackingNumber, gocometToken)
          } else {
            console.warn("GoComet provider selected but no token provided.")
          }
          break
        case "maersk":
          trackingData = await this.maerskApi.trackShipment(trackingNumber)
          break
        case "msc":
          trackingData = await this.mscApi.trackShipment(trackingNumber)
          break
        case "trackship":
          trackingData = await this.trackShipService.trackShipment(trackingNumber)
          break
        case "searates":
          trackingData = await this.searatesService.trackShipment(trackingNumber)
          break
        case "webscraping":
          trackingData = await this.webScrapingService.trackShipment(trackingNumber)
          break
        case "mock":
          trackingData = await this.mockTrackingService.trackShipment(trackingNumber)
          break
        default:
          // Attempt to track with multiple providers if no specific provider is given
          console.log("No specific provider given, attempting to track with multiple services.")
          // Prioritize real services over mock
          trackingData =
            (gocometToken ? await this.gocometService.trackShipment(trackingNumber, gocometToken) : null) ||
            (await this.maerskApi.trackShipment(trackingNumber)) ||
            (await this.mscApi.trackShipment(trackingNumber)) ||
            (await this.trackShipService.trackShipment(trackingNumber)) ||
            (await this.searatesService.trackShipment(trackingNumber)) ||
            (await this.webScrapingService.trackShipment(trackingNumber)) ||
            (await this.mockTrackingService.trackShipment(trackingNumber)) // Fallback to mock
          break
      }

      return trackingData
    } catch (error) {
      console.error(`Error in UnifiedTrackingService for ${trackingNumber} with provider ${provider}:`, error)
      return null
    }
  }
}
