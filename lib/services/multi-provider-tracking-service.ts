import { MaerskApi } from "@/lib/shipping-lines/maersk-api"
// import { MscApi } from "@/lib/shipping-lines/msc-api" // Remove this line
import { TrackShipService } from "@/lib/services/trackship-service"
import { MockTrackingService } from "@/lib/services/mock-tracking-service"
import { GocometService } from "@/lib/services/gocomet-service"
import type { ShipmentType, TrackingResult } from "@/types/tracking"

export class MultiProviderTrackingService {
  private maerskApi: MaerskApi
  // private mscApi: MscApi // Remove this line
  private trackShipService: TrackShipService
  private mockTrackingService: MockTrackingService

  constructor() {
    this.maerskApi = new MaerskApi()
    // this.mscApi = new MscApi() // Remove this line
    this.trackShipService = new TrackShipService()
    this.mockTrackingService = new MockTrackingService()
  }

  async trackShipment(
    trackingNumber: string,
    options?: { shipmentType?: ShipmentType; carrierHint?: string; gocometToken?: string },
  ): Promise<TrackingResult> {
    // Try mock data first
    const mockResult = await this.mockTrackingService.trackShipment(trackingNumber)
    if (mockResult.success) {
      return mockResult
    }

    // Try Maersk API
    const maerskResult = await this.maerskApi.trackShipment(trackingNumber, options)
    if (maerskResult.success) {
      return maerskResult
    }

    // Try MSC API (removed)
    // const mscResult = await this.mscApi.trackShipment(trackingNumber, options) // Remove this block
    // if (mscResult.success) {
    //   return mscResult
    // }

    // Try GoComet API
    if (options?.gocometToken) {
      const gocometResult = await GocometService.trackShipment(
        trackingNumber,
        options.gocometToken,
        options.shipmentType,
      )
      if (gocometResult.success) {
        return gocometResult
      }
    }

    // Try TrackShip API
    const trackShipResult = await this.trackShipService.trackShipment(trackingNumber, options)
    if (trackShipResult.success) {
      return trackShipResult
    }

    return {
      success: false,
      error: "No tracking information found from any provider.",
      source: "Multi-Provider",
      isLiveData: false,
    }
  }
}
