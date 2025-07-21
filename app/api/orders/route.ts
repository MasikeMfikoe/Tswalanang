import { NextResponse } from "next/server"

// Mock database for orders
const orders = [
  {
    id: "ORD001",
    customerName: "Acme Corp",
    status: "Pending",
    totalValue: 1200.5,
    currency: "USD",
    createdAt: "2024-07-15T10:00:00Z",
    lastUpdate: "2024-07-15T10:00:00Z",
    items: [{ name: "Electronics", quantity: 10, value: 1200.5 }],
    shippingAddress: "123 Main St, Anytown, USA",
    billingAddress: "123 Main St, Anytown, USA",
    paymentStatus: "Paid",
    deliveryDate: "2024-07-25",
    trackingNumber: "TRK001",
    carrier: "FedEx",
    notes: "Handle with care.",
    cost: 800,
    price: 1200.5,
    profit: 400.5,
  },
  {
    id: "ORD002",
    customerName: "Global Logistics",
    status: "In Transit",
    totalValue: 5000.0,
    currency: "USD",
    createdAt: "2024-07-10T14:30:00Z",
    lastUpdate: "2024-07-18T09:00:00Z",
    items: [{ name: "Machinery", quantity: 1, value: 5000.0 }],
    shippingAddress: "456 Oak Ave, Otherville, USA",
    billingAddress: "456 Oak Ave, Otherville, USA",
    paymentStatus: "Paid",
    deliveryDate: "2024-07-28",
    trackingNumber: "TRK002",
    carrier: "DHL",
    notes: "Requires forklift.",
    cost: 3500,
    price: 5000,
    profit: 1500,
  },
  {
    id: "ORD003",
    customerName: "Tech Solutions",
    status: "Delivered",
    totalValue: 350.75,
    currency: "USD",
    createdAt: "2024-07-01T08:00:00Z",
    lastUpdate: "2024-07-05T16:00:00Z",
    items: [{ name: "Software Licenses", quantity: 5, value: 350.75 }],
    shippingAddress: "789 Pine Ln, Somewhere, USA",
    billingAddress: "789 Pine Ln, Somewhere, USA",
    paymentStatus: "Paid",
    deliveryDate: "2024-07-05",
    trackingNumber: "TRK003",
    carrier: "UPS",
    notes: "Digital delivery.",
    cost: 200,
    price: 350.75,
    profit: 150.75,
  },
  {
    id: "ORD004",
    customerName: "Acme Corp",
    status: "Pending",
    totalValue: 800.0,
    currency: "USD",
    createdAt: "2024-07-16T11:00:00Z",
    lastUpdate: "2024-07-16T11:00:00Z",
    items: [{ name: "Office Supplies", quantity: 20, value: 800.0 }],
    shippingAddress: "123 Main St, Anytown, USA",
    billingAddress: "123 Main St, Anytown, USA",
    paymentStatus: "Pending",
    deliveryDate: "2024-07-26",
    trackingNumber: "TRK004",
    carrier: "FedEx",
    notes: "Standard delivery.",
    cost: 500,
    price: 800,
    profit: 300,
  },
  {
    id: "ORD005",
    customerName: "Global Logistics",
    status: "Cancelled",
    totalValue: 150.0,
    currency: "USD",
    createdAt: "2024-07-08T09:00:00Z",
    lastUpdate: "2024-07-09T10:00:00Z",
    items: [{ name: "Small Parts", quantity: 50, value: 150.0 }],
    shippingAddress: "456 Oak Ave, Otherville, USA",
    billingAddress: "456 Oak Ave, Otherville, USA",
    paymentStatus: "Refunded",
    deliveryDate: "2024-07-15",
    trackingNumber: "TRK005",
    carrier: "UPS",
    notes: "Customer cancelled.",
    cost: 100,
    price: 150,
    profit: 50,
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const customerName = searchParams.get("customerName")
  const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
  const offset = Number.parseInt(searchParams.get("offset") || "0", 10)

  let filteredOrders = orders

  if (status) {
    filteredOrders = filteredOrders.filter((order) => order.status.toLowerCase() === status.toLowerCase())
  }

  if (customerName) {
    filteredOrders = filteredOrders.filter((order) =>
      order.customerName.toLowerCase().includes(customerName.toLowerCase()),
    )
  }

  const paginatedOrders = filteredOrders.slice(offset, offset + limit)

  return NextResponse.json({
    data: paginatedOrders,
    total: filteredOrders.length,
    limit,
    offset,
  })
}

export async function POST(request: Request) {
  const newOrder = await request.json()
  newOrder.id = `ORD${String(orders.length + 1).padStart(3, "0")}`
  newOrder.createdAt = new Date().toISOString()
  newOrder.lastUpdate = newOrder.createdAt
  orders.push(newOrder)
  return NextResponse.json(newOrder, { status: 201 })
}
