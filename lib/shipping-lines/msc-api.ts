import type { ShipmentType, TrackingResult, TrackingData } from "@/types/tracking"

// This is a simplified mock for MSC API integration.
// In a real scenario, this would involve actual API calls to MSC.
export class MscApi {
  async trackShipment(
    trackingNumber: string,
    options?: { shipmentType?: ShipmentType; carrierHint?: string },
  ): Promise<TrackingResult> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (trackingNumber.startsWith("MSCU")) {
      // Simulate successful tracking for a specific MSC number
      if (trackingNumber === "MSCU9876543") {
        const mockData: TrackingData = {
          shipmentNumber: "MSCU9876543",
          status: "Customs Cleared",
          carrier: "MSC",
          containerNumber: "MSCU9876543",
          containerType: "20' GP",
          weight: "15,000 kg",
          origin: "Busan, South Korea",
          destination: "Los Angeles, USA",
          pol: "KRPUS",
          pod: "USLAX",
          eta: "2025-08-10",
          etd: "2025-07-10",
          lastLocation: "Los Angeles, USA",
          timeline: [
            {
              location: "Busan, South Korea",
              events: [
                {
                  timestamp: "2025-07-08T09:00:00Z",
                  date: "2025-07-08",
                  time: "09:00",
                  location: "Busan, South Korea",
                  description: "Container loaded onto vessel",
                  status: "Loaded",
                  type: "load",
                },
                {
                  timestamp: "2025-07-10T11:00:00Z",
                  date: "2025-07-10",
                  time: "11:00",
                  location: "Busan, South Korea",
                  description: "Vessel departed from Busan",
                  status: "Departed",
                  vessel: "MSC GÜLSÜN",
                  voyage: "001W",
                  type: "vessel-departure",
                },
              ],
            },
            {
              location: "Los Angeles, USA",
              events: [
                {
                  timestamp: "2025-08-08T16:00:00Z",
                  date: "2025-08-08",
                  time: "16:00",
                  location: "Los Angeles, USA",
                  description: "Vessel arrived at Los Angeles",
                  status: "Arrived",
                  vessel: "MSC GÜLSÜN",
                  voyage: "001W",
                  type: "vessel-arrival",
                },
                {
                  timestamp: "2025-08-09T10:00:00Z",
                  date: "2025-08-09",
                  time: "10:00",
                  location: "Los Angeles, USA",
                  description: "Shipment cleared customs",
                  status: "Customs Cleared",
                  type: "customs-cleared",
                },
              ],
            },
          ],
          documents: [],
          details: {
            packages: "15 pallets",
            dimensions: "6m x 2.3m x 2.4m",
            shipmentType: "ocean",
            freeDaysBeforeDemurrage: 5,
          },
        }
        return { success: true, data: mockData, source: "MSC API", isLiveData: true }
      } else {
        return {
          success: false,
          error: "No live tracking information found for this MSC number.",
          source: "MSC API",
          isLiveData: false,
          fallbackOptions: {
            carrier: "MSC",
            trackingUrl: `https://www.msc.com/track-and-trace?search=${trackingNumber}`,
          },
        }
      }
    }
    return { success: false, error: "Not an MSC tracking number.", source: "MSC API", isLiveData: false }
  }
}
