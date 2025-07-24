import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { Order } from "@/types/models"

// GET: Fetch all orders with optional filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const customerId = searchParams.get("customerId") || ""

    const offset = (page - 1) * pageSize

    let query = supabase.from("orders").select("*, documents:documents(*)", { count: "exact" })

    if (search) {
      query = query.or(
        `po_number.ilike.%${search}%,customer_name.ilike.%${search}%,origin_address->>city.ilike.%${search}%,destination_address->>city.ilike.%${search}%`,
      )
    }

    if (status) {
      query = query.eq("status", status)
    }

    if (customerId) {
      query = query.eq("customer_id", customerId)
    }

    const {
      data: orders,
      error,
      count,
    } = await query.range(offset, offset + pageSize - 1).order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({ error: "Failed to fetch orders", details: error.message }, { status: 500 })
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 0

    return NextResponse.json({
      data: orders,
      total: count,
      page,
      pageSize,
      totalPages,
      success: true,
    })
  } catch (error) {
    console.error("Error in GET /api/orders:", error)
    return NextResponse.json({ error: "Internal server error", details: (error as Error).message }, { status: 500 })
  }
}

// POST: Create a new order
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const newOrder: Partial<Order> = await request.json()

    // Ensure required fields are present
    if (
      !newOrder.customer_id ||
      !newOrder.po_number ||
      !newOrder.origin_address ||
      !newOrder.destination_address ||
      !newOrder.total_value ||
      !newOrder.currency
    ) {
      return NextResponse.json({ error: "Missing required order fields" }, { status: 400 })
    }

    const { data, error } = await supabase.from("orders").insert([newOrder]).select().single()

    if (error) {
      console.error("Error creating order:", error)
      return NextResponse.json({ error: "Failed to create order", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, success: true, message: "Order created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/orders:", error)
    return NextResponse.json({ error: "Internal server error", details: (error as Error).message }, { status: 500 })
  }
}
