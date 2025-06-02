import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// GET: Fetch all estimates with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl?.searchParams
    const status = searchParams?.get("status")
    const customerId = searchParams?.get("customerId")
    const page = Number.parseInt(searchParams?.get("page") || "1")
    const pageSize = Number.parseInt(searchParams?.get("pageSize") || "10")
    const sortBy = searchParams?.get("sortBy") || "created_at"
    const sortOrder = searchParams?.get("sortOrder") || "desc"

    console.log("GET /api/estimates - Fetching from Supabase")

    // Build query
    let query = supabase.from("estimates").select("*", { count: "exact" })

    // Apply filters
    if (status) {
      query = query.eq("status", status)
    }

    if (customerId) {
      query = query.eq("customer_id", customerId)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    // Apply pagination
    const startIndex = (page - 1) * pageSize
    query = query.range(startIndex, startIndex + pageSize - 1)

    const { data, error, count } = await query

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      pagination: {
        page,
        pageSize,
        totalItems: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
      success: true,
      source: "supabase",
    })
  } catch (error) {
    console.error("Error in estimates GET route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}

// POST: Create a new estimate
export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/estimates - Creating new estimate in Supabase")
    const estimateData = await request.json()
    console.log("Estimate data received:", estimateData)

    // Validate required fields
    const requiredFields = ["customer_id", "customer_name", "customer_email", "freight_type"]
    for (const field of requiredFields) {
      if (!estimateData[field]) {
        console.error(`Missing required field: ${field}`)
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Set default values if not provided
    if (!estimateData.status) {
      estimateData.status = "Draft"
    }

    // Prepare data for Supabase insertion
    const supabaseData = {
      customer_id: estimateData.customer_id,
      customer_name: estimateData.customer_name,
      customer_email: estimateData.customer_email,
      status: estimateData.status,
      freight_type: estimateData.freight_type,
      commercial_value: Number.parseFloat(estimateData.commercial_value || "0"),
      customs_duties: Number.parseFloat(estimateData.customs_duties || "0"),
      customs_vat: Number.parseFloat(estimateData.customs_vat || "0"),
      handling_fees: Number.parseFloat(estimateData.handling_fees || "0"),
      shipping_cost: Number.parseFloat(estimateData.shipping_cost || "0"),
      documentation_fee: Number.parseFloat(estimateData.documentation_fee || "0"),
      communication_fee: Number.parseFloat(estimateData.communication_fee || "0"),
      total_disbursements: Number.parseFloat(estimateData.total_disbursements || "0"),
      facility_fee: Number.parseFloat(estimateData.facility_fee || "0"),
      agency_fee: Number.parseFloat(estimateData.agency_fee || "0"),
      subtotal: Number.parseFloat(estimateData.subtotal || "0"),
      vat: Number.parseFloat(estimateData.vat || "0"),
      total_amount: Number.parseFloat(estimateData.total_amount || "0"),
      notes: estimateData.notes || "",
    }

    console.log("Inserting into Supabase:", supabaseData)

    // Insert into Supabase
    const { data, error } = await supabase.from("estimates").insert([supabaseData]).select().single()

    if (error) {
      console.error("Supabase insertion error:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("Successfully created estimate in Supabase:", data)

    return NextResponse.json(
      {
        data: data,
        success: true,
        message: "Estimate created successfully",
        source: "supabase",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error in estimates POST route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}
