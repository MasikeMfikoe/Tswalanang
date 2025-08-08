import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data, error } = await supabase.from("orders").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { data, error } = await supabase.from("orders").update(body).eq("id", id).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: error.message || "Failed to update order" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await supabase.from("orders").delete().eq("id", id)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: "Order deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: error.message || "Failed to delete order" }, { status: 500 })
  }
}
