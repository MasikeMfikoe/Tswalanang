import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("[v0] Fetching order details for ID:", params.id)

    const { data, error } = await supabaseAdmin.from("orders").select("*").eq("id", params.id).single()

    if (error) {
      console.error("[v0] Error fetching order:", error)
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const checkFinancialColumns = async () => {
      try {
        const { error: financialError } = await supabaseAdmin
          .from("orders")
          .select(
            "commercial_value, customs_duties, handling_fees, shipping_cost, documentation_fee, communication_fee, financial_notes",
          )
          .limit(1)
        return !financialError
      } catch {
        return false
      }
    }

    const checkCalculatedFinancialColumns = async () => {
      try {
        const { error: calculatedError } = await supabaseAdmin
          .from("orders")
          .select(
            "customs_vat, total_disbursements, facility_fee, agency_fee, subtotal_amount, vat_amount, total_amount",
          )
          .limit(1)
        return !calculatedError
      } catch {
        return false
      }
    }

    const hasFinancialColumns = await checkFinancialColumns()
    const hasCalculatedFinancialColumns = await checkCalculatedFinancialColumns()

    console.log("[v0] Successfully fetched order details")

    return NextResponse.json({
      order: data,
      hasFinancialColumns,
      hasCalculatedFinancialColumns,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Unexpected error fetching order details:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    console.log("[v0] Updating order:", params.id, "with data:", body)

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating order:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Order updated successfully:", data)

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[v0] Error in PUT /api/orders/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
