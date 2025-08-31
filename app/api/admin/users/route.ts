import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  // Change "profiles" and selected columns to match your schema
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, username, name, surname, role, department, email, pageAccess")

  if (error) {
    console.error("[api/admin/users] error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }

  const users = (data ?? []).map((u) => ({
    ...u,
    pageAccess: Array.isArray(u.pageAccess) ? u.pageAccess : [],
  }))

  return NextResponse.json({ users })
}
