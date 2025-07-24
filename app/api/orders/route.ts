import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import type { Order } from "@/types/models" // Assuming Order type is defined here

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const customerName = searchParams.get("customerName")
  const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
  const offset = Number.parseInt(searchParams.get("offset") || "0", 10)

  const supabaseRouteHandler = createRouteHandlerClient({ cookies })

  try {
    let query = supabaseRouteHandler.from("orders").select("*", { count: "exact" })

    if (status) {
      query = query.eq("status", status)
    }

    if (customerName) {
      query = query.ilike("customer_name", `%${customerName}%`) // Assuming column is customer_name in DB
    }

    query = query.range(offset, offset + limit - 1) // Supabase range is inclusive
    query = query.order("created_at", { ascending: false }) // Default sort, assuming created_at in DB

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: data as Order[],
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Unexpected error in GET /api/orders:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const newOrder: Partial<Order> = await request.json()
  const supabaseRouteHandler = createRouteHandlerClient({ cookies })

  try {
    // Add server-side generated fields
    newOrder.createdAt = new Date().toISOString()
    newOrder.updatedAt = new Date().toISOString() // Use updatedAt for consistency

    // Map frontend fields to database column names if they differ (e.g., camelCase to snake_case)
    const orderToInsert = {
      ...newOrder,
      customer_name: newOrder.customerName, // Example mapping
      po_number: newOrder.poNumber,
      freight_type: newOrder.freightType,
      cargo_status: newOrder.cargoStatus,
      cargo_status_comment: newOrder.cargoStatusComment,
      total_value: newOrder.totalValue,
      created_at: newOrder.createdAt,
      updated_at: newOrder.updatedAt,
      shipping_address: newOrder.shippingAddress,
      billing_address: newOrder.billingAddress,
      payment_status: newOrder.paymentStatus,
      delivery_date: newOrder.deliveryDate,
      tracking_number: newOrder.trackingNumber,
      financial_notes: newOrder.financialNotes,
      commercial_value: newOrder.commercialValue,
      customs_duties: newOrder.customsDuties,
      handling_fees: newOrder.handlingFees,
      shipping_cost: newOrder.shippingCost,
      documentation_fee: newOrder.documentationFee,
      communication_fee: newOrder.communicationFee,
      // Ensure all fields from Order interface are mapped if they exist in DB
    }

    const { data, error } = await supabaseRouteHandler.from("orders").insert(orderToInsert).select()

    if (error) {
      console.error("Error inserting new order:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0] as Order, { status: 201 })
  } catch (error) {
    console.error("Unexpected error in POST /api/orders:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const { id, ...updates }: Partial<Order> & { id: string } = await request.json()
  const supabaseRouteHandler = createRouteHandlerClient({ cookies })

  if (!id) {
    return NextResponse.json({ error: "Order ID is required for update" }, { status: 400 })
  }

  try {
    updates.updatedAt = new Date().toISOString() // Update last update timestamp

    // Map frontend fields to database column names if they differ
    const updatesToApply: Record<string, any> = {
      ...updates,
      customer_name: updates.customerName,
      po_number: updates.poNumber,
      freight_type: updates.freightType,
      cargo_status: updates.cargoStatus,
      cargo_status_comment: updates.cargoStatusComment,
      total_value: updates.totalValue,
      updated_at: updates.updatedAt,
      shipping_address: updates.shippingAddress,
      billing_address: updates.billingAddress,
      payment_status: updates.paymentStatus,
      delivery_date: updates.deliveryDate,
      tracking_number: updates.trackingNumber,
      financial_notes: updates.financialNotes,
      commercial_value: updates.commercialValue,
      customs_duties: updates.customsDuties,
      handling_fees: updates.handlingFees,
      shipping_cost: updates.shippingCost,
      documentation_fee: updates.documentationFee,
      communication_fee: updates.communicationFee,
    }

    // Remove undefined values to prevent Supabase from trying to set them to null
    Object.keys(updatesToApply).forEach((key) => updatesToApply[key] === undefined && delete updatesToApply[key])

    const { data, error } = await supabaseRouteHandler.from("orders").update(updatesToApply).eq("id", id).select()

    if (error) {
      console.error(`Error updating order ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(data[0] as Order, { status: 200 })
  } catch (error) {
    console.error(`Unexpected error in PATCH /api/orders/${id}:`, error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { id }: { id: string } = await request.json()
  const supabaseRouteHandler = createRouteHandlerClient({ cookies })

  if (!id) {
    return NextResponse.json({ error: "Order ID is required for deletion" }, { status: 400 })
  }

  try {
    const { error } = await supabaseRouteHandler.from("orders").delete().eq("id", id)

    if (error) {
      console.error(`Error deleting order ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Order deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error(`Unexpected error in DELETE /api/orders/${id}:`, error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
