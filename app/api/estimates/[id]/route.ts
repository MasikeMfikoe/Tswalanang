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

// Mock data for fallback when estimate not found in Supabase or for preview IDs
const generateMockEstimate = (id: string) => {
  const numericPart = id.match(/\d+$/)?.[0] || Math.floor(Math.random() * 10000).toString()
  return {
    id: id,
    display_id: `TSW - ${numericPart}`,
    customer_id: "MOCK_CUSTOMER",
    customer_name: "Sample Customer",
    customer_email: "sample@example.com",
    status: "Draft",
    freight_type: "Ocean Freight",
    commercial_value: 50000.0,
    customs_duties: 4500.0,
    customs_vat: 7500.0,
    handling_fees: 2250.0,
    shipping_cost: 12000.0,
    documentation_fee: 200.0,
    communication_fee: 100.0,
    total_disbursements: 26550.0,
    facility_fee: 663.75,
    agency_fee: 929.25,
    subtotal: 28143.0,
    vat: 4221.45,
    total_amount: 32364.45,
    notes: "Sample estimate for preview",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

// GET: Fetch a single estimate by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log("GET /api/estimates/[id] - Fetching estimate:", id)

    if (!id) {
      return NextResponse.json({ error: "Estimate ID is required", success: false }, { status: 400 })
    }

    // First try to fetch from Supabase
    const { data, error } = await supabase.from("estimates").select("*").eq("id", id).single()

    if (error) {
      console.log("Supabase error or not found:", error.message)

      // If it's a mock ID (starts with "est-" followed by numbers), return mock data
      if (id.startsWith("est-") && /^est-\d+$/.test(id)) {
        console.log("Returning mock data for preview ID:", id)
        const mockData = generateMockEstimate(id)
        return NextResponse.json({
          data: mockData,
          success: true,
          message: "Sample estimate data (not saved to database)",
          isMockData: true,
        })
      }

      // Return 404 for real IDs that don't exist
      return NextResponse.json({ error: "Estimate not found", success: false }, { status: 404 })
    }

    console.log("Successfully fetched estimate from Supabase:", data)

    return NextResponse.json({
      data: data,
      success: true,
      message: "Estimate retrieved successfully",
      isMockData: false,
    })
  } catch (error) {
    console.error("Error in estimates/[id] GET route:", error)
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

// PUT: Update an existing estimate
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const estimateData = await request.json()
    const userId = await getUserIdFromRequest(request)
    console.log("PUT /api/estimates/[id] - Updating estimate:", id, estimateData)

    if (!id) {
      return NextResponse.json({ error: "Estimate ID is required", success: false }, { status: 400 })
    }

    // Check if this is a mock ID
    if (id.startsWith("est-") && /^est-\d+$/.test(id)) {
      return NextResponse.json(
        {
          error: "Cannot update sample data. Please create a real estimate first.",
          success: false,
        },
        { status: 400 },
      )
    }

    // Get old estimate data for audit logging
    const { data: oldEstimate, error: fetchError } = await supabase.from("estimates").select("*").eq("id", id).single()

    if (fetchError || !oldEstimate) {
      return NextResponse.json({ error: "Estimate not found", success: false }, { status: 404 })
    }

    // Prepare data for Supabase update
    // Remove display_id from updateData if present, as it's auto-generated
    const { display_id, displayId, ...updateData } = estimateData

    const supabaseData = {
      customer_name: updateData.customer_name || updateData.customerName,
      customer_email: updateData.customer_email || updateData.customerEmail,
      status: updateData.status,
      freight_type: updateData.freight_type || updateData.freightType,
      commercial_value: Number.parseFloat(updateData.commercial_value || updateData.commercialValue || "0"),
      customs_duties: Number.parseFloat(updateData.customs_duties || updateData.customsDuties || "0"),
      customs_vat: Number.parseFloat(updateData.customs_vat || updateData.customsVAT || "0"),
      handling_fees: Number.parseFloat(updateData.handling_fees || updateData.handlingFees || "0"),
      shipping_cost: Number.parseFloat(updateData.shipping_cost || updateData.shippingCost || "0"),
      documentation_fee: Number.parseFloat(updateData.documentation_fee || updateData.documentationFee || "0"),
      communication_fee: Number.parseFloat(updateData.communication_fee || updateData.communicationFee || "0"),
      total_disbursements: Number.parseFloat(updateData.total_disbursements || updateData.totalDisbursements || "0"),
      facility_fee: Number.parseFloat(updateData.facility_fee || updateData.facilityFee || "0"),
      agency_fee: Number.parseFloat(updateData.agency_fee || updateData.agencyFee || "0"),
      subtotal: Number.parseFloat(updateData.subtotal || "0"),
      vat: Number.parseFloat(updateData.vat || "0"),
      total_amount: Number.parseFloat(updateData.total_amount || updateData.totalAmount || "0"),
      notes: updateData.notes || "",
      updated_at: new Date().toISOString(),
    }

    // Update in Supabase
    const { data, error } = await supabase.from("estimates").update(supabaseData).eq("id", id).select("*").single()

    if (error) {
      console.error("Supabase update error:", error)
      return NextResponse.json({ error: `Database error: ${error.message}`, success: false }, { status: 500 })
    }

    console.log("Successfully updated estimate in Supabase:", data)

    // Log estimate update
    if (userId) {
      await AuditLogger.logEstimateUpdated(userId, id, oldEstimate, supabaseData)
    }

    return NextResponse.json({
      data: data,
      success: true,
      message: "Estimate updated successfully",
    })
  } catch (error) {
    console.error("Error in estimates/[id] PUT route:", error)
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

// DELETE: Delete an estimate
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const userId = await getUserIdFromRequest(request)
    console.log("DELETE /api/estimates/[id] - Deleting estimate:", id)

    if (!id) {
      return NextResponse.json({ error: "Estimate ID is required", success: false }, { status: 400 })
    }

    // Check if this is a mock ID
    if (id.startsWith("est-") && /^est-\d+$/.test(id)) {
      return NextResponse.json(
        {
          error: "Cannot delete sample data.",
          success: false,
        },
        { status: 400 },
      )
    }

    // Get estimate data for audit logging before deletion
    const { data: estimateToDelete, error: fetchError } = await supabase
      .from("estimates")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !estimateToDelete) {
      return NextResponse.json({ error: "Estimate not found", success: false }, { status: 404 })
    }

    // Delete from Supabase
    const { error } = await supabase.from("estimates").delete().eq("id", id)

    if (error) {
      console.error("Supabase delete error:", error)
      return NextResponse.json({ error: `Database error: ${error.message}`, success: false }, { status: 500 })
    }

    console.log("Successfully deleted estimate from Supabase")

    // Log estimate deletion
    if (userId) {
      await AuditLogger.logEstimateDeleted(userId, id, {
        display_id: estimateToDelete.display_id,
        customer_name: estimateToDelete.customer_name,
        total_amount: estimateToDelete.total_amount,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Estimate deleted successfully",
    })
  } catch (error) {
    console.error("Error in estimates/[id] DELETE route:", error)
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
