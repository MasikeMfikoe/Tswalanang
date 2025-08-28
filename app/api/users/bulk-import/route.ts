import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { users } = await request.json()

    if (!users || !Array.isArray(users)) {
      return NextResponse.json({ error: "Invalid users data" }, { status: 400 })
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const userData of users) {
      try {
        const {
          username,
          email,
          role = "employee",
          name,
          surname,
          department,
          password = "TempPassword123!", // Default password - users should change this
        } = userData

        if (!email) {
          results.failed++
          results.errors.push(`Missing email for user: ${JSON.stringify(userData)}`)
          continue
        }

        const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()

        if (listError) {
          results.failed++
          results.errors.push(`Failed to check existing users: ${listError.message}`)
          continue
        }

        const existingAuthUser = existingUsers.users.find((user) => user.email === email)
        let authUserId

        if (existingAuthUser) {
          // User exists in auth, use their ID
          authUserId = existingAuthUser.id
          console.log(`[v0] User ${email} already exists in auth.users`)
        } else {
          // Create new auth user
          const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          })

          if (authError) {
            results.failed++
            results.errors.push(`Failed to create auth user for ${email}: ${authError.message}`)
            continue
          }

          authUserId = newAuthUser.user?.id
          console.log(`[v0] Created new auth user for ${email}`)
        }

        if (!authUserId) {
          results.failed++
          results.errors.push(`No user ID available for ${email}`)
          continue
        }

        const { error: profileError } = await supabaseAdmin.from("user_profiles").upsert({
          id: authUserId,
          email,
          role,
          full_name: name || email.split("@")[0], // Generate name from email if missing
          surname: surname || "",
          department: department || "",
          page_access: getPageAccessForRole(role),
          updated_at: new Date().toISOString(),
        })

        if (profileError) {
          results.failed++
          results.errors.push(`Failed to create profile for ${email}: ${profileError.message}`)
          console.error(`[v0] Profile error for ${email}:`, profileError)
          continue
        }

        results.success++
        console.log(`[v0] ✅ Successfully imported user: ${email}`)
      } catch (error) {
        results.failed++
        results.errors.push(`Error processing user ${userData.email || "unknown"}: ${error}`)
        console.error(`[v0] Error processing user:`, error)
      }
    }

    return NextResponse.json({
      message: `Import completed: ${results.success} successful, ${results.failed} failed`,
      results,
    })
  } catch (error) {
    console.error("[v0] ❌ Bulk import error:", error)
    return NextResponse.json({ error: "Failed to import users" }, { status: 500 })
  }
}

function getPageAccessForRole(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    admin: [
      "dashboard",
      "orders",
      "customers",
      "documents",
      "deliveries",
      "courierOrders",
      "shipmentTracker",
      "clientPortal",
      "userManagement",
      "settings",
      "ediStatusInputs",
    ],
    manager: [
      "dashboard",
      "orders",
      "customers",
      "documents",
      "deliveries",
      "courierOrders",
      "containerTracking",
      "currency",
      "rateCard",
    ],
    employee: ["dashboard", "orders", "documents", "customers", "deliveries", "courierOrders"],
    client: ["containerTracking", "clientPortal"],
    guest: ["containerTracking", "shipmentTracker"],
  }

  return rolePermissions[role] || rolePermissions.guest
}
