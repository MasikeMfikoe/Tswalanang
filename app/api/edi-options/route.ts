import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    if (!category) {
      return NextResponse.json({ error: "Category parameter is required" }, { status: 400 })
    }

    const { data: tableExists, error: tableError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "edi_submission_status_options")
      .single()

    if (tableError || !tableExists) {
      console.log("[v0] EDI options table does not exist, returning default options")

      const defaultOptions = getDefaultOptions(category)
      return NextResponse.json({ options: defaultOptions })
    }

    const { data: options, error } = await supabase
      .from("edi_submission_status_options")
      .select("*")
      .eq("category", category)
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching EDI options:", error)
      const defaultOptions = getDefaultOptions(category)
      return NextResponse.json({ options: defaultOptions })
    }

    return NextResponse.json({ options: options || [] })
  } catch (error) {
    console.error("[v0] Error in EDI options API:", error)

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || "edi_submission_type"
    const defaultOptions = getDefaultOptions(category)

    return NextResponse.json({ options: defaultOptions })
  }
}

function getDefaultOptions(category: string) {
  const optionsMap: Record<string, any[]> = {
    edi_submission_type: [
      { id: "1", value: "pending", label: "Pending", display_order: 1, is_active: true },
      { id: "2", value: "in_progress", label: "In Progress", display_order: 2, is_active: true },
      { id: "3", value: "submitted", label: "Submitted", display_order: 3, is_active: true },
      { id: "4", value: "acknowledged", label: "Acknowledged", display_order: 4, is_active: true },
      { id: "5", value: "rejected", label: "Rejected", display_order: 5, is_active: true },
      { id: "6", value: "completed", label: "Completed", display_order: 6, is_active: true },
    ],
    edi_status_type: [
      { id: "1", value: "not_started", label: "Not Started", display_order: 1, is_active: true },
      { id: "2", value: "data_preparation", label: "Data Preparation", display_order: 2, is_active: true },
      { id: "3", value: "validation", label: "Validation", display_order: 3, is_active: true },
      { id: "4", value: "transmission", label: "Transmission", display_order: 4, is_active: true },
      { id: "5", value: "awaiting_response", label: "Awaiting Response", display_order: 5, is_active: true },
      { id: "6", value: "response_received", label: "Response Received", display_order: 6, is_active: true },
      { id: "7", value: "error", label: "Error", display_order: 7, is_active: true },
    ],
    file_status_type: [
      { id: "1", value: "not_uploaded", label: "Not Uploaded", display_order: 1, is_active: true },
      { id: "2", value: "uploaded", label: "Uploaded", display_order: 2, is_active: true },
      { id: "3", value: "processing", label: "Processing", display_order: 3, is_active: true },
      { id: "4", value: "validated", label: "Validated", display_order: 4, is_active: true },
      { id: "5", value: "error", label: "Error", display_order: 5, is_active: true },
      { id: "6", value: "completed", label: "Completed", display_order: 6, is_active: true },
    ],
  }

  return optionsMap[category] || []
}
