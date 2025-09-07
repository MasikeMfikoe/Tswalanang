import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { rolePermissions } from "@/types/auth"

export async function GET(request: NextRequest) {
  try {
    console.log(`[v0] 🔍 Generating user permissions report...`)

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Fetch all users with their roles and page access
    const { data: users, error } = await supabaseAdmin
      .from("user_profiles")
      .select("email, role, first_name, surname, page_access, department")
      .order("role")
      .order("email")

    if (error) {
      console.error("[v0] ❌ Error fetching users:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[v0] 📊 Found ${users?.length || 0} users`)

    const userPermissionsReport = (users || []).map((user) => {
      const username =
        user.first_name && user.surname
          ? `${user.first_name.toLowerCase()}.${user.surname.toLowerCase()}`
          : user.email?.split("@")[0] || "user"

      const displayName = `${user.first_name || ""} ${user.surname || ""}`.trim()

      // Get role-based permissions
      const roleBasedPermissions = rolePermissions[user.role as keyof typeof rolePermissions] || {}

      // Get database-stored page access
      const databasePageAccess = user.page_access || []

      // Convert role permissions to page list with access levels
      const rolePages = Object.entries(roleBasedPermissions).map(([page, permissions]) => ({
        page,
        permissions: typeof permissions === "object" ? permissions : { view: permissions },
      }))

      return {
        username,
        email: user.email,
        displayName,
        role: user.role,
        department: user.department || "Not specified",
        roleBasedPermissions: rolePages,
        databasePageAccess,
        totalRolePages: rolePages.length,
        totalDatabasePages: databasePageAccess.length,
      }
    })

    // Generate summary statistics
    const roleStats = userPermissionsReport.reduce(
      (acc, user) => {
        const role = user.role
        if (!acc[role]) {
          acc[role] = { count: 0, users: [] }
        }
        acc[role].count++
        acc[role].users.push(user.username)
        return acc
      },
      {} as Record<string, { count: number; users: string[] }>,
    )

    const report = {
      generatedAt: new Date().toISOString(),
      totalUsers: userPermissionsReport.length,
      roleStatistics: roleStats,
      users: userPermissionsReport,
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("[v0] ❌ Error generating permissions report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
