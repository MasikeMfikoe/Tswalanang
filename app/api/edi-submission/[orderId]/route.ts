import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> } // 👈 async
) {
  try {
    const { orderId } = await params                      // 👈 await

    // Check if tables exist by trying a simple query first
    const { error: tableCheckError } = await supabase.from("edi_submission_status").select("id").limit(1)

    if (tableCheckError && tableCheckError.message.includes("does not exist")) {
      console.log("[v0] EDI tables don't exist yet, returning empty data")
      return NextResponse.json({
        ediStatus: null,
        ediNotes: [],
        message: "EDI tables not created yet. Please run the database migration script.",
      })
    }

    // Get EDI submission status
    const { data: ediStatus, error: ediError } = await supabase
      .from("edi_submission_status")
      .select("*")
      .eq("order_id", orderId)
      .single()

    // Get EDI notes
    const { data: ediNotes, error: notesError } = await supabase
      .from("edi_notes")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true })

    if (ediError && ediError.code !== "PGRST116") {
      console.error("Error fetching EDI status:", ediError)
      return NextResponse.json({ error: "Failed to fetch EDI status" }, { status: 500 })
    }

    if (notesError) {
      console.error("Error fetching EDI notes:", notesError)
      return NextResponse.json({ error: "Failed to fetch EDI notes" }, { status: 500 })
    }

    return NextResponse.json({
      ediStatus: ediStatus || null,
      ediNotes: ediNotes || [],
    })
  } catch (error) {
    console.error("Error in EDI submission GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> } // 👈 async
) {
  try {
    const { orderId } = await params                      // 👈 await
    const body = await request.json()
    const { edi_submission_status, edi_status, file_status } = body

    const { error: tableCheckError } = await supabase.from("edi_submission_status").select("id").limit(1)

    if (tableCheckError && tableCheckError.message.includes("does not exist")) {
      console.error("EDI tables don't exist yet")
      return NextResponse.json(
        { error: "EDI tables not created yet. Please run the database migration script." },
        { status: 400 }
      )
    }

    // Check if EDI status record exists
    const { data: existing } = await supabase
      .from("edi_submission_status")
      .select("id")
      .eq("order_id", orderId)
      .single()

    let result
    if (existing) {
      const { data, error } = await supabase
        .from("edi_submission_status")
        .update({
          edi_submission_status,
          edi_status,
          file_status,
          updated_at: new Date().toISOString(),
        })
        .eq("order_id", orderId)
        .select()
        .single()

      if (error) {
        console.error("Error updating EDI status:", error)
        return NextResponse.json({ error: "Failed to update EDI status" }, { status: 500 })
      }
      result = data
    } else {
      const { data, error } = await supabase
        .from("edi_submission_status")
        .insert({
          order_id: orderId,
          edi_submission_status,
          edi_status,
          file_status,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating EDI status:", error)
        return NextResponse.json({ error: "Failed to create EDI status" }, { status: 500 })
      }
      result = data
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in EDI submission PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
