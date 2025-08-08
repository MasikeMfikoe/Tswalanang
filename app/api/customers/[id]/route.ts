import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

// GET: Fetch a single customer by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: customerId } = await params
    const supabase = createRouteHandlerClient({ cookies })

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
    const { id: customerId } = await params
    const customerData = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    // Check if customer exists
    const { data: existingCustomer, error: checkError } = await supabase
      .from("customers")
      .select("id")
      .eq("id", customerId)
      .single()

    if (checkError || !existingCustomer) {
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
    const { id: customerId } = await params
    const supabase = createRouteHandlerClient({ cookies })

    // Check if customer exists
    const { data: existingCustomer, error: checkError } = await supabase
      .from("customers")
      .select("id")
      .eq("id", customerId)
      .single()

    if (checkError || !existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Delete the customer
    const { error } = await supabase.from("customers").delete().eq("id", customerId)

    if (error) {
      console.error("Error deleting customer:", error)
      return NextResponse.json({ error: "Failed to delete customer", details: error.message }, { status: 500 })
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
