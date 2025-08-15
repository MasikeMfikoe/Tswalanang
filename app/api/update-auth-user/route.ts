import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { validatePassword } from "@/utils/passwordValidator"

console.log("[v0] API route loaded, checking environment variables...")
console.log("[v0] SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("[v0] SERVICE_ROLE_KEY exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
)

export async function PUT(request: NextRequest) {
  console.log("[v0] PUT request received")

  try {
    console.log("🔄 Starting user update process...")

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

    console.log("[v0] About to parse JSON from request...")
    const requestBody = await request.json()
    console.log("[v0] JSON parsed successfully:", Object.keys(requestBody))

    const { userId, userData } = requestBody

    console.log("📝 Update request data:")
    console.log("User ID:", userId)
    console.log("Update data:", { ...userData, password: userData.password ? "[REDACTED]" : "not provided" })

    // Validate required fields
    if (!userId) {
      console.log("[v0] Missing user ID")
      return NextResponse.json({ error: "Missing user ID", details: "User ID is required" }, { status: 400 })
    }

    if (!userData || Object.keys(userData).length === 0) {
      console.log("[v0] Missing update data")
      return NextResponse.json(
        { error: "Missing update data", details: "No data provided for update" },
        { status: 400 },
      )
    }

    console.log("🔍 Looking up user profile...")
    const { data: userProfile, error: profileLookupError } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id, id, first_name, surname, email")
      .eq("id", userId)
      .single()

    if (profileLookupError) {
      console.error("❌ User profile lookup error:", profileLookupError)

      if (profileLookupError.code === "PGRST116") {
        return NextResponse.json(
          {
            error: "User not found",
            details: `No user profile found with ID: ${userId}`,
          },
          { status: 404 },
        )
      }

      return NextResponse.json(
        {
          error: "Database error",
          details: profileLookupError.message || "Failed to lookup user profile",
        },
        { status: 500 },
      )
    }

    if (!userProfile) {
      console.error("❌ User profile not found for ID:", userId)
      return NextResponse.json(
        {
          error: "User not found",
          details: `User profile does not exist for ID: ${userId}`,
        },
        { status: 404 },
      )
    }

    console.log("✅ Found user profile:", {
      profileId: userProfile.id,
      authUserId: userProfile.user_id,
      currentName: userProfile.first_name,
      currentSurname: userProfile.surname,
      currentEmail: userProfile.email,
    })

    const emailChanged = userData.email && userData.email.trim() !== userProfile.email
    const passwordProvided = userData.password && userData.password.trim()

    console.log("[v0] Auth update needed?", { emailChanged, passwordProvided })

    if (emailChanged || passwordProvided) {
      console.log("🔐 Auth update required - processing...")

      // Handle password validation if provided
      if (passwordProvided) {
        console.log("[v0] Validating password...")
        const passwordValidation = validatePassword(userData.password)

        if (!passwordValidation.isValid) {
          console.error("❌ Password validation failed:", passwordValidation.message)
          return NextResponse.json(
            {
              error: "Password validation failed",
              details: passwordValidation.message,
            },
            { status: 422 },
          )
        }
        console.log("✅ Password validation passed")
      }

      const authUpdateData: any = {}
      if (emailChanged) {
        authUpdateData.email = userData.email.trim()
        authUpdateData.email_confirm = true
        console.log("📧 Email will be updated to:", userData.email)
      }
      if (passwordProvided) {
        authUpdateData.password = userData.password.trim()
        console.log("🔑 Password will be updated")
      }

      try {
        console.log("[v0] Updating auth user with ID:", userProfile.user_id)
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
          userProfile.user_id,
          authUpdateData,
        )

        if (authError) {
          console.error("❌ Auth user update failed:", authError)
          return NextResponse.json(
            {
              error: "Failed to update authentication",
              details: authError.message || "Auth update failed",
            },
            { status: 400 },
          )
        }

        console.log("✅ Auth user updated successfully")
      } catch (authException) {
        console.error("❌ Auth update exception:", authException)
        return NextResponse.json(
          {
            error: "Auth update failed",
            details: authException instanceof Error ? authException.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    } else {
      console.log("ℹ️ Skipping auth update - no email/password changes")
    }

    console.log("👤 Updating user profile...")

    const { data: tableInfo, error: tableError } = await supabaseAdmin.from("user_profiles").select("*").limit(1)

    let availableColumns: string[] = []
    if (!tableError && tableInfo && tableInfo.length > 0) {
      availableColumns = Object.keys(tableInfo[0])
      console.log("📋 Available columns in user_profiles:", availableColumns)
    }

    const profileData: any = {}

    // Only add fields if the corresponding columns exist in the database
    if (userData.name && availableColumns.includes("first_name")) {
      profileData.first_name = userData.name.trim()
    }
    if (userData.surname && availableColumns.includes("surname")) {
      profileData.surname = userData.surname.trim()
    }
    if (userData.email && availableColumns.includes("email")) {
      profileData.email = userData.email.trim()
    }
    if (userData.role && availableColumns.includes("role")) {
      profileData.role = userData.role
    }
    if (userData.department && availableColumns.includes("department")) {
      profileData.department = userData.department.trim()
      console.log("✅ Department field will be updated")
    } else if (userData.department) {
      console.log("⚠️ Department field skipped - column doesn't exist in database")
    }
    if (userData.pageAccess && availableColumns.includes("page_access")) {
      profileData.page_access = userData.pageAccess
      console.log("✅ Page access field will be updated")
    } else if (userData.pageAccess) {
      console.log("⚠️ Page access field skipped - column doesn't exist in database")
    }

    console.log("[v0] Profile data to update:", Object.keys(profileData))

    if (Object.keys(profileData).length > 0) {
      try {
        const { data: profile, error: profileError } = await supabaseAdmin
          .from("user_profiles")
          .update(profileData)
          .eq("id", userId)
          .select()
          .single()

        if (profileError) {
          console.error("❌ Profile update failed:", profileError)
          return NextResponse.json(
            {
              error: "Failed to update user profile",
              details: profileError.message || "Profile update failed",
            },
            { status: 400 },
          )
        }

        console.log("✅ User profile updated successfully")
      } catch (profileException) {
        console.error("❌ Profile update exception:", profileException)
        return NextResponse.json(
          {
            error: "Profile update failed",
            details: profileException instanceof Error ? profileException.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    } else {
      console.log("ℹ️ No profile data to update")
    }

    console.log("🎉 User update completed successfully!")

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      updatedFields: Object.keys(userData).filter((key) => key !== "sendWelcomeEmail"),
    })
  } catch (error) {
    console.error("❌ API route error:", error)
    return NextResponse.json(
      {
        error: "Failed to update user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
