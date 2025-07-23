import type { ShipmentType, TrackingResult, TrackingData } from "@/types/tracking"

// This is a simplified mock for MSC API integration.
// In a real scenario, this would involve actual API calls to MSC.
export class MSCAPI {
  async trackShipment(
    trackingNumber: string,
    options?: { shipmentType?: ShipmentType; carrierHint?: string },
  ): Promise<TrackingResult> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    if (trackingNumber.startsWith("MSCU")) {
      // Simulate successful tracking for a specific MSC number
      if (trackingNumber === "MSCU9876543") {
        const mockData: TrackingData = {
          shipmentNumber: "MSCU9876543",
          status: "In Transit",
          carrier: "MSC",
          containerNumber: "MSCU9876543",
          containerType: "40' GP",
          weight: "25,000 KGS",
          origin: "Valencia, Spain",
          destination: "Santos, Brazil",
          pol: "ESVLC",
          pod: "BRSSZ",
          eta: "2025-09-01",
          etd: "2025-08-10",
          lastLocation: "Atlantic Ocean",
          timeline: [
            {
              location: "Valencia, Spain",
              terminal: "MSC Terminal Valencia",
              events: [
                {
                  timestamp: "2025-08-08T11:00:00Z",
                  date: "2025-08-08",
                  time: "11:00",
                  location: "Valencia, Spain",
                  description: "Cargo received at origin terminal",
                  status: "Cargo Received",
                  type: "cargo-received",
                  mode: "TRUCK",
                },
                {
                  timestamp: "2025-08-10T16:00:00Z",
                  date: "2025-08-10",
                  time: "16:00",
                  location: "Valencia, Spain",
                  description: "Vessel departed from Valencia",
                  status: "Departed",
                  vessel: "MSC GENEVA",
                  voyage: "234S",
                  type: "vessel-departure",
                  mode: "OCEAN",
                },
              ],
            },
            {
              location: "Atlantic Ocean",
              events: [
                {
                  timestamp: "2025-08-20T14:00:00Z",
                  date: "2025-08-20",
                  time: "14:00",
                  location: "Mid-Atlantic",
                  description: "Vessel is in transit",
                  status: "In Transit",
                  type: "event",
                  mode: "OCEAN",
                },
              ],
            },
            {
              location: "Santos, Brazil",
              terminal: "Santos Port Terminal",
              events: [
                {
                  timestamp: "2025-09-01T08:00:00Z",
                  date: "2025-09-01",
                  time: "08:00",
                  location: "Santos, Brazil",
                  description: "Vessel arrived at destination port",
                  status: "Arrived",
                  vessel: "MSC GENEVA",
                  voyage: "234S",
                  type: "vessel-arrival",
                  mode: "OCEAN",
                },
              ],
            },
          ],
          documents: [
            { type: "Bill of Lading", url: "/placeholder.svg?height=100&width=100", description: "Original BL" },
            {
              type: "Packing List",
              url: "/placeholder.svg?height=100&width=100",
              description: "Detailed packing list",
            },
          ],
          details: {
            packages: "150 drums",
            dimensions: "11m x 2.5m x 2.6m",
            shipmentType: "ocean",
            freeDaysBeforeDemurrage: 10,
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
            trackingUrl: `https://www.msc.com/track-a-shipment?agencyPath=msc&trackingNumber=${trackingNumber}`,
          },
        }
      }
    }
    return { success: false, error: "Not an MSC tracking number.", source: "MSC API", isLiveData: false }
  }
}

export default MSCAPI
