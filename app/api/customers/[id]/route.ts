import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { AuditLogger } from "@/lib/audit-logger"

// Helper function to get user ID from request
const getUserIdFromRequest = async (request: NextRequest): Promise<string | null> => {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (!error && user) {
      return user.id
    }

    return null
  } catch (error) {
    console.error("Error getting user ID from request:", error)
    return null
  }
}

// GET: Fetch a single customer by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const customerId = id
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const { data: customer, error } = await supabase.from("customers").select("*").eq("id", customerId).single()

    if (error) {
      console.error("Error fetching customer:", error)
      return NextResponse.json({ error: "Failed to fetch customer", details: error.message }, { status: 500 })
    }

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({
      data: customer,
      success: true,
    })
  } catch (error) {
    console.error("Unexpected error in customer GET route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}

// PUT: Update a customer
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const customerId = id
    const customerData = await request.json()
    const userId = await getUserIdFromRequest(request)
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    // Get old customer data for audit logging
    const { data: oldCustomer, error: fetchError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single()

    if (fetchError || !oldCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Update the customer
    const { data: updatedCustomer, error } = await supabase
      .from("customers")
      .update(customerData)
      .eq("id", customerId)
      .select()
      .single()

    if (error) {
      console.error("Error updating customer:", error)
      return NextResponse.json({ error: "Failed to update customer", details: error.message }, { status: 500 })
    }

    // Log customer update
    if (userId) {
      await AuditLogger.logCustomerUpdated(userId, customerId, oldCustomer, customerData)
    }

    return NextResponse.json({
      data: updatedCustomer,
      success: true,
      message: "Customer updated successfully",
    })
  } catch (error) {
    console.error("Unexpected error in customer PUT route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}

// DELETE: Delete a customer
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const customerId = id
    const userId = await getUserIdFromRequest(request)
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    // Get customer data for audit logging before deletion
    const { data: customerToDelete, error: fetchError } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single()

    if (fetchError || !customerToDelete) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Delete the customer
    const { error } = await supabase.from("customers").delete().eq("id", customerId)

    if (error) {
      console.error("Error deleting customer:", error)
      return NextResponse.json({ error: "Failed to delete customer", details: error.message }, { status: 500 })
    }

    // Log customer deletion
    if (userId) {
      await AuditLogger.logCustomerDeleted(userId, customerId, {
        name: customerToDelete.name,
        email: customerToDelete.email,
        contact_person: customerToDelete.contact_person,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    })
  } catch (error) {
    console.error("Unexpected error in customer DELETE route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}
