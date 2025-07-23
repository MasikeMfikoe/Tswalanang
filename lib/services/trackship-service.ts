import type { ShipmentType, TrackingResult, TrackingData } from "@/types/tracking"

// Mock data for TrackShip
const TRACKSHIP_MOCK_DATA: { [key: string]: TrackingData } = {
  MOCKTRACK123: {
    shipmentNumber: "MOCKTRACK123",
    status: "In Transit",
    carrier: "TrackShip Mock",
    containerNumber: "TSU4567890",
    containerType: "20' GP",
    weight: "10,000 KGS",
    origin: "Port of Mock, Mockland",
    destination: "Mock City, Mockland",
    pol: "MOCKP",
    pod: "MOCKC",
    eta: "2025-08-01",
    etd: "2025-07-20",
    lastLocation: "At Sea",
    timeline: [
      {
        location: "Port of Mock, Mockland",
        events: [
          {
            timestamp: "2025-07-19T10:00:00Z",
            date: "2025-07-19",
            time: "10:00",
            status: "Cargo Received",
            location: "Port of Mock, Mockland",
            description: "Shipment received at origin warehouse.",
            type: "cargo-received",
            mode: "ROAD",
          },
          {
            timestamp: "2025-07-20T14:00:00Z",
            date: "2025-07-20",
            time: "14:00",
            status: "Departed Origin",
            location: "Port of Mock, Mockland",
            description: "Shipment departed from origin port.",
            type: "vessel-departure",
            mode: "OCEAN",
            vessel: "Mock Vessel 1",
            voyage: "MV101",
          },
        ],
      },
      {
        location: "At Sea",
        events: [
          {
            timestamp: "2025-07-25T08:00:00Z",
            date: "2025-07-25",
            time: "08:00",
            status: "In Transit",
            location: "Mid-Ocean",
            description: "Shipment is currently at sea.",
            type: "event",
            mode: "OCEAN",
            vessel: "Mock Vessel 1",
            voyage: "MV101",
          },
        ],
      },
      {
        location: "Mock City, Mockland",
        events: [
          {
            timestamp: "2025-08-01T09:00:00Z",
            date: "2025-08-01",
            time: "09:00",
            status: "Estimated Arrival",
            location: "Mock City, Mockland",
            description: "Estimated arrival at destination port.",
            type: "vessel-arrival",
            mode: "OCEAN",
            vessel: "Mock Vessel 1",
            voyage: "MV101",
          },
        ],
      },
    ],
    documents: [
      {
        type: "Commercial Invoice",
        url: "/placeholder.svg?height=100&width=100",
        description: "Invoice for goods",
      },
    ],
    details: {
      shipmentType: "ocean",
      packages: "50 boxes",
      dimensions: "25 CBM",
      specialInstructions: "Handle with care",
      freeDaysBeforeDemurrage: 10,
    },
  },
  MOCKAIR456: {
    shipmentNumber: "MOCKAIR456",
    status: "Delivered",
    carrier: "TrackShip Mock Air",
    containerNumber: "AWB7890123",
    containerType: "Air Cargo",
    weight: "500 KGS",
    origin: "London, UK",
    destination: "Dubai, UAE",
    pol: "LHR",
    pod: "DXB",
    eta: "2025-07-28",
    etd: "2025-07-26",
    lastLocation: "Dubai, UAE",
    timeline: [
      {
        location: "London, UK",
        events: [
          {
            timestamp: "2025-07-25T18:00:00Z",
            date: "2025-07-25",
            time: "18:00",
            status: "Cargo Received",
            location: "London Heathrow Airport",
            description: "Cargo received at airport warehouse.",
            type: "cargo-received",
            mode: "AIR",
          },
          {
            timestamp: "2025-07-26T08:00:00Z",
            date: "2025-07-26",
            time: "08:00",
            status: "Departed Origin",
            location: "London Heathrow Airport",
            description: "Flight departed from London.",
            type: "plane-takeoff",
            mode: "AIR",
            flightNumber: "BA123",
          },
        ],
      },
      {
        location: "Dubai, UAE",
        events: [
          {
            timestamp: "2025-07-27T23:00:00Z",
            date: "2025-07-27",
            time: "23:00",
            status: "Arrived Destination",
            location: "Dubai International Airport",
            description: "Flight landed at Dubai.",
            type: "plane-landing",
            mode: "AIR",
            flightNumber: "BA123",
          },
          {
            timestamp: "2025-07-28T10:00:00Z",
            date: "2025-07-28",
            time: "10:00",
            status: "Delivered",
            location: "Customer Site, Dubai",
            description: "Shipment delivered to consignee.",
            type: "event",
            mode: "ROAD",
          },
        ],
      },
    ],
    documents: [],
    details: {
      shipmentType: "air",
      packages: "5 crates",
      dimensions: "2 CBM",
      freeDaysBeforeDemurrage: 0,
    },
  },
}

export class TrackShipService {
  async trackShipment(
    trackingNumber: string,
    options?: { shipmentType?: ShipmentType; carrierHint?: string },
  ): Promise<TrackingResult> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 700))

    const data = TRACKSHIP_MOCK_DATA[trackingNumber]
    if (data) {
      return { success: true, data, source: "TrackShip Mock API", isLiveData: false }
    } else {
      return {
        success: false,
        error: "No tracking information found from TrackShip Mock.",
        source: "TrackShip Mock API",
        isLiveData: false,
      }
    }
  }
}

// ---------------------------------------------------------------------------
//  Compatibility re-exports - other code still expects these names
// --------------------------------------------------------------------------- // named export
export default TrackShipService // default export
