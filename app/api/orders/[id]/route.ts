import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import type { Order } from "@/types/models"

// GET: Fetch a single order by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const { id } = params

    const { data: order, error } = await supabase
      .from("orders")
      .select("*, documents:documents(*)")
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }
      console.error(`Error fetching order ${id}:`, error)
      return NextResponse.json({ error: "Failed to fetch order", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: order, success: true })
  } catch (error) {
    console.error("Error in GET /api/orders/[id]:", error)
    return NextResponse.json({ error: "Internal server error", details: (error as Error).message }, { status: 500 })
  }
}

// PUT: Update an existing order by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const { id } = params
    const updateData: Partial<Order> = await request.json()

    const { data, error } = await supabase.from("orders").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error(`Error updating order ${id}:`, error)
      return NextResponse.json({ error: "Failed to update order", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, success: true, message: "Order updated successfully" })
  } catch (error) {
    console.error("Error in PUT /api/orders/[id]:", error)
    return NextResponse.json({ error: "Internal server error", details: (error as Error).message }, { status: 500 })
  }
}

// DELETE: Delete an order by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const { id } = params

    const { error } = await supabase.from("orders").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting order ${id}:`, error)
      return NextResponse.json({ error: "Failed to delete order", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Order deleted successfully" })
  } catch (error) {
    console.error("Error in DELETE /api/orders/[id]:", error)
    return NextResponse.json({ error: "Internal server error", details: (error as Error).message }, { status: 500 })
  }
}
