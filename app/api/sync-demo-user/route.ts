import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST() {
  try {
    console.log("🔄 Syncing demo user to Supabase...")

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: "demo@tswsmartlog.com",
      password: "demo",
      email_confirm: true,
      user_metadata: {
        name: "Demo User",
        role: "admin",
      },
    })

    if (authError && !authError.message.includes("already registered")) {
      console.error("❌ Auth user creation failed:", authError)
      return NextResponse.json({ success: false, error: authError.message }, { status: 500 })
    }

    const userId = authUser?.user?.id
    let existingUsers
    if (!userId) {
      // Try to get existing user
      const { data: users } = await supabaseAdmin.auth.admin.listUsers()
      existingUsers = users
      const existingUser = users?.users?.find((u) => u.email === "demo@tswsmartlog.com")
      if (!existingUser) {
        return NextResponse.json({ success: false, error: "Could not create or find demo user" }, { status: 500 })
      }
    }

    const finalUserId = userId || existingUsers?.users?.find((u) => u.email === "demo@tswsmartlog.com")?.id

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .upsert(
        {
          id: finalUserId,
          user_id: finalUserId,
          username: "demo",
          first_name: "Demo",
          surname: "User",
          full_name: "Demo User",
          email: "demo@tswsmartlog.com",
          role: "admin",
          department: "IT",
          page_access: JSON.stringify([
            "dashboard",
            "orders",
            "customers",
            "documents",
            "deliveries",
            "courierOrders",
            "shipmentTracker",
            "userManagement",
            "auditTrail",
            "estimates",
            "currency",
            "rateCard",
          ]),
        },
        { onConflict: "id" },
      )
      .select()
      .single()

    if (profileError) {
      console.error("❌ Profile creation failed:", profileError)
      return NextResponse.json({ success: false, error: profileError.message }, { status: 500 })
    }

    console.log("✅ Demo user synced successfully")
    return NextResponse.json({
      success: true,
      message: "Demo user synced successfully",
      user: profile,
    })
  } catch (error) {
    console.error("❌ Demo user sync error:", error)
    return NextResponse.json({ success: false, error: "Failed to sync demo user" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data: profile } = await supabaseAdmin.from("user_profiles").select("*").eq("username", "demo").single()

    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
    const authUser = authUsers?.users?.find((u) => u.email === "demo@tswsmartlog.com")

    return NextResponse.json({
      success: true,
      profileExists: !!profile,
      authUserExists: !!authUser,
      profile: profile,
      authUser: authUser ? { id: authUser.id, email: authUser.email } : null,
    })
  } catch (error) {
    console.error("❌ Demo user check error:", error)
    return NextResponse.json({ success: false, error: "Failed to check demo user" }, { status: 500 })
  }
}
