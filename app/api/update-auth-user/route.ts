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

// Password validation function
function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" }
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" }
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" }
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" }
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character" }
  }

  return { isValid: true }
}

// Generate a secure password
function generateSecurePassword(): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numbers = "0123456789"
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"

  let password = ""

  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill the rest with random characters
  const allChars = lowercase + uppercase + numbers + symbols
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

export async function PUT(request: NextRequest) {
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

    const { userId, userData } = await request.json()

    console.log("📝 Update request data:")
    console.log("User ID:", userId)
    console.log("Update data:", { ...userData, password: userData.password ? "[REDACTED]" : "not provided" })

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ error: "Missing user ID", details: "User ID is required" }, { status: 400 })
    }

    if (!userData || Object.keys(userData).length === 0) {
      return NextResponse.json(
        { error: "Missing update data", details: "No data provided for update" },
        { status: 400 },
      )
    }

    // Handle password update with validation
    let processedPassword = null
    if (userData.password && userData.password.trim()) {
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

      processedPassword = userData.password.trim()
      console.log("✅ Password validation passed")
    }

    // Update auth.users table if email or password is being changed
    if (userData.email || processedPassword) {
      console.log("🔐 Updating auth user...")

      const authUpdateData: any = {}

      if (userData.email) {
        authUpdateData.email = userData.email
        authUpdateData.email_confirm = true // Auto-confirm new email
        console.log("📧 Email will be updated to:", userData.email)
      }

      if (processedPassword) {
        authUpdateData.password = processedPassword
        console.log("🔑 Password will be updated")
      }

      try {
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          authUpdateData,
        )

        if (authError) {
          console.error("❌ Auth user update failed:", authError)

          // Handle specific Supabase auth errors
          if (authError.message?.includes("weak_password")) {
            return NextResponse.json(
              {
                error: "Password too weak",
                details:
                  "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
              },
              { status: 422 },
            )
          }

          if (authError.message?.includes("email_address_invalid")) {
            return NextResponse.json(
              {
                error: "Invalid email address",
                details: authError.message,
              },
              { status: 422 },
            )
          }

          return NextResponse.json(
            {
              error: "Failed to update auth user",
              details: authError.message || "Unknown auth error",
            },
            { status: 400 },
          )
        }

        console.log("✅ Auth user updated successfully:", authUser.user.id)
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
    }

    // Update user_profiles table
    console.log("👤 Updating user profile...")

    const profileData: any = {}

    if (userData.name) profileData.name = userData.name.trim()
    if (userData.surname) profileData.surname = userData.surname.trim()
    if (userData.email) profileData.email = userData.email.trim()
    if (userData.role) profileData.role = userData.role
    if (userData.department) profileData.department = userData.department.trim()
    if (userData.pageAccess) profileData.page_access = userData.pageAccess

    // Only update if there's profile data to update
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
              details: profileError.message || "Unknown profile error",
            },
            { status: 400 },
          )
        }

        console.log("✅ User profile updated successfully:", profile.id)
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
    }

    // Send welcome email if requested
    if (userData.sendWelcomeEmail) {
      console.log("📧 Sending welcome email...")

      try {
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
              temporaryPassword: processedPassword || "Password updated - please check with admin",
              companyName: userData.department,
              isClientUser: userData.role === "client",
              isUpdate: true,
            }),
          },
        )

        if (emailResponse.ok) {
          console.log("✅ Welcome email sent successfully")
        } else {
          const emailError = await emailResponse.text()
          console.warn("⚠️ Welcome email failed to send:", emailError)
        }
      } catch (emailError) {
        console.warn("⚠️ Error sending welcome email:", emailError)
      }
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
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
