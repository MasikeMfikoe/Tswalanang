import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabaseClient"
import { generateTemporaryPassword } from "@/lib/password-utils"
// import { emailService } from "@/lib/email-service" // This import will be removed

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient()

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting user creation process...")

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL")
      return NextResponse.json({ error: "Server configuration error: Missing Supabase URL" }, { status: 500 })
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
    if (!email || !userData) {
      console.error("❌ Missing required fields:", { email: !!email, userData: !!userData })
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: { email: !!email, userData: !!userData },
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
      const { data: existing, error: fetchError } = await supabaseAdmin.auth.admin.getUserByEmail(email)

      if (!fetchError && existing?.user) {
        existingAuthUser = existing.user
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
          password: password || generateTemporaryPassword(),
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
              const { data: retryExisting } = await supabaseAdmin.auth.admin.getUserByEmail(email)
              if (retryExisting?.user) {
                existingAuthUser = retryExisting.user
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
      first_name: userData.name,
      last_name: userData.surname,
      email: email,
      role: userData.role,
      department: userData.department,
      page_access: userData.page_access || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      customer_id: userData.customerId || null, // Link to customer if it's a client user
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

      // Removed Mailgun email sending logic
      // const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || "TSW Smartlog"
      // const emailSent = await emailService.sendEmail({
      //   to: email,
      //   subject: isClientUser ? `Welcome to ${companyName} Client Portal!` : `Welcome to TSW Smartlog, ${firstName}!`,
      //   html: isClientUser
      //     ? `
      //       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      //         <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
      //           <h1 style="color: #333;">Welcome to ${companyName} Client Portal!</h1>
      //         </div>
      //         <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
      //           <p>Hello ${userData.name} ${userData.surname},</p>
      //           <p>Welcome to the ${companyName} Client Portal! You can now log in to manage your orders and track shipments.</p>
      //           <p>Your login credentials are:</p>
      //           <p><strong>Email:</strong> ${email}</p>
      //           <p><strong>Temporary Password:</strong> ${password || generateTemporaryPassword()}</p>
      //           <p>Please log in and change your password as soon as possible.</p>
      //           <div style="text-align: center; margin: 20px 0;">
      //             <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
      //               Go to Client Portal
      //             </a>
      //           </div>
      //           <p>If you have any questions, please contact our support team.</p>
      //           <p>Thank you,<br>${companyName} Team</p>
      //         </div>
      //         <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
      //           <p>This is an automated message. Please do not reply to this email.</p>
      //         </div>
      //       </div>
      //     `
      //     : `
      //       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      //         <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
      //           <h1 style="color: #333;">Welcome to TSW Smartlog!</h1>
      //         </div>
      //         <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
      //           <p>Hello ${userData.name} ${userData.surname},</p>
      //           <p>Welcome to TSW Smartlog! Your account has been created.</p>
      //           <p>Your login credentials are:</p>
      //           <p><strong>Email:</strong> ${email}</p>
      //           <p><strong>Temporary Password:</strong> ${password || generateTemporaryPassword()}</p>
      //           <p>Please log in and change your password as soon as possible.</p>
      //           <div style="text-align: center; margin: 20px 0;">
      //             <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
      //               Go to TSW Smartlog
      //             </a>
      //           </div>
      //           <p>If you have any questions, please contact your administrator.</p>
      //           <p>Thank you,<br>TSW Smartlog Team</p>
      //         </div>
      //         <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
      //           <p>This is an automated message. Please do not reply to this email.</p>
      //         </div>
      //       </div>
      //     `,
      // })

      // if (!emailSent) {
      //   console.warn(`Failed to send welcome email for user ${email}.`)
      // }

      return NextResponse.json(
        {
          success: true,
          user: {
            id: finalUser.id,
            email: finalUser.email,
            profile: profile || profilePayload,
          },
          message: existingAuthUser ? "User profile created for existing auth user" : "User created successfully",
        },
        { status: 201 },
      )
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
