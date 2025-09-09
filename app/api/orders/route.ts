import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import { AuditLogger } from "@/lib/audit-logger"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing required Supabase environment variables")
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Helper function to get user ID from request
const getUserIdFromRequest = async (request: NextRequest): Promise<string | null> => {
  try {
    const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !anonKey) return null

    const supabase = createClient(supabaseUrl, anonKey)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (!error && user) {
      return user.id
    }

    return null
  } catch (error) {
    console.error("Error getting user ID from request:", error)
    return null
  }
}

// GET: Fetch all orders with optional filtering
export async function GET(request: NextRequest) {
  try {
    console.log("[v0] 📡 Fetching orders from database...")

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "50")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const customerId = searchParams.get("customerId")

    let query = supabaseAdmin.from("orders").select("*", { count: "exact" })

    // Apply customer filter if provided
    if (customerId) {
      query = query.eq("customer_id", customerId)
    }

    // Apply search filter if provided
    if (search) {
      query = query.or(`po_number.ilike.%${search}%,supplier.ilike.%${search}%,importer.ilike.%${search}%`)
    }

    // Calculate pagination
    const startRow = (page - 1) * pageSize

    // Apply sorting and pagination
    const {
      data: orders,
      error,
      count,
    } = await query.order(sortBy, { ascending: sortOrder === "asc" }).range(startRow, startRow + pageSize - 1)

    if (error) {
      console.error("[v0] ❌ Error fetching orders:", error)
      return NextResponse.json({ error: "Failed to fetch orders", details: error.message }, { status: 500 })
    }

    console.log(`[v0] ✅ Successfully fetched ${orders?.length || 0} orders`)

    // Calculate total pages
    const totalPages = count ? Math.ceil(count / pageSize) : 0

    return NextResponse.json({
      data: orders || [],
      total: count || 0,
      page,
      pageSize,
      totalPages,
      success: true,
    })
  } catch (error) {
    console.error("[v0] ❌ Unexpected error in orders GET route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}

// POST: Create a new order
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] 📡 Creating new order...")

    const orderData = await request.json()
    const userId = await getUserIdFromRequest(request)

    // Validate required fields
    const requiredFields = ["po_number", "supplier", "importer"]
    for (const field of requiredFields) {
      if (!orderData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const { data: newOrder, error } = await supabaseAdmin
      .from("orders")
      .insert({
        ...orderData,
        status: orderData.status || "Pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] ❌ Error creating order:", error)
      return NextResponse.json({ error: "Failed to create order", details: error.message }, { status: 500 })
    }

    console.log("[v0] ✅ Successfully created order:", newOrder.id)

    // Log order creation
    if (userId && newOrder) {
      await AuditLogger.logOrderCreated(userId, newOrder.id, {
        po_number: orderData.po_number,
        supplier: orderData.supplier,
        importer: orderData.importer,
        status: orderData.status || "Pending",
      })
    }

    return NextResponse.json(
      {
        data: newOrder,
        success: true,
        message: "Order created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] ❌ Unexpected error in orders POST route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}

// PUT: Update an existing order
export async function PUT(request: NextRequest) {
  try {
    console.log("[v0] 📡 Updating order...")

    const orderData = await request.json()
    const userId = await getUserIdFromRequest(request)

    if (!orderData.id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Get old order data for audit logging
    const { data: oldOrder } = await supabaseAdmin.from("orders").select("*").eq("id", orderData.id).single()

    const { data: updatedOrder, error } = await supabaseAdmin
      .from("orders")
      .update({
        ...orderData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderData.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] ❌ Error updating order:", error)
      return NextResponse.json({ error: "Failed to update order", details: error.message }, { status: 500 })
    }

    console.log("[v0] ✅ Successfully updated order:", updatedOrder.id)

    // Log order update
    if (userId && oldOrder) {
      await AuditLogger.logOrderUpdated(userId, orderData.id, oldOrder, orderData)
    }

    return NextResponse.json({
      data: updatedOrder,
      success: true,
      message: "Order updated successfully",
    })
  } catch (error) {
    console.error("[v0] ❌ Unexpected error in orders PUT route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}
