import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabaseClient" // Assuming this is the server-side client
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")
    const customerIdParam = searchParams.get("customerId") // Use a different name to avoid conflict

    if (!clientId && !customerIdParam) {
      return NextResponse.json({ error: "Client ID or Customer ID is required" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createClient(cookieStore) // Use server-side client

    let customerId: string | null = customerIdParam // Initialize with customerIdParam if provided
    let customerName: string | null = null

    // If customerId is not provided as a param, try to get it from user_profiles
    if (!customerId) {
      const { data: userProfile, error: userError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", clientId)
        .single()

      if (userError) {
        console.error("Error fetching user profile:", userError)
        return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
      }

      customerId = userProfile.customer_id

      // If customer_id doesn't exist or is null, try to find a customer by email domain
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

          // Optionally update the user profile with the found customer_id
          await supabase.from("user_profiles").update({ customer_id: customerId }).eq("id", clientId)
        }
      }
    }

    // If we still don't have a customerId, return mock data
    if (!customerId) {
      console.warn("No customer ID found for user, returning mock data.")
      return NextResponse.json({
        success: true,
        data: {
          customer: { name: "Demo Company" },
          orders: [
            {
              id: "1",
              po_number: "PO-2024-001",
              created_at: "2024-01-15T10:00:00Z",
              status: "In Progress",
              cargo_status: "in-transit",
              total_value: 25000,
              supplier: "Global Electronics Ltd",
              freight_type: "Sea Freight",
              vessel_name: "MSC Pamela",
              eta_at_port: "2024-02-10T10:00:00Z",
              estimated_delivery: "2024-02-15T10:00:00Z",
              tracking_number: "MRSU0547355",
              destination: "Cape Town, South Africa",
            },
            {
              id: "2",
              po_number: "PO-2024-002",
              created_at: "2024-01-20T10:00:00Z",
              status: "Completed",
              cargo_status: "delivered",
              total_value: 30000,
              supplier: "Tech Components Inc",
              freight_type: "Air Freight",
              vessel_name: "N/A",
              eta_at_port: "2024-01-25T10:00:00Z",
              estimated_delivery: "2024-01-30T10:00:00Z",
              tracking_number: "AIRTRACK123",
              destination: "Johannesburg, South Africa",
            },
            {
              id: "3",
              po_number: "PO-2024-003",
              created_at: "2024-01-25T10:00:00Z",
              status: "Pending",
              cargo_status: "at-origin",
              total_value: 45000,
              supplier: "Industrial Supplies Co",
              freight_type: "Sea Freight",
              vessel_name: "Maersk Seletar",
              eta_at_port: "2024-02-25T10:00:00Z",
              estimated_delivery: "2024-03-01T10:00:00Z",
              tracking_number: "MAEU9876543",
              destination: "Durban, South Africa",
            },
          ],
          statistics: {
            totalOrders: 3,
            totalValue: 100000,
            activeOrders: 2,
            completedOrders: 1,
            activeValue: 70000,
            completedValue: 30000,
          },
        },
      })
    }

    // Get customer info if we don't have it yet
    if (!customerName) {
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .single()

      if (customerError) {
        console.error("Error fetching customer:", customerError)
        return NextResponse.json({ error: "Customer not found" }, { status: 404 })
      }

      customerName = customer.name
    }

    // Get orders for this specific customer only
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        *,
        documents:documents(*)
      `)
      .eq("customer_id", customerId) // Filter by customer_id for security
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("Error fetching orders from Supabase:", ordersError)
      return NextResponse.json({ error: `Failed to fetch orders: ${ordersError.message}` }, { status: 500 })
    }

    // Calculate statistics
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
  } catch (error: any) {
    console.error("Internal server error fetching client orders:", error)
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 })
  }
}
