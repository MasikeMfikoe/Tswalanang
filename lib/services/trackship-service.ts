import type { TrackingResult, ShipmentType, TrackingData, TrackingEvent } from "@/types/tracking"

export class TrackShipService {
  private gocometToken: string | null

  constructor(gocometToken: string | null = null) {
    this.gocometToken = gocometToken
  }

  /**
   * Mocks tracking information from the TrackShip API.
   * In a real scenario, this would make an actual API call.
   * @param trackingNumber The tracking number to query.
   * @returns A formatted TrackingResult.
   */
  async trackShipment(
    trackingNumber: string,
    options?: { shipmentType?: ShipmentType; carrierHint?: string },
  ): Promise<TrackingResult> {
    console.log(`[TrackShipService] Mocking tracking for: ${trackingNumber}`)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const now = new Date().toISOString()
    const mockEvents: TrackingEvent[] = [
      {
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Shanghai, China",
        description: "Container received at origin port",
        status: "Received",
        type: "cargo-received",
      },
      {
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Shanghai, China",
        description: "Loaded on vessel",
        status: "Loaded",
        type: "load",
        vessel: "Mock Vessel A",
        voyage: "V001",
      },
      {
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Pacific Ocean",
        description: "In transit",
        status: "In Transit",
        type: "event",
        vessel: "Mock Vessel A",
        voyage: "V001",
      },
      {
        timestamp: now,
        location: "Long Beach, USA",
        description: "Estimated arrival at destination port",
        status: "Estimated Arrival",
        type: "vessel-arrival",
      },
    ]

    const mockData: TrackingData = {
      shipmentNumber: trackingNumber,
      status: "In Transit",
      carrier: options?.carrierHint || "Mock Carrier",
      containerNumber: "MOCK1234567",
      containerType: "40' HC",
      weight: "10,000 KGS",
      origin: "Shanghai, China",
      destination: "Long Beach, USA",
      pol: "CNSHA",
      pod: "USLGB",
      eta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Mock ETA 3 days from now
      etd: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Mock ETD 5 days ago
      lastLocation: "Pacific Ocean",
      timeline: [
        {
          location: "Shanghai, China",
          events: mockEvents.slice(0, 2),
        },
        {
          location: "Pacific Ocean",
          events: mockEvents.slice(2, 3),
        },
        {
          location: "Long Beach, USA",
          events: mockEvents.slice(3, 4),
        },
      ],
      documents: [
        {
          type: "Bill of Lading",
          url: "/placeholder.svg?height=200&width=150",
          description: "Original Bill of Lading",
        },
        {
          type: "Commercial Invoice",
          url: "/placeholder.svg?height=200&width=150",
          description: "Commercial Invoice for customs",
        },
      ],
      details: {
        packages: "20 cartons",
        dimensions: "20 CBM",
        specialInstructions: "Handle with care",
        shipmentType: options?.shipmentType || "ocean",
        freeDaysBeforeDemurrage: 7, // Mock free days
      },
    }

    return {
      success: true,
      data: mockData,
      source: "TrackShip Mock API",
      isLiveData: false, // Indicate this is mock data
    }
  }
}
