import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { rolePermissions } from "@/types/auth"

const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] 🔄 Starting role permissions application process")

    // Get all users except Demo user
    const { data: users, error: usersError } = await supabaseAdmin
      .from("user_profiles")
      .select("id, email, role, first_name, surname")
      .neq("email", "demo@tswsmartlog.com")

    if (usersError) {
      console.error("[v0] ❌ Error fetching users:", usersError)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    console.log(`[v0] 📊 Found ${users?.length || 0} users to update`)

    const updates = []

    for (const user of users || []) {
      const userRole = user.role as keyof typeof rolePermissions
      const permissions = rolePermissions[userRole]

      if (!permissions) {
        console.log(`[v0] ⚠️ Unknown role ${userRole} for user ${user.email}`)
        continue
      }

      // Convert role permissions to page access array
      const pageAccess = []

      for (const [page, perms] of Object.entries(permissions)) {
        const accessLevels = []
        if (perms.view) accessLevels.push("view")
        if (perms.create) accessLevels.push("create")
        if (perms.edit) accessLevels.push("edit")
        if (perms.delete) accessLevels.push("delete")

        if (accessLevels.length > 0) {
          pageAccess.push(`${page}:${accessLevels.join(",")}`)
        }
      }

      console.log(`[v0] 👤 Updating ${user.email} (${userRole}) with ${pageAccess.length} permissions`)

      // Update user with role-based permissions
      const { error: updateError } = await supabaseAdmin
        .from("user_profiles")
        .update({
          page_access: pageAccess,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) {
        console.error(`[v0] ❌ Error updating user ${user.email}:`, updateError)
        updates.push({
          email: user.email,
          role: userRole,
          success: false,
          error: updateError.message,
        })
      } else {
        console.log(`[v0] ✅ Successfully updated ${user.email}`)
        updates.push({
          email: user.email,
          role: userRole,
          success: true,
          permissionsCount: pageAccess.length,
        })
      }
    }

    const successCount = updates.filter((u) => u.success).length
    const errorCount = updates.filter((u) => !u.success).length

    console.log(`[v0] 📈 Role permissions application completed: ${successCount} success, ${errorCount} errors`)

    return NextResponse.json({
      success: true,
      message: `Applied role permissions to ${successCount} users`,
      updates,
      summary: {
        total: updates.length,
        successful: successCount,
        failed: errorCount,
      },
    })
  } catch (error) {
    console.error("[v0] ❌ Error in apply-role-permissions:", error)
    return NextResponse.json({ error: "Internal server error applying role permissions" }, { status: 500 })
  }
}
