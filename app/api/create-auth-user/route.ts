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

    // 1️⃣ Check if user already exists in auth
    console.log("🔍 Checking if user already exists...")
    let existingAuthUser = null

    try {
      const { data: userList, error: fetchError } = await supabaseAdmin.auth.admin.listUsers()

      if (!fetchError && userList?.users) {
        const existingUser = userList.users.find((user) => user.email === email)
        if (existingUser) {
          existingAuthUser = existingUser
          console.log("⚠️ User already exists in auth:", existingAuthUser.id)

          // Check if user profile exists
          const { data: existingProfile, error: profileError } = await supabaseAdmin
            .from("user_profiles")
            .select("*")
            .eq("id", existingAuthUser.id)
            .single()

          if (!profileError && existingProfile) {
            console.log("⚠️ User profile also exists, returning conflict error")
            return NextResponse.json(
              {
                error: "User already exists",
                details: {
                  message: `A user with email ${email} already exists in the system.`,
                  existingUser: {
                    id: existingProfile.id,
                    name: existingProfile.name,
                    surname: existingProfile.surname,
                    email: existingProfile.email,
                    role: existingProfile.role,
                    department: existingProfile.department,
                  },
                },
              },
              { status: 409 },
            )
          }

          console.log("✅ Auth user exists but no profile, will create profile for existing user")
        }
      }
    } catch (checkError) {
      console.log("🔍 User check failed, proceeding with creation:", checkError)
    }

    let authUser = null

    // 2️⃣ Create auth user if doesn't exist
    if (!existingAuthUser) {
      console.log("🔐 Creating new auth user...")
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

        if (authResult.error) {
          console.error("❌ Auth user creation error:", authResult.error)

          // Handle specific error cases
          if (
            authResult.error.message?.includes("already registered") ||
            authResult.error.message?.includes("email_exists") ||
            authResult.error.code === "email_exists"
          ) {
            // Try to get the existing user one more time
            try {
              const { data: retryUserList } = await supabaseAdmin.auth.admin.listUsers()
              if (retryUserList?.users) {
                const retryExistingUser = retryUserList.users.find((user) => user.email === email)
                if (retryExistingUser) {
                  existingAuthUser = retryExistingUser
                  console.log("✅ Found existing user on retry:", existingAuthUser.id)
                } else {
                  return NextResponse.json(
                    {
                      error: "Email already registered but user not found",
                      details: { message: "This email is already registered but the user cannot be retrieved." },
                    },
                    { status: 409 },
                  )
                }
              }
            } catch (retryError) {
              console.error("❌ Retry fetch failed:", retryError)
              return NextResponse.json(
                {
                  error: "Email already registered",
                  details: { message: "This email is already registered in the system." },
                },
                { status: 409 },
              )
            }
          } else {
            return NextResponse.json(
              {
                error: "Failed to create auth user",
                details: authResult.error,
              },
              { status: 400 },
            )
          }
        } else {
          authUser = authResult.data
          console.log("✅ Auth user created successfully:", authUser?.user?.id)
        }
      } catch (createError) {
        console.error("❌ Exception during auth user creation:", createError)
        return NextResponse.json(
          {
            error: "Exception during auth user creation",
            details: createError,
          },
          { status: 500 },
        )
      }
    }

    // Use existing user if found, otherwise use newly created user
    const finalUser = existingAuthUser || authUser?.user

    if (!finalUser) {
      console.error("❌ No auth user available")
      return NextResponse.json(
        {
          error: "Auth user creation failed - no user available",
        },
        { status: 500 },
      )
    }

    // 3️⃣ Create/update profile in user_profiles table
    console.log("👤 Creating user profile for user:", finalUser.id)

    const profilePayload = {
      id: finalUser.id,
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

    console.log("📝 Profile payload:", { ...profilePayload, id: finalUser.id })

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

        // If profile creation fails and we created a new auth user, clean it up
        if (!existingAuthUser && authUser?.user) {
          try {
            await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
            console.log("🧹 Cleaned up auth user after profile failure")
          } catch (cleanupError) {
            console.error("❌ Failed to cleanup auth user:", cleanupError)
          }
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

      // Send welcome email if requested
      try {
        console.log("📧 Sending welcome email...")
        const welcomeEmailResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-welcome-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userEmail: email,
              userName: userData.name,
              userSurname: userData.surname,
              temporaryPassword: password,
              companyName: userData.role === "client" ? userData.department : "TSW Smartlog",
              isClientUser: userData.role === "client",
            }),
          },
        )

        if (welcomeEmailResponse.ok) {
          console.log("✅ Welcome email sent successfully")
        } else {
          console.error("❌ Failed to send welcome email:", await welcomeEmailResponse.text())
        }
      } catch (emailError) {
        console.error("❌ Error sending welcome email:", emailError)
        // Don't fail user creation if email fails
      }

      return NextResponse.json({
        success: true,
        user: {
          id: finalUser.id,
          email: finalUser.email,
          profile: profile || profilePayload,
        },
        message: existingAuthUser ? "User profile created for existing auth user" : "User created successfully",
      })
    } catch (profileException) {
      console.error("❌ Exception during profile creation:", profileException)

      // Cleanup auth user if we created it
      if (!existingAuthUser && authUser?.user) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
          console.log("🧹 Cleaned up auth user after profile exception")
        } catch (cleanupError) {
          console.error("❌ Failed to cleanup auth user:", cleanupError)
        }
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
