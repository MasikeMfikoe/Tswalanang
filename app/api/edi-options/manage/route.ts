import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// GET - Fetch all options by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 })
    }

    const { data: options, error } = await supabase
      .from("edi_submission_status_options")
      .select("*")
      .eq("category", category)
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching EDI options:", error)
      return NextResponse.json({ error: "Failed to fetch options" }, { status: 500 })
    }

    return NextResponse.json({ options: options || [] })
  } catch (error) {
    console.error("[v0] Error in EDI options GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Add new option
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, value, label } = body

    if (!category || !value || !label) {
      return NextResponse.json({ error: "Category, value, and label are required" }, { status: 400 })
    }

    // Get the next display order
    const { data: maxOrder } = await supabase
      .from("edi_submission_status_options")
      .select("display_order")
      .eq("category", category)
      .order("display_order", { ascending: false })
      .limit(1)

    const nextOrder = (maxOrder?.[0]?.display_order || 0) + 1

    const { data, error } = await supabase
      .from("edi_submission_status_options")
      .insert({
        category,
        value,
        label,
        display_order: nextOrder,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating EDI option:", error)
      return NextResponse.json({ error: "Failed to create option" }, { status: 500 })
    }

    return NextResponse.json({ option: data })
  } catch (error) {
    console.error("[v0] Error in EDI options POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update option
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, value, label } = body

    if (!id || !value || !label) {
      return NextResponse.json({ error: "ID, value, and label are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("edi_submission_status_options")
      .update({ value, label, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating EDI option:", error)
      return NextResponse.json({ error: "Failed to update option" }, { status: 500 })
    }

    return NextResponse.json({ option: data })
  } catch (error) {
    console.error("[v0] Error in EDI options PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Remove option
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("edi_submission_status_options").update({ is_active: false }).eq("id", id)

    if (error) {
      console.error("[v0] Error deleting EDI option:", error)
      return NextResponse.json({ error: "Failed to delete option" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in EDI options DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
