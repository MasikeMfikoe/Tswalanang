import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const status = searchParams.get("status")
  const customerId = searchParams.get("customerId")
  const query = searchParams.get("query") // For search functionality

  // Mock data for demonstration
  const allOrders = [
    {
      id: "ORD001",
      customerName: "Acme Corp",
      status: "Pending",
      origin: "Shanghai",
      destination: "New York",
      eta: "2024-08-01",
      value: 15000,
      currency: "USD",
    },
    {
      id: "ORD002",
      customerName: "Globex Inc",
      status: "In Transit",
      origin: "Rotterdam",
      destination: "Singapore",
      eta: "2024-07-25",
      value: 22000,
      currency: "USD",
    },
    {
      id: "ORD003",
      customerName: "Acme Corp",
      status: "Delivered",
      origin: "New York",
      destination: "London",
      eta: "2024-07-10",
      value: 8000,
      currency: "USD",
    },
    {
      id: "ORD004",
      customerName: "Wayne Enterprises",
      status: "Pending",
      origin: "Tokyo",
      destination: "Sydney",
      eta: "2024-08-15",
      value: 30000,
      currency: "USD",
    },
    {
      id: "ORD005",
      customerName: "Globex Inc",
      status: "In Transit",
      origin: "Singapore",
      destination: "Dubai",
      eta: "2024-07-28",
      value: 18000,
      currency: "USD",
    },
    {
      id: "ORD006",
      customerName: "Stark Industries",
      status: "Delivered",
      origin: "London",
      destination: "Paris",
      eta: "2024-07-05",
      value: 5000,
      currency: "USD",
    },
    {
      id: "ORD007",
      customerName: "Acme Corp",
      status: "In Transit",
      origin: "Hamburg",
      destination: "Boston",
      eta: "2024-08-05",
      value: 17500,
      currency: "USD",
    },
    {
      id: "ORD008",
      customerName: "Wayne Enterprises",
      status: "Pending",
      origin: "Seoul",
      destination: "Los Angeles",
      eta: "2024-08-20",
      value: 25000,
      currency: "USD",
    },
    {
      id: "ORD009",
      customerName: "Stark Industries",
      status: "In Transit",
      origin: "Dubai",
      destination: "Frankfurt",
      eta: "2024-07-30",
      value: 12000,
      currency: "USD",
    },
    {
      id: "ORD010",
      customerName: "Globex Inc",
      status: "Delivered",
      origin: "Sydney",
      destination: "Shanghai",
      eta: "2024-07-12",
      value: 9500,
      currency: "USD",
    },
    {
      id: "ORD011",
      customerName: "Acme Corp",
      status: "Pending",
      origin: "Mumbai",
      destination: "Rotterdam",
      eta: "2024-08-10",
      value: 19000,
      currency: "USD",
    },
    {
      id: "ORD012",
      customerName: "Wayne Enterprises",
      status: "In Transit",
      origin: "Los Angeles",
      destination: "Tokyo",
      eta: "2024-08-25",
      value: 28000,
      currency: "USD",
    },
    {
      id: "ORD013",
      customerName: "Stark Industries",
      status: "Pending",
      origin: "Paris",
      destination: "Madrid",
      eta: "2024-08-03",
      value: 7000,
      currency: "USD",
    },
    {
      id: "ORD014",
      customerName: "Globex Inc",
      status: "Delivered",
      origin: "Frankfurt",
      destination: "London",
      eta: "2024-07-18",
      value: 11000,
      currency: "USD",
    },
    {
      id: "ORD015",
      customerName: "Acme Corp",
      status: "In Transit",
      origin: "Boston",
      destination: "Hamburg",
      eta: "2024-08-08",
      value: 16000,
      currency: "USD",
    },
  ]

  let filteredOrders = allOrders

  if (status) {
    filteredOrders = filteredOrders.filter((order) => order.status.toLowerCase() === status.toLowerCase())
  }

  if (customerId) {
    // In a real app, you'd map customerId to customerName or filter by actual customer ID
    filteredOrders = filteredOrders.filter((order) =>
      order.customerName.toLowerCase().includes(customerId.toLowerCase()),
    )
  }

  if (query) {
    const lowerCaseQuery = query.toLowerCase()
    filteredOrders = filteredOrders.filter(
      (order) =>
        order.id.toLowerCase().includes(lowerCaseQuery) ||
        order.customerName.toLowerCase().includes(lowerCaseQuery) ||
        order.origin.toLowerCase().includes(lowerCaseQuery) ||
        order.destination.toLowerCase().includes(lowerCaseQuery),
    )
  }

  const total = filteredOrders.length
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  return NextResponse.json({
    data: paginatedOrders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}

export async function POST(request: Request) {
  const newOrder = await request.json()
  // In a real application, save the new order to your database
  console.log("New order created:", newOrder)
  return NextResponse.json(
    { id: `ORD${Math.random().toString(36).substr(2, 5).toUpperCase()}`, ...newOrder },
    { status: 201 },
  )
}
