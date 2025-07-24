"use client"

// ─────────────────────────────────────────────────────────────────────────
//  MOCK DATA
//  (Replace with real API integration when available)
// ─────────────────────────────────────────────────────────────────────────
const mockClientOrders = [
  {
    id: "ORD-2024-001",
    poNumber: "PO-ABC-001",
    status: "In Progress",
    cargoStatus: "in-transit",
    freightType: "Sea Freight",
    totalValue: 25000,
    createdAt: "2024-01-15",
    estimatedDelivery: "2024-02-15",
    supplier: "Global Electronics Ltd",
    destination: "Cape Town, South Africa",
    vesselName: "MSC Pamela",
    etaAtPort: "2024-02-10",
  },
  {
    id: "ORD-2024-002",
    poNumber: "PO-ABC-002",
    status: "Completed",
    cargoStatus: "delivered",
    freightType: "Air Freight",
    totalValue: 15000,
    createdAt: "2024-01-10",
    estimatedDelivery: "2024-01-25",
    supplier: "Tech Components Inc",
    destination: "Johannesburg, South Africa",
    vesselName: "N/A",
    etaAtPort: "2024-01-20",
  },
  {
    id: "ORD-2024-003",
    poNumber: "PO-ABC-003",
    status: "Pending",
    cargoStatus: "at-origin",
    freightType: "Sea Freight",
    totalValue: 35000,
    createdAt: "2024-01-20",
    estimatedDelivery: "2024-03-01",
    supplier: "Industrial Supplies Co",
    destination: "Durban, South Africa",
    vesselName: "Maersk Seletar",
    etaAtPort: "2024-02-25",
  },
]

// ─────────────────────────────────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────────────────────────────────
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "in progress":
      return "bg-blue-100 text-blue-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getCargoStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800"
    case "in-transit":
      return "bg-blue-100 text-blue-800"
    case "at-origin":
      return "bg-orange-100 text-orange-800"
    case "at-destination":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const formatCargoStatus = (status: string) =>
  status
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")

// ─────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
