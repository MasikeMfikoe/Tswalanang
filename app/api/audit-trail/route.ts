import { createClient } from "@supabase/supabase-js"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1", 10)
  const pageSize = Number.parseInt(searchParams.get("pageSize") || "10", 10)
  const offset = (page - 1) * pageSize

  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data, error, count } = await supabase
      .from("audit_trail")
      .select("*", { count: "exact" })
      .order("timestamp", { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) {
      console.error("Error fetching audit trail:", error)
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    })
  } catch (error: any) {
    console.error("Unexpected error fetching audit trail:", error)
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { userId, userEmail, action, module, recordId, details, ipAddress } = await request.json()

  // Create service role client to bypass RLS policies for audit logging
  const supabaseServiceRole = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )

  try {
    const { data, error } = await supabaseServiceRole
      .from("audit_trail")
      .insert({
        user_id: userId,
        user_email: userEmail,
        action,
        module,
        record_id: recordId,
        details,
        ip_address: ipAddress,
      })
      .select()

    if (error) {
      console.error("Error logging audit event:", error)
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error("Unexpected error logging audit event:", error)
    return NextResponse.json({ success: false, message: error.message || "Internal server error" }, { status: 500 })
  }
}
