import type { ShipmentType, TrackingResult, TrackingData } from "@/types/tracking"

// Mock data for various tracking numbers
const mockTrackingData: { [key: string]: TrackingData } = {
  MAEU1234567: {
    shipmentNumber: "MAEU1234567",
    status: "In Transit",
    carrier: "Maersk",
    containerNumber: "MAEU1234567",
    containerType: "40' HC",
    weight: "20,000 kg",
    origin: "Shanghai, China",
    destination: "Rotterdam, Netherlands",
    pol: "CNSHA",
    pod: "NLRTM",
    eta: "2025-08-15",
    etd: "2025-07-20",
    lastLocation: "Suez Canal",
    timeline: [
      {
        location: "Shanghai, China",
        terminal: "Yangshan Port",
        events: [
          {
            timestamp: "2025-07-18T10:00:00Z",
            date: "2025-07-18",
            time: "10:00",
            location: "Shanghai, China",
            description: "Cargo received at origin terminal",
            status: "Cargo Received",
            type: "cargo-received",
          },
          {
            timestamp: "2025-07-20T14:30:00Z",
            date: "2025-07-20",
            time: "14:30",
            location: "Shanghai, China",
            description: "Vessel departed from Shanghai",
            status: "Departed",
            vessel: "Maersk Triple E",
            voyage: "V123",
            type: "vessel-departure",
          },
        ],
      },
      {
        location: "Suez Canal",
        events: [
          {
            timestamp: "2025-08-05T08:00:00Z",
            date: "2025-08-05",
            time: "08:00",
            location: "Suez Canal",
            description: "Passed through Suez Canal",
            status: "In Transit",
            type: "event",
          },
        ],
      },
      {
        location: "Rotterdam, Netherlands",
        terminal: "APM Terminals Maasvlakte II",
        events: [
          {
            timestamp: "2025-08-15T06:00:00Z",
            date: "2025-08-15",
            time: "06:00",
            location: "Rotterdam, Netherlands",
            description: "Vessel arrived at destination port",
            status: "Arrived",
            vessel: "Maersk Triple E",
            voyage: "V123",
            type: "vessel-arrival",
          },
        ],
      },
    ],
    documents: [
      { type: "Bill of Lading", url: "/placeholder.svg?height=100&width=100", description: "Original BL" },
      { type: "Commercial Invoice", url: "/placeholder.svg?height=100&width=100", description: "Invoice for customs" },
    ],
    details: {
      packages: "200 cartons",
      dimensions: "12m x 2.3m x 2.7m",
      shipmentType: "ocean",
      freeDaysBeforeDemurrage: 7,
    },
  },
  MSCU9876543: {
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
  },
  MOCKTRACK123: {
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
  },
}

export class MockTrackingService {
  async trackShipment(
    trackingNumber: string,
    options?: { shipmentType?: ShipmentType; carrierHint?: string },
  ): Promise<TrackingResult> {
    const data = mockTrackingData[trackingNumber.toUpperCase()]

    if (data) {
      return {
        success: true,
        data: data,
        source: "MockProvider",
        isLiveData: false,
      }
    } else {
      return {
        success: false,
        error: "No mock tracking information found for this number.",
        source: "MockProvider",
        isLiveData: false,
      }
    }
  }
}
