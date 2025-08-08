import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get("customerId")

  if (!customerId) {
    return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
  }

  try {
    // In a real application, you would fetch the specific rate card for the customer.
    // For this example, we'll return a mock rate card.
    const { data, error } = await supabase
      .from("customer_rate_cards")
      .select("*")
      .eq("customer_id", customerId)
      .single()

    if (error && error.code !== "PGRST116") { // PGRST116 means no rows found
      console.error("Error fetching customer rate card:", error)
      return NextResponse.json({ error: "Failed to fetch customer rate card" }, { status: 500 })
    }

    if (!data) {
      // If no specific rate card, you might return a default one or an empty array
      return NextResponse.json({ message: "No specific rate card found for this customer, returning default/empty." }, { status: 200 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Unexpected error fetching customer rate card:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { customer_id, rates, freight_types } = await request.json()

  if (!customer_id || !rates || !freight_types) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("customer_rate_cards")
      .upsert({ customer_id, rates, freight_types }, { onConflict: "customer_id" })
      .select()
      .single()

    if (error) {
      console.error("Error saving customer rate card:", error)
      return NextResponse.json({ error: "Failed to save customer rate card" }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Unexpected error saving customer rate card:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
