import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

// GET: Fetch orders based on clientId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
    }

    // Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", clientId)
      .single()

    if (userError || !userProfile) {
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    let customerId = userProfile.customer_id
    let customerName = null

    // If no customer_id, try to find via email domain
    if (!customerId && userProfile.email) {
      const emailDomain = userProfile.email.split("@")[1]
      const { data: customers } = await supabase
        .from("customers")
        .select("id, name")
        .ilike("email", `%${emailDomain}%`)
        .limit(1)

      if (customers && customers.length > 0) {
        customerId = customers[0].id
        customerName = customers[0].name

        await supabase.from("user_profiles").update({ customer_id: customerId }).eq("id", clientId)
      }
    }

    // Return mock data if still no customer ID
    if (!customerId) {
      const mockOrders = [
        { id: "1", po_number: "PO-2023-001", created_at: "2023-06-15", status: "Completed", total_value: 25000 },
        { id: "2", po_number: "PO-2023-002", created_at: "2023-06-20", status: "In Progress", total_value: 30000 },
        { id: "3", po_number: "PO-2023-003", created_at: "2023-06-25", status: "Processing", total_value: 45000 },
      ]

      return NextResponse.json({
        success: true,
        data: {
          customer: { name: userProfile.department || "Demo Company" },
          orders: mockOrders,
          statistics: {
            totalOrders: mockOrders.length,
            totalValue: 100000,
            activeOrders: 2,
            completedOrders: 1,
            activeValue: 75000,
            completedValue: 25000,
          },
        },
      })
    }

    // If customer name wasn't set before, fetch it
    if (!customerName) {
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("name")
        .eq("id", customerId)
        .single()

      if (customerError || !customer) {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 })
      }

      customerName = customer.name
    }

    // Fetch orders for the customer
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*, documents:documents(*)")
      .eq("customer_name", customerName)
      .order("created_at", { ascending: false })

    if (ordersError) {
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    // Calculate stats
    const totalValue = orders.reduce((sum, order) => sum + (order.total_value || 0), 0)
    const activeOrders = orders.filter((order) => order.status !== "Completed")
    const completedOrders = orders.filter((order) => order.status === "Completed")

    return NextResponse.json({
      success: true,
      data: {
        customer: { name: customerName },
        orders,
        statistics: {
          totalOrders: orders.length,
          totalValue,
          activeOrders: activeOrders.length,
          completedOrders: completedOrders.length,
          activeValue: activeOrders.reduce((sum, order) => sum + (order.total_value || 0), 0),
          completedValue: completedOrders.reduce((sum, order) => sum + (order.total_value || 0), 0),
        },
      },
    })
  } catch (error) {
    console.error("Error in GET /api/orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST: Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { error } = await supabase.from("orders").insert([body])

    if (error) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT: Update an order (example requires `id` in payload)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    const { error } = await supabase.from("orders").update(updateData).eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE: Delete an order (example requires `id` in query params)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("id")

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("orders").delete().eq("id", orderId)

    if (error) {
      return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
