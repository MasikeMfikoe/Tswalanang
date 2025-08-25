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
      { id: "1", value: "draft_entry", label: "Draft Entry", display_order: 1, is_active: true },
      { id: "2", value: "edi_submitted", label: "EDI Submitted", display_order: 2, is_active: true },
    ],
    edi_status_type: [
      { id: "1", value: "query", label: "Query", display_order: 1, is_active: true },
      { id: "2", value: "pre_stopped", label: "Pre-Stopped", display_order: 2, is_active: true },
      { id: "3", value: "stopped", label: "Stopped", display_order: 3, is_active: true },
      { id: "4", value: "released", label: "Released", display_order: 4, is_active: true },
    ],
    file_status_type: [
      { id: "1", value: "framed", label: "Framed", display_order: 1, is_active: true },
      { id: "2", value: "ready_for_pick_up", label: "Ready for Pick Up", display_order: 2, is_active: true },
      { id: "3", value: "pending_pick_up", label: "Pending Pick Up", display_order: 3, is_active: true },
    ],
  }

  return optionsMap[category] || []
}
