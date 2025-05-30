import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

// GET: Fetch all estimates with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const customerId = searchParams.get("customerId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const supabase = createRouteHandlerClient({ cookies })

    // Start building the query
    let query = supabase.from("estimates").select("*", { count: "exact" })

    // Apply filters if provided
    if (status) {
      query = query.eq("status", status)
    }

    if (customerId) {
      query = query.eq("customer_id", customerId)
    }

    // Calculate pagination
    const startRow = (page - 1) * pageSize

    // Apply sorting and pagination
    const {
      data: estimates,
      error,
      count,
    } = await query.order(sortBy, { ascending: sortOrder === "asc" }).range(startRow, startRow + pageSize - 1)

    if (error) {
      console.error("Error fetching estimates:", error)
      return NextResponse.json({ error: "Failed to fetch estimates", details: error.message }, { status: 500 })
    }

    // Calculate total pages
    const totalPages = count ? Math.ceil(count / pageSize) : 0

    return NextResponse.json({
      data: estimates,
      total: count || 0, // Add this line - the frontend expects 'total', not 'pagination.totalItems'
      pagination: {
        page,
        pageSize,
        totalItems: count || 0,
        totalPages,
      },
      success: true,
    })
  } catch (error) {
    console.error("Unexpected error in estimates GET route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}

// POST: Create a new estimate
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const estimateData = await request.json()

    // Validate required fields
    const requiredFields = ["customer_id", "customer_name", "customer_email", "freight_type"]
    for (const field of requiredFields) {
      if (!estimateData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Set default values if not provided
    if (!estimateData.status) {
      estimateData.status = "Draft"
    }

    // Calculate total amount if not provided
    if (!estimateData.total_amount && estimateData.subtotal && estimateData.vat) {
      estimateData.total_amount = Number.parseFloat(estimateData.subtotal) + Number.parseFloat(estimateData.vat)
    }

    // Insert the new estimate
    const { data: newEstimate, error } = await supabase.from("estimates").insert(estimateData).select().single()

    if (error) {
      console.error("Error creating estimate:", error)
      return NextResponse.json({ error: "Failed to create estimate", details: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        data: newEstimate,
        success: true,
        message: "Estimate created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Unexpected error in estimates POST route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}
