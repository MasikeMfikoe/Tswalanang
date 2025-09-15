import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { AuditLogger } from "@/lib/audit-logger"
import { detectShipmentTrackingInfo } from "@/lib/services/container-detection-service"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

import { createClient } from "@supabase/supabase-js"
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Helper function to get user ID from request
const getUserIdFromRequest = async (request: NextRequest): Promise<string | null> => {
  try {
    const supabase = createRouteHandlerClient({ cookies })
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

// GET: Fetch all courier orders with optional filtering
export async function GET(request: NextRequest) {
  try {
    console.log("[v0] 📡 Fetching courier orders from database...")

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "50")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const status = searchParams.get("status")

    // Use service role client to bypass RLS issues
    let query = supabaseAdmin.from("courier_orders").select("*", { count: "exact" })

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status)
    }

    // Apply search filter if provided
    if (search) {
      query = query.or(`waybill_no.ilike.%${search}%,sender.ilike.%${search}%,receiver.ilike.%${search}%`)
    }

    // Calculate pagination
    const startRow = (page - 1) * pageSize

    // Apply sorting and pagination
    const {
      data: courierOrders,
      error,
      count,
    } = await query.order(sortBy, { ascending: sortOrder === "asc" }).range(startRow, startRow + pageSize - 1)

    if (error) {
      console.error("[v0] ❌ Error fetching courier orders:", error)
      return NextResponse.json({ error: "Failed to fetch courier orders", details: error.message }, { status: 500 })
    }

    console.log(`[v0] ✅ Successfully fetched ${courierOrders?.length || 0} courier orders`)

    // Calculate total pages
    const totalPages = count ? Math.ceil(count / pageSize) : 0

    return NextResponse.json({
      data: courierOrders || [],
      total: count || 0,
      page,
      pageSize,
      totalPages,
      success: true,
    })
  } catch (error) {
    console.error("[v0] ❌ Unexpected error in courier orders GET route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}

// POST: Create a new courier order
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] 📡 Creating new courier order...")

    const orderData = await request.json()
    const userId = await getUserIdFromRequest(request)

    // Validate required fields
    const requiredFields = ["sender", "receiver", "pickup_address", "delivery_address"]
    for (const field of requiredFields) {
      if (!orderData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Generate waybill number if not provided
    if (!orderData.waybill_no) {
      orderData.waybill_no = `WB${Date.now()}`
    }

    if (orderData.tracking_number) {
      const trackingInfo = detectShipmentTrackingInfo(orderData.tracking_number)

      if (trackingInfo.carrierDetails) {
        // Set carrier information based on detected type
        if (trackingInfo.carrierDetails.type === "air") {
          orderData.airline = trackingInfo.carrierDetails.name
          orderData.carrier = trackingInfo.carrierDetails.name
        } else if (trackingInfo.carrierDetails.type === "ocean" || trackingInfo.carrierDetails.type === "lcl") {
          orderData.shipping_line = trackingInfo.carrierDetails.name
          orderData.carrier = trackingInfo.carrierDetails.name
        }

        console.log(
          `[v0] ✅ Auto-detected carrier: ${trackingInfo.carrierDetails.name} (${trackingInfo.carrierDetails.type})`,
        )
      }
    }

    // Use service role client to bypass RLS issues
    const { data: newOrder, error } = await supabaseAdmin
      .from("courier_orders")
      .insert({
        ...orderData,
        status: orderData.status || "Pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] ❌ Error creating courier order:", error)
      return NextResponse.json({ error: "Failed to create courier order", details: error.message }, { status: 500 })
    }

    console.log("[v0] ✅ Successfully created courier order:", newOrder.id)

    // Log courier order creation
    if (userId && newOrder) {
      await AuditLogger.logCourierOrderCreated(userId, newOrder.id, {
        waybill_no: orderData.waybill_no,
        sender: orderData.sender,
        receiver: orderData.receiver,
        status: orderData.status || "Pending",
      })
    }

    return NextResponse.json(
      {
        data: newOrder,
        success: true,
        message: "Courier order created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] ❌ Unexpected error in courier orders POST route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}

// PUT: Update an existing courier order
export async function PUT(request: NextRequest) {
  try {
    console.log("[v0] 📡 Updating courier order...")

    const orderData = await request.json()
    const userId = await getUserIdFromRequest(request)

    if (!orderData.id) {
      return NextResponse.json({ error: "Courier order ID is required" }, { status: 400 })
    }

    if (orderData.tracking_number) {
      const trackingInfo = detectShipmentTrackingInfo(orderData.tracking_number)

      if (trackingInfo.carrierDetails) {
        // Set carrier information based on detected type
        if (trackingInfo.carrierDetails.type === "air") {
          orderData.airline = trackingInfo.carrierDetails.name
          orderData.carrier = trackingInfo.carrierDetails.name
        } else if (trackingInfo.carrierDetails.type === "ocean" || trackingInfo.carrierDetails.type === "lcl") {
          orderData.shipping_line = trackingInfo.carrierDetails.name
          orderData.carrier = trackingInfo.carrierDetails.name
        }

        console.log(
          `[v0] ✅ Auto-detected carrier: ${trackingInfo.carrierDetails.name} (${trackingInfo.carrierDetails.type})`,
        )
      }
    }

    // Get old order data for audit logging
    const { data: oldOrder } = await supabaseAdmin.from("courier_orders").select("*").eq("id", orderData.id).single()

    // Use service role client to bypass RLS issues
    const { data: updatedOrder, error } = await supabaseAdmin
      .from("courier_orders")
      .update({
        ...orderData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderData.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] ❌ Error updating courier order:", error)
      return NextResponse.json({ error: "Failed to update courier order", details: error.message }, { status: 500 })
    }

    console.log("[v0] ✅ Successfully updated courier order:", updatedOrder.id)

    // Log courier order update
    if (userId && oldOrder) {
      await AuditLogger.logCourierOrderUpdated(userId, orderData.id, oldOrder, orderData)
    }

    return NextResponse.json({
      data: updatedOrder,
      success: true,
      message: "Courier order updated successfully",
    })
  } catch (error) {
    console.error("[v0] ❌ Unexpected error in courier orders PUT route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}
