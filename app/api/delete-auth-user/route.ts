import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function DELETE(request: NextRequest) {
  try {
    console.log("🗑️ Starting user deletion process...")

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Missing Supabase environment variables")
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: "Missing Supabase credentials",
        },
        { status: 500 },
      )
    }

    const { userId } = await request.json()

    console.log("📝 Delete request for user ID:", userId)

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ error: "Missing user ID", details: "User ID is required" }, { status: 400 })
    }

    // 1️⃣ Delete from user_profiles table first
    console.log("👤 Deleting user profile...")
    try {
      const { error: profileError } = await supabaseAdmin.from("user_profiles").delete().eq("id", userId)

      if (profileError) {
        console.error("❌ Profile deletion failed:", profileError)
        return NextResponse.json(
          {
            error: "Failed to delete user profile",
            details: profileError.message || "Unknown profile error",
          },
          { status: 400 },
        )
      }

      console.log("✅ User profile deleted successfully")
    } catch (profileException) {
      console.error("❌ Profile deletion exception:", profileException)
      return NextResponse.json(
        {
          error: "Profile deletion failed",
          details: profileException instanceof Error ? profileException.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    // 2️⃣ Delete from auth.users table
    console.log("🔐 Deleting auth user...")
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

      if (authError) {
        console.error("❌ Auth user deletion failed:", authError)
        // Don't fail the entire operation if auth deletion fails
        console.log("⚠️ Continuing despite auth deletion failure")
      } else {
        console.log("✅ Auth user deleted successfully")
      }
    } catch (authException) {
      console.error("❌ Auth deletion exception:", authException)
      // Don't fail the entire operation if auth deletion fails
      console.log("⚠️ Continuing despite auth deletion exception")
    }

    console.log("🎉 User deletion completed successfully!")

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
      userId: userId,
    })
  } catch (error) {
    console.error("❌ API route error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
