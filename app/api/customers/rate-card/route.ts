import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer_id, seaFreight, airFreight } = body

    if (!customer_id) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    // Check if customer_rate_cards table exists
    const { error: tableCheckError } = await supabase.from("customer_rate_cards").select("id").limit(1)

    if (tableCheckError && tableCheckError.code === "42P01") {
      return NextResponse.json(
        { error: "Rate card table not available. Please run database migration." },
        { status: 503 },
      )
    }

    const rateCardData = {
      customer_id,
      sea_freight_communication_fee: seaFreight.communicationFee,
      sea_freight_documentation_fee: seaFreight.documentationFee,
      sea_freight_agency_fee: seaFreight.agencyFee,
      sea_freight_facility_fee: seaFreight.facilityFee,
      air_freight_communication_fee: airFreight.communicationFee,
      air_freight_documentation_fee: airFreight.documentationFee,
      air_freight_agency_fee: airFreight.agencyFee,
      air_freight_facility_fee: airFreight.facilityFee,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("customer_rate_cards").insert(rateCardData).select().single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Rate card created successfully",
    })
  } catch (error: any) {
    console.error("Error creating rate card:", error)
    return NextResponse.json({ error: error.message || "Failed to create rate card" }, { status: 500 })
  }
}
