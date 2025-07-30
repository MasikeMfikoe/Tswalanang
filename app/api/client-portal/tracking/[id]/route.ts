import { type NextRequest, NextResponse } from "next/server"

// Mock data for tracking details
const mockTrackingData = {
  "ORD-2024-001": {
    orderId: "ORD-2024-001",
    poNumber: "PO-ABC-001",
    currentStatus: "In Transit",
    lastUpdated: "2024-07-29T14:30:00Z",
    origin: "Shanghai, China",
    destination: "Cape Town, South Africa",
    estimatedDelivery: "2024-08-15T00:00:00Z",
    carrier: "MSC",
    trackingNumber: "MRSU0547355",
    events: [
      {
        timestamp: "2024-07-29T14:30:00Z",
        location: "Port of Singapore",
        status: "Departed",
        description: "Vessel departed from Singapore.",
      },
      {
        timestamp: "2024-07-25T09:00:00Z",
        location: "Port of Shanghai",
        status: "Loaded on Vessel",
        description: "Container loaded onto vessel MSC Pamela.",
      },
      {
        timestamp: "2024-07-24T16:00:00Z",
        location: "Shanghai Terminal",
        status: "Arrived at Port",
        description: "Shipment arrived at origin port terminal.",
      },
      {
        timestamp: "2024-07-23T10:00:00Z",
        location: "Supplier Warehouse, Shanghai",
        status: "Picked Up",
        description: "Shipment picked up from supplier.",
      },
    ],
  },
  "ORD-2024-002": {
    orderId: "ORD-2024-002",
    poNumber: "PO-ABC-002",
    currentStatus: "Delivered",
    lastUpdated: "2024-01-25T10:00:00Z",
    origin: "Shenzhen, China",
    destination: "Johannesburg, South Africa",
    estimatedDelivery: "2024-01-25T00:00:00Z",
    carrier: "DHL",
    trackingNumber: "AIRTRACK123",
    events: [
      {
        timestamp: "2024-01-25T10:00:00Z",
        location: "Johannesburg, South Africa",
        status: "Delivered",
        description: "Shipment delivered to receiver.",
      },
      {
        timestamp: "2024-01-24T08:00:00Z",
        location: "Johannesburg Airport",
        status: "Arrived at Destination",
        description: "Shipment arrived at destination airport.",
      },
      {
        timestamp: "2024-01-20T15:00:00Z",
        location: "Shenzhen Airport",
        status: "Departed",
        description: "Shipment departed from origin airport.",
      },
    ],
  },
  "ORD-2024-003": {
    orderId: "ORD-2024-003",
    poNumber: "PO-ABC-003",
    currentStatus: "At Origin",
    lastUpdated: "2024-01-25T10:00:00Z",
    origin: "Busan, South Korea",
    destination: "Durban, South Africa",
    estimatedDelivery: "2024-03-01T00:00:00Z",
    carrier: "Maersk",
    trackingNumber: "MAEU9876543",
    events: [
      {
        timestamp: "2024-01-25T10:00:00Z",
        location: "Busan Port Terminal",
        status: "Arrived at Port",
        description: "Shipment arrived at origin port terminal.",
      },
      {
        timestamp: "2024-01-24T14:00:00Z",
        location: "Supplier Warehouse, Busan",
        status: "Picked Up",
        description: "Shipment picked up from supplier.",
      },
    ],
  },
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id
    const { searchParams } = new URL(request.url)
    const trackingNumber = searchParams.get("trackingNumber")

    // In a real application, you would fetch this data from your database
    // or an external tracking API using the orderId or trackingNumber.
    // For now, we'll use mock data.

    const data = mockTrackingData[orderId as keyof typeof mockTrackingData]

    if (data) {
      return NextResponse.json({ success: true, data })
    } else {
      return NextResponse.json({ success: false, error: "Tracking data not found" }, { status: 404 })
    }
  } catch (error: any) {
    console.error("Error fetching tracking details:", error)
    return NextResponse.json({ success: false, error: `Internal server error: ${error.message}` }, { status: 500 })
  }
}
