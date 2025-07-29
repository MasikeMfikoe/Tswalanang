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

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting user creation process...")

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL")
      return NextResponse.json({ error: "Server configuration error: Missing Supabase URL" }, { status: 500 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY")
      return NextResponse.json({ error: "Server configuration error: Missing service role key" }, { status: 500 })
    }

    // Parse request body
    let requestData
    try {
      requestData = await request.json()
      console.log("📝 Request data received:", {
        email: requestData.email,
        hasPassword: !!requestData.password,
        userData: requestData.userData ? Object.keys(requestData.userData) : "missing",
      })
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { email, password, userData } = requestData

    // Validate required fields
    if (!email || !password || !userData) {
      console.error("❌ Missing required fields:", { email: !!email, password: !!password, userData: !!userData })
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: { email: !!email, password: !!password, userData: !!userData },
        },
        { status: 400 },
      )
    }

    // Validate userData fields
    const requiredUserFields = ["name", "surname", "role", "department"]
    const missingFields = requiredUserFields.filter((field) => !userData[field])
    if (missingFields.length > 0) {
      console.error("❌ Missing user data fields:", missingFields)
      return NextResponse.json(
        {
          error: "Missing user data fields",
          details: { missingFields },
        },
        { status: 400 },
      )
    }

    console.log("✅ All required fields present, proceeding with user creation...")

    // 1️⃣ Try to create auth user
    console.log("🔐 Creating auth user...")
    let authUser, authError

    try {
      const authResult = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          surname: userData.surname,
          role: userData.role,
        },
      })

      authUser = authResult.data
      authError = authResult.error

      if (authError) {
        console.error("❌ Auth user creation error:", authError)
      } else {
        console.log("✅ Auth user created successfully:", authUser?.user?.id)
      }
    } catch (createError) {
      console.error("❌ Exception during auth user creation:", createError)
      authError = createError
    }

    // 2️⃣ Handle existing email case
    if (authError?.message?.includes("already registered") || authError?.message?.includes("email_exists")) {
      console.log("⚠️ Email already exists, attempting to fetch existing user...")

      try {
        const { data: existing, error: fetchError } = await supabaseAdmin.auth.admin.getUserByEmail(email)

        if (fetchError) {
          console.error("❌ Failed to fetch existing user:", fetchError)
          return NextResponse.json(
            {
              error: "Email already exists and could not be retrieved",
              details: fetchError,
            },
            { status: 422 },
          )
        }

        if (!existing?.user) {
          console.error("❌ Existing user not found despite email conflict")
          return NextResponse.json(
            {
              error: "Email conflict but user not found",
            },
            { status: 422 },
          )
        }

        authUser = { user: existing.user }
        authError = null
        console.log("✅ Using existing auth user:", existing.user.id)
      } catch (fetchException) {
        console.error("❌ Exception while fetching existing user:", fetchException)
        return NextResponse.json(
          {
            error: "Failed to handle existing email",
            details: fetchException,
          },
          { status: 500 },
        )
      }
    } else if (authError) {
      console.error("❌ Auth creation failed with error:", authError)
      return NextResponse.json(
        {
          error: "Failed to create auth user",
          details: authError,
        },
        { status: 400 },
      )
    }

    if (!authUser?.user) {
      console.error("❌ No auth user returned")
      return NextResponse.json(
        {
          error: "Auth user creation failed - no user returned",
        },
        { status: 500 },
      )
    }

    // 3️⃣ Create/update profile in user_profiles table
    console.log("👤 Creating user profile...")

    const profilePayload = {
      id: authUser.user.id,
      username: userData.username || `${userData.name.toLowerCase()}.${userData.surname.toLowerCase()}`,
      name: userData.name,
      surname: userData.surname,
      email: email,
      role: userData.role,
      department: userData.department,
      page_access: userData.page_access || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("📝 Profile payload:", { ...profilePayload, id: authUser.user.id })

    try {
      // Try insert first, then upsert if conflict
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .upsert(profilePayload, {
          onConflict: "id",
          ignoreDuplicates: false,
        })
        .select()
        .single()

      if (profileError) {
        console.error("❌ Profile creation error:", profileError)

        // If profile creation fails, we should clean up the auth user
        try {
          await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
          console.log("🧹 Cleaned up auth user after profile failure")
        } catch (cleanupError) {
          console.error("❌ Failed to cleanup auth user:", cleanupError)
        }

        return NextResponse.json(
          {
            error: "Failed to create user profile",
            details: profileError,
          },
          { status: 500 },
        )
      }

      console.log("✅ User profile created successfully:", profile?.id)

      return NextResponse.json({
        success: true,
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
          profile: profile || profilePayload,
        },
        message: "User created successfully",
      })
    } catch (profileException) {
      console.error("❌ Exception during profile creation:", profileException)

      // Cleanup auth user
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
        console.log("🧹 Cleaned up auth user after profile exception")
      } catch (cleanupError) {
        console.error("❌ Failed to cleanup auth user:", cleanupError)
      }

      return NextResponse.json(
        {
          error: "Exception during profile creation",
          details: profileException,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Unexpected error in create-auth-user:", error)

    // Return detailed error information for debugging
    return NextResponse.json(
      {
        error: "Internal server error",
        details: {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          type: typeof error,
        },
      },
      { status: 500 },
    )
  }
}
