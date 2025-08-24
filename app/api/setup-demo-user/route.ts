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
    console.log("🔧 Setting up demo user...")

    const demoEmail = "demo@tswsmartlog.com"
    const demoPassword = "Demo@2468"

    // First, try to delete existing demo user if it exists
    try {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find((u) => u.email === demoEmail)

      if (existingUser) {
        console.log("🗑️ Removing existing demo user...")
        await supabaseAdmin.auth.admin.deleteUser(existingUser.id)

        // Also remove from user_profiles
        await supabaseAdmin.from("user_profiles").delete().eq("email", demoEmail)
      }
    } catch (error) {
      console.log("ℹ️ No existing demo user to remove")
    }

    // Create new demo user in auth.users
    console.log("👤 Creating demo user in auth.users...")
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true,
      user_metadata: {
        username: "demo",
        first_name: "Demo",
        surname: "User",
        role: "admin",
      },
    })

    if (authError) {
      console.error("❌ Failed to create auth user:", authError)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create auth user: ${authError.message}`,
        },
        { status: 500 },
      )
    }

    if (!authUser?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "No user ID returned from auth creation",
        },
        { status: 500 },
      )
    }

    console.log("✅ Demo user created in auth.users with ID:", authUser.user.id)

    // Create user profile
    console.log("📝 Creating demo user profile...")
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .insert({
        id: authUser.user.id,
        user_id: authUser.user.id,
        first_name: "Demo",
        surname: "User",
        full_name: "Demo User",
        email: demoEmail,
        role: "admin",
        department: "Administration",
        page_access:
          "dashboard,orders,customers,documents,deliveries,courierOrders,shipmentTracker,userManagement,auditTrail,estimates,currency,rateCard,clientPortal",
      })
      .select()
      .single()

    if (profileError) {
      console.error("❌ Failed to create user profile:", profileError)
      return NextResponse.json(
        {
          success: false,
          error: `Failed to create user profile: ${profileError.message}`,
        },
        { status: 500 },
      )
    }

    console.log("✅ Demo user setup complete!")

    return NextResponse.json({
      success: true,
      message: "Demo user setup complete",
      credentials: {
        username: "demo",
        email: demoEmail,
        password: demoPassword,
      },
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        profile: profile,
      },
    })
  } catch (error) {
    console.error("❌ Demo user setup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Setup failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    console.log("🔍 Checking demo user status...")

    const demoEmail = "demo@tswsmartlog.com"

    // Check auth.users
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
    const authUser = authUsers?.users?.find((u) => u.email === demoEmail)

    // Check user_profiles
    const { data: profile } = await supabaseAdmin.from("user_profiles").select("*").eq("email", demoEmail).single()

    return NextResponse.json({
      success: true,
      status: {
        authUserExists: !!authUser,
        profileExists: !!profile,
        authUserId: authUser?.id,
        profileUserId: profile?.user_id,
        idsMatch: authUser?.id === profile?.user_id,
      },
      authUser: authUser
        ? {
            id: authUser.id,
            email: authUser.email,
            email_confirmed_at: authUser.email_confirmed_at,
            created_at: authUser.created_at,
          }
        : null,
      profile: profile,
    })
  } catch (error) {
    console.error("❌ Demo user check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Check failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { action, email, newPassword } = await request.json()

    if (action === "reset_password" && email === "demo@tswsmartlog.com") {
      console.log("🔧 Resetting demo user password...")

      // Find the existing demo user
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find((u) => u.email === email)

      if (!existingUser) {
        return NextResponse.json({ success: false, error: "Demo user not found" }, { status: 404 })
      }

      // Update the user's password
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: newPassword,
      })

      if (updateError) {
        console.error("❌ Failed to update demo user password:", updateError)
        return NextResponse.json(
          { success: false, error: `Failed to update password: ${updateError.message}` },
          { status: 500 },
        )
      }

      console.log("✅ Demo user password updated successfully!")

      return NextResponse.json({
        success: true,
        message: "Demo user password reset successfully",
        credentials: {
          username: "demo",
          email: email,
          password: newPassword,
        },
      })
    }

    return NextResponse.json({ success: false, error: "Invalid action or email" }, { status: 400 })
  } catch (error) {
    console.error("❌ Demo user password reset error:", error)
    return NextResponse.json(
      { success: false, error: `Reset failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
