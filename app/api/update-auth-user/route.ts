import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // This key has admin privileges
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

export async function PUT(request: NextRequest) {
  try {
    const { userId, userData } = await request.json()

    console.log("🔄 Updating user with service role key...")
    console.log("User ID:", userId)
    console.log("Update data:", userData)

    // Update auth.users table if email or password is being changed
    if (userData.email || userData.password) {
      const authUpdateData: any = {}

      if (userData.email) {
        authUpdateData.email = userData.email
        authUpdateData.email_confirm = true // Auto-confirm new email
      }

      if (userData.password) {
        authUpdateData.password = userData.password
      }

      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdateData)

      if (authError) {
        console.error("❌ Auth user update failed:", authError)
        return NextResponse.json({ error: "Failed to update auth user", details: authError }, { status: 400 })
      }

      console.log("✅ Auth user updated:", authUser.user.id)
    }

    // Update user_profiles table
    const profileData: any = {}

    if (userData.name) profileData.name = userData.name
    if (userData.surname) profileData.surname = userData.surname
    if (userData.email) profileData.email = userData.email
    if (userData.role) profileData.role = userData.role
    if (userData.department) profileData.department = userData.department
    if (userData.pageAccess) profileData.page_access = userData.pageAccess

    // Only update if there's profile data to update
    if (Object.keys(profileData).length > 0) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .update(profileData)
        .eq("id", userId)
        .select()
        .single()

      if (profileError) {
        console.error("❌ Profile update failed:", profileError)
        return NextResponse.json({ error: "Failed to update user profile", details: profileError }, { status: 400 })
      }

      console.log("✅ User profile updated:", profile)
    }

    // Send welcome email if requested
    if (userData.sendWelcomeEmail) {
      try {
        console.log("📧 Sending welcome email...")
        const emailResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-welcome-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userEmail: userData.email,
              userName: userData.name,
              userSurname: userData.surname,
              temporaryPassword: userData.password || "Password updated",
              companyName: userData.department,
              isClientUser: userData.role === "client",
              isUpdate: true,
            }),
          },
        )

        if (emailResponse.ok) {
          console.log("✅ Welcome email sent successfully")
        } else {
          console.warn("⚠️ Welcome email failed to send")
        }
      } catch (emailError) {
        console.warn("⚠️ Error sending welcome email:", emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("❌ API route error:", error)
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { userId, data } = await request.json()
  console.log(`Updating auth user ${userId} with data:`, data)
  return NextResponse.json({ success: true })
}
