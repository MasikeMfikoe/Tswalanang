import type { TrackingResult, TrackingData, ShipmentType } from "@/types/tracking"

/**
 * A **minimal mock** TrackShip service.
 * Replace this with real API client logic when ready.
 */
export class TrackShipService {
  private gocometToken: string | null

  constructor(gocometToken: string | null = null) {
    this.gocometToken = gocometToken
  }

  async trackShipment(
    trackingNumber: string,
    options?: { shipmentType?: ShipmentType; carrierHint?: string },
  ): Promise<TrackingResult> {
    console.log(`[TrackShipService] Attempting to track ${trackingNumber} with mock service.`)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // This is a mock implementation.
    // In a real scenario, you would make an actual API call to TrackShip.
    // For now, it will only "succeed" for a specific mock number.
    if (trackingNumber === "MOCKTRACK123") {
      const mockData: TrackingData = {
        shipmentNumber: trackingNumber,
        status: "Delivered (Mock)",
        carrier: options?.carrierHint || "Mock Carrier",
        containerNumber: "MOCKCONTAINER",
        origin: "Mock Origin Port",
        destination: "Mock Destination Port",
        eta: "2025-08-01",
        timeline: [
          {
            location: "Mock Origin Port",
            events: [
              {
                timestamp: "2025-07-15T10:00:00Z",
                description: "Shipment received at origin (Mock)",
                status: "Received",
                type: "cargo-received",
              },
            ],
          },
          {
            location: "Mock Transit Hub",
            events: [
              {
                timestamp: "2025-07-18T14:30:00Z",
                description: "Departed transit hub (Mock)",
                status: "In Transit",
                type: "vessel-departure",
              },
            ],
          },
          {
            location: "Mock Destination Port",
            events: [
              {
                timestamp: "2025-07-25T09:00:00Z",
                description: "Arrived at destination (Mock)",
                status: "Arrived",
                type: "vessel-arrival",
              },
              {
                timestamp: "2025-07-26T11:00:00Z",
                description: "Delivered (Mock)",
                status: "Delivered",
                type: "event",
              },
            ],
          },
        ],
      }
      return { success: true, data: mockData, source: "TrackShip Mock", isLiveData: false }
    } else {
      return { success: false, error: "TrackShip mock could not find this tracking number.", source: "TrackShip Mock" }
    }
  }
}

// This function is kept for backward compatibility if other parts of the app
// directly call getTrackShipTracking instead of using the service class.
export async function getTrackShipTracking(trackingNumber: string): Promise<TrackingResult | null> {
  const service = new TrackShipService()
  const result = await service.trackShipment(trackingNumber)
  return result.success ? result : null
}
