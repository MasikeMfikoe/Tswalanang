import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Starting auth users sync...")

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const demoEmail = "demo@tswsmartlog.com"
    const demoPassword = "demo"

    // First, try to create/update in auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: {
        username: "demo",
      },
    })

    let userId: string

    if (authError && authError.message.includes("already registered")) {
      console.log("✅ Demo user already exists in auth.users, updating password...")

      // Get existing user
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = existingUsers.users.find((u) => u.email === demoEmail)

      if (existingUser) {
        userId = existingUser.id

        // Update password
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: demoPassword,
          user_metadata: { username: "demo" },
        })
        console.log("✅ Updated demo user password")
      } else {
        throw new Error("Could not find existing demo user")
      }
    } else if (authError) {
      console.error("❌ Auth user creation error:", authError)
      throw authError
    } else {
      userId = authUser.user.id
      console.log("✅ Created new demo user in auth.users")
    }

    const { error: profileError } = await supabaseAdmin.from("user_profiles").upsert(
      {
        id: userId,
        user_id: userId,
        username: "demo",
        first_name: "Demo",
        surname: "User",
        full_name: "Demo User",
        email: demoEmail,
        role: "admin",
        department: "Administration",
        page_access:
          "dashboard,orders,customers,documents,deliveries,courierOrders,shipmentTracker,userManagement,auditTrail,estimates,currency,rateCard",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )

    if (profileError) {
      console.error("❌ Profile creation error:", profileError)
      throw profileError
    }

    console.log("✅ Demo user profile synced successfully")

    const { data: authCheck } = await supabaseAdmin.auth.admin.listUsers()
    const demoAuthUser = authCheck.users.find((u) => u.email === demoEmail)

    const { data: profileCheck } = await supabaseAdmin.from("user_profiles").select("*").eq("email", demoEmail).single()

    return NextResponse.json({
      success: true,
      message: "Auth users synced successfully",
      demo_user: {
        auth_exists: !!demoAuthUser,
        profile_exists: !!profileCheck,
        user_id: userId,
        email: demoEmail,
        username: "demo",
      },
    })
  } catch (error) {
    console.error("❌ Sync error:", error)
    return NextResponse.json(
      {
        error: "Sync failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
