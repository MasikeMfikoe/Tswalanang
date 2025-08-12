import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { AuditLogger } from "@/lib/audit-logger"

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to get user ID from request
const getUserIdFromRequest = async (request: NextRequest): Promise<string | null> => {
  try {
    // Try to get from authorization header
    const authHeader = request.headers.get("authorization")
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "")
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token)
      if (!error && user) {
        return user.id
      }
    }

    // Fallback: try to get from custom header
    const userIdHeader = request.headers.get("x-user-id")
    if (userIdHeader) {
      return userIdHeader
    }

    return null
  } catch (error) {
    console.error("Error getting user ID from request:", error)
    return null
  }
}

// GET: Fetch all estimates with optional filtering
export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/estimates - Starting request")

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase.from("estimates").select("*", { count: "exact" })

    // Apply filters
    if (status) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`customer_name.ilike.%${search}%,id.ilike.%${search}%,display_id.ilike.%${search}%`)
    }

    // Apply sorting
    query = query.order("created_at", { ascending: false })

    // Apply pagination
    query = query.range(from, to)

    console.log("Executing Supabase query...")
    const { data, error, count } = await query

    if (error) {
      console.error("Supabase error fetching estimates:", error)
      return NextResponse.json({ error: error.message, success: false }, { status: 500 })
    }

    console.log(`Query successful. Found ${count} total records, returning ${data?.length || 0} records`)

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
      success: true,
      message: "Estimates retrieved successfully",
    })
  } catch (error) {
    console.error("Error in estimates GET route:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: (error as Error).message,
        success: false,
      },
      { status: 500 },
    )
  }
}

// POST: Create a new estimate
export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/estimates - Creating new estimate")
    const estimateData = await request.json()
    const userId = await getUserIdFromRequest(request)
    console.log("Estimate data received:", estimateData)

    // Validate required fields
    const requiredFields = ["customer_name", "freight_type"]
    for (const field of requiredFields) {
      if (!estimateData[field]) {
        console.error(`Missing required field: ${field}`)
        return NextResponse.json({ error: `Missing required field: ${field}`, success: false }, { status: 400 })
      }
    }

    // Set default values if not provided
    if (!estimateData.status) {
      estimateData.status = "Draft"
    }

    // Generate a simple display_id (e.g., TSW-YYYYMMDD-XXXX)
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "") // YYYYMMDD
    const randomPart = Math.floor(1000 + Math.random() * 9000) // 4-digit random number
    const displayId = `TSW-${datePart}-${randomPart}`

    // Prepare data for Supabase insertion
    const supabaseData = {
      customer_id: estimateData.customer_id || "",
      customer_name: estimateData.customer_name,
      customer_email: estimateData.customer_email || "",
      status: estimateData.status,
      freight_type: estimateData.freight_type,
      commercial_value: Number.parseFloat(estimateData.commercialValue || "0"),
      customs_duties: Number.parseFloat(estimateData.customsDuties || "0"),
      customs_vat: Number.parseFloat(estimateData.customsVAT || "0"),
      handling_fees: Number.parseFloat(estimateData.handlingFees || "0"),
      shipping_cost: Number.parseFloat(estimateData.shippingCost || "0"),
      documentation_fee: Number.parseFloat(estimateData.documentationFee || "0"),
      communication_fee: Number.parseFloat(estimateData.communicationFee || "0"),
      total_disbursements: Number.parseFloat(estimateData.totalDisbursements || "0"),
      facility_fee: Number.parseFloat(estimateData.facility_fee || "0"),
      agency_fee: Number.parseFloat(estimateData.agency_fee || "0"),
      subtotal: Number.parseFloat(estimateData.subtotal || "0"),
      vat: Number.parseFloat(estimateData.vat || "0"),
      total_amount: Number.parseFloat(estimateData.totalAmount || "0"),
      notes: estimateData.notes || "",
      display_id: displayId, // Add the generated display_id
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Inserting into Supabase:", supabaseData)

    // Insert into Supabase and select the newly created row
    const { data, error } = await supabase.from("estimates").insert([supabaseData]).select("*").single()

    if (error) {
      console.error("Supabase insertion error:", error)
      return NextResponse.json({ error: `Database error: ${error.message}`, success: false }, { status: 500 })
    }

    console.log("Successfully created estimate:", data)

    // Log estimate creation
    if (userId && data) {
      await AuditLogger.logEstimateCreated(userId, data.id, {
        display_id: data.display_id,
        customer_name: data.customer_name,
        freight_type: data.freight_type,
        total_amount: data.total_amount,
        status: data.status,
      })
    }

    return NextResponse.json(
      {
        data: data,
        success: true,
        message: "Estimate created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error in estimates POST route:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: (error as Error).message,
        success: false,
      },
      { status: 500 },
    )
  }
}
