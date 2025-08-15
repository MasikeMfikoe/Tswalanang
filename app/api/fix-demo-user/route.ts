import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    console.log("[v0] Starting demo user fix process...")

    // Create admin client
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    console.log("[v0] Checking existing auth users...")

    const demoAuthUser = authUsers?.users?.find(
      (user) => user.email === "demo@tswsmartlog.com" || user.user_metadata?.username === "demo",
    )

    let demoUserId: string

    if (demoAuthUser) {
      console.log("[v0] Demo user exists in auth.users, updating password...")
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(demoAuthUser.id, {
        password: "Demo@2468",
        email: "demo@tswsmartlog.com",
        user_metadata: { username: "demo" },
      })

      if (updateError) {
        console.error("[v0] Error updating demo user:", updateError)
        throw updateError
      }

      demoUserId = demoAuthUser.id
      console.log("[v0] Demo user password updated successfully")
    } else {
      console.log("[v0] Creating new demo user in auth.users...")
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: "demo@tswsmartlog.com",
        password: "Demo@2468",
        email_confirm: true,
        user_metadata: { username: "demo" },
      })

      if (createError) {
        console.error("[v0] Error creating demo user:", createError)
        throw createError
      }

      demoUserId = newUser.user!.id
      console.log("[v0] Demo user created successfully")
    }

    const { error: profileError } = await supabaseAdmin.from("user_profiles").upsert({
      id: demoUserId,
      user_id: demoUserId,
      first_name: "Demo",
      surname: "User",
      full_name: "Demo User",
      email: "demo@tswsmartlog.com",
      role: "admin",
      department: "Administration",
      page_access:
        "dashboard,orders,customers,documents,deliveries,courierOrders,shipmentTracker,userManagement,auditTrail,estimates,currency,rateCard",
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("[v0] Error upserting user profile:", profileError)
      throw profileError
    }

    console.log("[v0] Demo user sync completed successfully")

    return NextResponse.json({
      success: true,
      message: "Demo user fixed successfully",
      userId: demoUserId,
    })
  } catch (error: any) {
    console.error("[v0] Demo user fix failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fix demo user",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
