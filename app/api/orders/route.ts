import { NextResponse } from "next/server"
import { AuditLogger } from "@/lib/audit-logger"
import { supabase } from "@/lib/supabase"

// Mock data (Replace with DB calls in real use)
const customers = [
  { id: "1", name: "Acme Corp", primaryContact: "John Doe", secondaryContact: "Jane Smith", totalOrders: 15 },
  {
    id: "2",
    name: "Global Traders",
    primaryContact: "Alice Johnson",
    secondaryContact: "Bob Williams",
    totalOrders: 8,
  },
  {
    id: "3",
    name: "Tech Innovators",
    primaryContact: "Charlie Brown",
    secondaryContact: "Diana Davis",
    totalOrders: 12,
  },
]

const orders = [
  { id: "1", poNumber: "PO001", supplier: "Supplier A", importer: "Acme Corp", status: "In Progress" },
  { id: "2", poNumber: "PO002", supplier: "Supplier B", importer: "Global Traders", status: "Completed" },
  { id: "3", poNumber: "PO003", supplier: "Supplier C", importer: "Tech Innovators", status: "Pending" },
]

// Helper function to get user ID from request headers or session
const getUserIdFromRequest = async (request: Request): Promise<string | null> => {
  try {
    // Try to get user from Supabase session
    const authHeader = request.headers.get("authorization")
    if (authHeader) {
      // Extract token and validate with Supabase
      const token = authHeader.replace("Bearer ", "")
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token)
      if (!error && user) {
        return user.id
      }
    }

    // Fallback: try to get from custom header (if set by client)
    const userIdHeader = request.headers.get("x-user-id")
    if (userIdHeader) {
      return userIdHeader
    }

    return null
  } catch (error) {
    console.error("Error getting user ID from request:", error)
    return null
  }
}

// Handle GET Requests
export async function GET(request: Request) {
  const url = new URL(request.url)
  const customerId = url.searchParams.get("customerId")

  if (customerId) {
    const customer = customers.find((c) => c.id === customerId)
    if (customer) {
      const customerOrders = orders.filter((order) => order.importer === customer.name)
      return NextResponse.json({ customer, orders: customerOrders })
    }
    return NextResponse.json({ error: "Customer not found" }, { status: 404 })
  }

  return NextResponse.json(orders)
}

// Handle Order Creation (POST)
export async function POST(request: Request) {
  const body = await request.json()
  const userId = await getUserIdFromRequest(request)

  const newOrder = {
    id: String(orders.length + 1),
    ...body,
    createdAt: new Date().toISOString(),
  }
  orders.push(newOrder)

  // Log the audit entry
  if (userId) {
    await AuditLogger.logOrderCreated(userId, newOrder.id, {
      poNumber: body.poNumber,
      supplier: body.supplier,
      importer: body.importer,
      status: body.status || "Pending",
    })
  }

  return NextResponse.json(newOrder, { status: 201 })
}

// Handle Order Updates (PUT)
export async function PUT(request: Request) {
  const body = await request.json()
  const userId = await getUserIdFromRequest(request)

  const index = orders.findIndex((order) => order.id === body.id)
  if (index !== -1) {
    const oldOrder = { ...orders[index] }
    orders[index] = { ...orders[index], ...body, updatedAt: new Date().toISOString() }

    // Log the audit entry
    if (userId) {
      await AuditLogger.logOrderUpdated(userId, body.id, oldOrder, body)
    }

    return NextResponse.json(orders[index])
  }
  return NextResponse.json({ error: "Order not found" }, { status: 404 })
}
