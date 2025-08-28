import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userType = searchParams.get("type") // 'internal' or 'client'

    console.log(`[v0] 🔍 Fetching users of type: ${userType}`)

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log(`[v0] 🔍 Checking total users in user_profiles table...`)
    const { data: allUsers, error: allUsersError } = await supabaseAdmin
      .from("user_profiles")
      .select("email, role, first_name, surname, full_name")
      .limit(10)

    if (allUsersError) {
      console.error("[v0] ❌ Error fetching all users:", allUsersError)
    } else {
      console.log(`[v0] 📊 Total users found in database: ${allUsers?.length || 0}`)
      if (allUsers && allUsers.length > 0) {
        console.log(
          `[v0] 📋 Sample user roles:`,
          allUsers.map((u) => ({ email: u.email, role: u.role })),
        )
      }
    }

    let roleFilter: string[]
    if (userType === "internal") {
      roleFilter = ["admin", "manager", "employee"]
    } else if (userType === "client") {
      roleFilter = ["client"]
    } else {
      return NextResponse.json({ error: "Invalid user type" }, { status: 400 })
    }

    console.log(`[v0] 🔍 Filtering by roles:`, roleFilter)

    const { data, error } = await supabaseAdmin
      .from("user_profiles")
      .select("email, role, first_name, surname, department")
      .in("role", roleFilter)

    if (error) {
      console.error("[v0] ❌ Error fetching filtered users:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[v0] 📊 Filtered users found: ${data?.length || 0}`)

    const mappedUsers = (data || []).map((user) => {
      const username =
        user.first_name && user.surname
          ? `${user.first_name.toLowerCase()}.${user.surname.toLowerCase()}`
          : user.email?.split("@")[0] || "user"

      const displayName = `${user.first_name || ""} ${user.surname || ""}`.trim()

      return {
        id: user.email || `user-${Math.random().toString(36).substr(2, 9)}`,
        username,
        email: user.email || "",
        role: user.role || "employee",
        first_name: user.first_name || "",
        surname: user.surname || "",
        full_name: displayName, // This is now combination of first_name + surname
        department: user.department || "",
      }
    })

    return NextResponse.json({ users: mappedUsers })
  } catch (error) {
    console.error("[v0] ❌ Error in users list API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
