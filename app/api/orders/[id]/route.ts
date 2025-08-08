import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data, error } = await supabase.from("orders").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching order:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("Error in GET /api/orders/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    console.log("Updating order:", id, "with data:", body)

    // Update the order
    const { data, error } = await supabase
      .from("orders")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating order:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Order updated successfully:", data)

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("Error in PUT /api/orders/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
