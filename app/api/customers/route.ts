import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import { AuditLogger } from "@/lib/audit-logger"

const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Helper function to get user ID from request
const getUserIdFromRequest = async (request: NextRequest): Promise<string | null> => {
  try {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
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

// GET: Fetch all customers with optional filtering
export async function GET(request: NextRequest) {
  try {
    console.log("[v0] 🔍 Fetching customers from database...")

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "50")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    let query = supabaseAdmin.from("customers").select("*", { count: "exact" })

    // Apply search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,contact_person.ilike.%${search}%`)
      console.log("[v0] 🔍 Applied search filter:", search)
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
      console.error("[v0] ❌ Error fetching customers:", error)
      return NextResponse.json({ error: "Failed to fetch customers", details: error.message }, { status: 500 })
    }

    console.log(`[v0] ✅ Successfully fetched ${customers?.length || 0} customers`)

    // Calculate total pages
    const totalPages = count ? Math.ceil(count / pageSize) : 0

    return NextResponse.json({
      data: customers || [],
      total: count || 0,
      page,
      pageSize,
      totalPages,
      success: true,
    })
  } catch (error) {
    console.error("[v0] ❌ Unexpected error in customers GET route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}

// POST: Create a new customer
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] 📝 Creating new customer...")

    const customerData = await request.json()
    const userId = await getUserIdFromRequest(request)

    // Validate required fields
    const requiredFields = ["name", "email"]
    for (const field of requiredFields) {
      if (!customerData[field]) {
        console.log(`[v0] ❌ Missing required field: ${field}`)
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const { data: newCustomer, error } = await supabaseAdmin.from("customers").insert(customerData).select().single()

    if (error) {
      console.error("[v0] ❌ Error creating customer:", error)
      return NextResponse.json({ error: "Failed to create customer", details: error.message }, { status: 500 })
    }

    console.log("[v0] ✅ Successfully created customer:", newCustomer?.id)

    // Log customer creation
    if (userId && newCustomer) {
      await AuditLogger.logCustomerCreated(userId, newCustomer.id, {
        name: customerData.name,
        email: customerData.email,
        contact_person: customerData.contact_person,
      })
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
    console.error("[v0] ❌ Unexpected error in customers POST route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}
