import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { Order } from "@/types/models"

// Mock data for fallback or development
const mockOrders: Order[] = [
  {
    id: "mock-order-1",
    po_number: "MOCK-PO001",
    supplier: "Mock Supplier A",
    importer: "ABC Company",
    status: "In Transit",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_name: "ABC Company",
    customer_id: "mock-customer-abc",
    total_cost: 1200.5,
    currency: "USD",
    estimated_delivery: "2025-08-15T00:00:00Z",
    actual_delivery: null,
    tracking_number: "MOCKTRACK123",
    shipping_line: "Mock Line",
    origin_port: "MOCKPORTA",
    destination_port: "MOCKPORTB",
    vessel_name: "Mock Vessel",
    container_number: "MOCKCONT123",
    cargo_status: "Loaded",
    last_event_date: new Date().toISOString(),
    last_event_description: "Mock event description",
    documents: [],
    freight_type: "Sea Freight",
  },
  {
    id: "mock-order-2",
    po_number: "MOCK-PO002",
    supplier: "Mock Supplier B",
    importer: "XYZ Corp",
    status: "Delivered",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_name: "XYZ Corp",
    customer_id: "mock-customer-xyz",
    total_cost: 800.0,
    currency: "USD",
    estimated_delivery: "2025-07-20T00:00:00Z",
    actual_delivery: "2025-07-19T00:00:00Z",
    tracking_number: "MOCKTRACK456",
    shipping_line: "Mock Line",
    origin_port: "MOCKPORTC",
    destination_port: "MOCKPORTD",
    vessel_name: "Mock Vessel 2",
    container_number: "MOCKCONT456",
    cargo_status: "Delivered",
    last_event_date: new Date().toISOString(),
    last_event_description: "Mock event description 2",
    documents: [],
    freight_type: "Air Freight",
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")

    if (!clientId) {
      console.error("❌ Client ID missing from request")
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(clientId)) {
      console.error("❌ Invalid UUID format for clientId:", clientId)
      return NextResponse.json({ error: "Invalid client ID format" }, { status: 400 })
    }

    // 1. Get user profile to find associated customer_id and role
    const { data: userProfile, error: userProfileError } = await supabase
      .from("user_profiles")
      .select("customer_id, email, role") // Select role as well
      .eq("id", clientId)
      .single()

    if (userProfileError || !userProfile) {
      console.error("Error fetching user profile or profile not found:", userProfileError?.message || "Not found")
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    let orders: Order[] | null = null
    let ordersError: any = null

    // If user is an admin, fetch all orders
    if (userProfile.role === "admin") {
      console.log("Admin user detected. Fetching all orders.")
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })
      orders = data
      ordersError = error
    } else {
      // For client or guest users, proceed with customer-specific filtering
      let customerId = userProfile.customer_id
      let customerName: string | null = null

      // If customer_id is not directly set, try to infer from email domain
      if (!customerId && userProfile.email) {
        const emailDomain = userProfile.email.split("@")[1]
        if (emailDomain) {
          const { data: customerByEmail, error: customerEmailError } = await supabase
            .from("customers")
            .select("id, name, email")
            .ilike("email", `%@${emailDomain}`)
            .limit(1)

          if (customerEmailError) {
            console.error("Error inferring customer from email domain:", customerEmailError.message)
          } else if (customerByEmail && customerByEmail.length > 0) {
            customerId = customerByEmail[0].id
            customerName = customerByEmail[0].name
            await supabase.from("user_profiles").update({ customer_id: customerId }).eq("id", clientId)
            console.log(`Inferred customer_id ${customerId} for user ${clientId} from email domain.`)
          } else {
            console.warn(`No customer found for email domain: ${emailDomain}.`)
          }
        }
      }

      // If customer_id was found (either direct or inferred), get customer name if not already set
      if (customerId && !customerName) {
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("name")
          .eq("id", customerId)
          .single()

        if (customerError || !customerData) {
          console.error("Error fetching customer name:", customerError?.message || "Not found")
          console.warn("Returning mock data due to customer name issue.")
          return NextResponse.json(
            { data: mockOrders, message: "Customer name not found or error, returning mock data." },
            { status: 200 },
          )
        }
        customerName = customerData.name
      }

      if (!customerName) {
        console.warn("Could not determine customer name for client. Returning mock data.")
        return NextResponse.json(
          { data: mockOrders, message: "Could not determine customer, returning mock data." },
          { status: 200 },
        )
      }

      // Fetch orders for the identified customer
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_name", customerName) // Filter by customer_name
        .order("created_at", { ascending: false })
      orders = data
      ordersError = error
    }

    if (ordersError) {
      console.error("Error fetching orders:", ordersError.message)
      return NextResponse.json({ error: "Failed to fetch orders", details: ordersError.message }, { status: 500 })
    }

    if (!orders || orders.length === 0) {
      console.log(`No orders found for the current user's context.`)
      return NextResponse.json({ data: [], message: `No orders found.` }, { status: 200 })
    }

    return NextResponse.json({ data: orders })
  } catch (error: any) {
    console.error("Unexpected error in client portal orders API:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
