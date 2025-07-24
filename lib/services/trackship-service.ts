import type { ShipmentType, TrackingResult, TrackingData } from "@/types/tracking"

// This is a simplified mock for Trackship API integration.
// In a real scenario, this would involve actual API calls to Trackship.
export class TrackShipService {
  async trackShipment(
    trackingNumber: string,
    options?: { shipmentType?: ShipmentType; carrierHint?: string },
  ): Promise<TrackingResult> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (trackingNumber.startsWith("MOCKTRACK")) {
      // Simulate successful tracking for a specific Trackship number
      if (trackingNumber === "MOCKTRACK123") {
        const mockData: TrackingData = {
          shipmentNumber: "MOCKTRACK123",
          status: "Out for Delivery",
          carrier: "Mock Courier",
          origin: "New York, USA",
          destination: "Boston, USA",
          eta: "2025-07-25",
          etd: "2025-07-24",
          lastLocation: "Springfield, USA",
          timeline: [
            {
              location: "New York, USA",
              events: [
                {
                  timestamp: "2025-07-24T09:00:00Z",
                  date: "2025-07-24",
                  time: "09:00",
                  location: "New York, USA",
                  description: "Package picked up",
                  status: "Picked Up",
                  type: "pickup",
                  mode: "Road",
                },
                {
                  timestamp: "2025-07-24T12:00:00Z",
                  date: "2025-07-24",
                  time: "12:00",
                  location: "New York, USA",
                  description: "Departed from sorting facility",
                  status: "In Transit",
                  type: "event",
                  mode: "Road",
                },
              ],
            },
            {
              location: "Springfield, USA",
              events: [
                {
                  timestamp: "2025-07-25T06:00:00Z",
                  date: "2025-07-25",
                  time: "06:00",
                  location: "Springfield, USA",
                  description: "Arrived at local distribution center",
                  status: "In Transit",
                  type: "event",
                  mode: "Road",
                },
                {
                  timestamp: "2025-07-25T08:30:00Z",
                  date: "2025-07-25",
                  time: "08:30",
                  location: "Springfield, USA",
                  description: "Out for delivery",
                  status: "Out for Delivery",
                  type: "out-for-delivery",
                  mode: "Road",
                },
              ],
            },
          ],
          documents: [],
          details: {
            packages: "1 package",
            dimensions: "0.5m x 0.5m x 0.5m",
            shipmentType: "parcel",
          },
        }
        return { success: true, data: mockData, source: "Trackship API", isLiveData: true }
      } else {
        return {
          success: false,
          error: "No live tracking information found for this Trackship number.",
          source: "Trackship API",
          isLiveData: false,
          fallbackOptions: {
            carrier: "Trackship",
            trackingUrl: `https://www.trackship.com/track/${trackingNumber}`,
          },
        }
      }
    }
    return { success: false, error: "Not a Trackship tracking number.", source: "Trackship API", isLiveData: false }
  }

  async getSupportedCarriers(): Promise<any> {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve([
          { name: "Mock Courier", code: "mock" },
          { name: "Another Courier", code: "another" },
        ])
      }, 500),
    )
  }
}
