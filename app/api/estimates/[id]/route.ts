import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Mock data for fallback when estimate not found in Supabase
const generateMockEstimate = (id: string) => ({
  id: id,
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
})

// GET: Fetch a single estimate by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log("GET /api/estimates/[id] - Fetching estimate:", id)

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
          source: "mock",
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
      source: "supabase",
    })
  } catch (error) {
    console.error("Error in estimates/[id] GET route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}

// PUT: Update an existing estimate
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const estimateData = await request.json()
    console.log("PUT /api/estimates/[id] - Updating estimate:", id, estimateData)

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

    // Prepare data for Supabase update
    const supabaseData = {
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
      updated_at: new Date().toISOString(),
    }

    // Update in Supabase
    const { data, error } = await supabase.from("estimates").update(supabaseData).eq("id", id).select().single()

    if (error) {
      console.error("Supabase update error:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("Successfully updated estimate in Supabase:", data)

    return NextResponse.json({
      data: data,
      success: true,
      message: "Estimate updated successfully",
      source: "supabase",
    })
  } catch (error) {
    console.error("Error in estimates/[id] PUT route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}

// DELETE: Delete an estimate
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    console.log("DELETE /api/estimates/[id] - Deleting estimate:", id)

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

    // Delete from Supabase
    const { error } = await supabase.from("estimates").delete().eq("id", id)

    if (error) {
      console.error("Supabase delete error:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    console.log("Successfully deleted estimate from Supabase")

    return NextResponse.json({
      success: true,
      message: "Estimate deleted successfully",
      source: "supabase",
    })
  } catch (error) {
    console.error("Error in estimates/[id] DELETE route:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 },
    )
  }
}
