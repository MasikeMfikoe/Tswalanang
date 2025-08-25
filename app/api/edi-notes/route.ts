import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id, note_text, created_by } = body

    if (!order_id || !note_text || !created_by) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("edi_notes")
      .insert({
        order_id,
        note_text,
        created_by,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating EDI note:", error)
      return NextResponse.json({ error: "Failed to create EDI note" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in EDI notes POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
