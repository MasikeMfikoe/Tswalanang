import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import { AuditLogger } from "@/lib/audit-logger"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Helper function to get user ID from request
const getUserIdFromRequest = async (request: NextRequest): Promise<string | null> => {
  try {
    // NOTE: This anon client won’t have a user unless you pass cookies/headers.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (!error && user) return user.id
    return null
  } catch (error) {
    console.error("Error getting user ID from request:", error)
    return null
  }
}

// GET: Fetch a single customer by ID with their orders
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ async params
) {
  try {
    const { id: customerId } = await params // ✅ await it
    console.log("[v0] Fetching customer details for ID:", customerId)

    const { data: customer, error } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single()

    if (error) {
      console.error("[v0] Error fetching customer:", error)
      if ((error as any).code === "PGRST116") {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    let orders: any[] = []
    try {
      // Try to filter by customer_id first
      const { data: customerIdOrders, error: customerIdError } = await supabaseAdmin
        .from("orders")
        .select(
          "id, po_number, supplier, status, freight_type, total_value, created_at, customer_name, importer"
        )
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false })

      if (!customerIdError && customerIdOrders) {
        orders = customerIdOrders
      } else {
        // Fallback: match by customer name or importer name
        const { data: nameOrders, error: nameError } = await supabaseAdmin
          .from("orders")
          .select(
            "id, po_number, supplier, status, freight_type, total_value, created_at, customer_name, importer"
          )
          .or(`customer_name.eq.${customer.name},importer.eq.${customer.name}`)
          .order("created_at", { ascending: false })

        if (!nameError) {
          orders = nameOrders || []
        }
      }
    } catch (ordersError) {
      console.error("[v0] Error fetching customer orders:", ordersError)
      // Continue without orders
    }

    console.log("[v0] Successfully fetched customer details and orders")

    return NextResponse.json({
      customer,
      orders,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Unexpected error in customer GET route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT: Update a customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ async params
) {
  try {
    const { id: customerId } = await params // ✅ await it
    const customerData = await request.json()

    console.log("[v0] Updating customer:", customerId, "with data:", customerData)

    const { data: updatedCustomer, error } = await supabaseAdmin
      .from("customers")
      .update({
        ...customerData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating customer:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Customer updated successfully")

    return NextResponse.json({
      data: updatedCustomer,
      success: true,
      message: "Customer updated successfully",
    })
  } catch (error) {
    console.error("[v0] Unexpected error in customer PUT route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE: Delete a customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ async params
) {
  try {
    const { id: customerId } = await params // ✅ await it
    const userId = await getUserIdFromRequest(request)

    console.log("[v0] Deleting customer:", customerId)

    // Get customer data for audit logging before deletion
    const { data: customerToDelete, error: fetchError } = await supabaseAdmin
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single()

    if (fetchError || !customerToDelete) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Delete the customer
    const { error } = await supabaseAdmin.from("customers").delete().eq("id", customerId)

    if (error) {
      console.error("[v0] Error deleting customer:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log customer deletion
    if (userId) {
      await AuditLogger.logCustomerDeleted(userId, customerId, {
        name: customerToDelete.name,
        email: customerToDelete.email,
        contact_person: customerToDelete.contact_person,
      })
    }

    console.log("[v0] Customer deleted successfully")

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    })
  } catch (error) {
    console.error("[v0] Unexpected error in customer DELETE route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
