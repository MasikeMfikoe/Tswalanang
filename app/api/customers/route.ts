import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

// GET: Fetch all customers with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "50")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const supabase = createRouteHandlerClient({ cookies })

    // Start building the query
    let query = supabase.from("customers").select("*", { count: "exact" })

    // Apply search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,contact_person.ilike.%${search}%`)
    }

    // Calculate pagination
    const startRow = (page - 1) * pageSize

    // Apply sorting and pagination
    const {
      data: customers,
      error,
      count,
    } = await query.order(sortBy, { ascending: sortOrder === "asc" }).range(startRow, startRow + pageSize - 1)

    if (error) {
      console.error("Error fetching customers:", error)
      return NextResponse.json({ error: "Failed to fetch customers", details: error.message }, { status: 500 })
    }

    // Calculate total pages
    const totalPages = count ? Math.ceil(count / pageSize) : 0

    return NextResponse.json({
      data: customers,
      total: count || 0,
      page,
      pageSize,
      totalPages,
      success: true,
    })
  } catch (error) {
    console.error("Unexpected error in customers GET route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}

// POST: Create a new customer
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const customerData = await request.json()

    // Validate required fields
    const requiredFields = ["name", "email"]
    for (const field of requiredFields) {
      if (!customerData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Insert the new customer
    const { data: newCustomer, error } = await supabase.from("customers").insert(customerData).select().single()

    if (error) {
      console.error("Error creating customer:", error)
      return NextResponse.json({ error: "Failed to create customer", details: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        data: newCustomer,
        success: true,
        message: "Customer created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Unexpected error in customers POST route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}
