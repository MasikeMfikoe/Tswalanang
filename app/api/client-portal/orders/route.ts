import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
    }

    // Get the customer_id for this client user
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("customer_id")
      .eq("id", clientId)
      .single()

    if (userError) {
      console.error("Error fetching user profile:", userError)
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
    }

    if (!userProfile?.customer_id) {
      return NextResponse.json({ error: "Client not linked to customer" }, { status: 404 })
    }

    // Get customer info
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", userProfile.customer_id)
      .single()

    if (customerError) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Get orders for this customer
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        *,
        documents:documents(*)
      `)
      .eq("customer_name", customer.name)
      .order("created_at", { ascending: false })

    if (ordersError) {
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    // Calculate statistics
    const totalValue = orders.reduce((sum, order) => sum + (order.total_value || 0), 0)
    const activeOrders = orders.filter((order) => order.status !== "Completed")
    const completedOrders = orders.filter((order) => order.status === "Completed")

    return NextResponse.json({
      success: true,
      data: {
        customer,
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
    console.error("Error fetching client orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
