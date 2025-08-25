import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userType = searchParams.get("type") // 'internal' or 'client'

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    let roleFilter: string[]
    if (userType === "internal") {
      roleFilter = ["admin", "manager", "employee"]
    } else if (userType === "client") {
      roleFilter = ["client"]
    } else {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .select("email, role, full_name, surname")
      .in("role", roleFilter)

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const mappedUsers = (data || []).map((user) => ({
      id: user.email || `user-${Math.random().toString(36).substr(2, 9)}`,
      username:
        user.full_name && user.surname
          ? `${user.full_name.toLowerCase()}.${user.surname.toLowerCase()}`
          : user.email?.split("@")[0] || "user",
      email: user.email || "",
      role: user.role || "employee",
      first_name: user.full_name || "",
      surname: user.surname || "",
    }))

    return NextResponse.json({ users: mappedUsers })
  } catch (error) {
    console.error("Error in users list API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
