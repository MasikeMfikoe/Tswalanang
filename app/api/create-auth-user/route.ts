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
    const { email, password, userData } = await request.json()

    console.log("🔐 Creating auth user with service role key...")
    console.log("Email:", email)
    console.log("User data:", userData)

    // Create the auth user first
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: userData.name,
        surname: userData.surname,
        role: userData.role,
      },
    })

    if (authError) {
      console.error("❌ Auth user creation failed:", authError)
      return NextResponse.json({ error: "Failed to create auth user", details: authError }, { status: 400 })
    }

    console.log("✅ Auth user created:", authUser.user.id)

    // Now create the user profile with the auth user's ID
    const profileData = {
      id: authUser.user.id, // Use the actual auth user ID
      username: userData.username,
      name: userData.name,
      surname: userData.surname,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      page_access: userData.page_access,
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .insert(profileData)
      .select()
      .single()

    if (profileError) {
      console.error("❌ Profile creation failed:", profileError)

      // Clean up: delete the auth user if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)

      return NextResponse.json({ error: "Failed to create user profile", details: profileError }, { status: 400 })
    }

    console.log("✅ User profile created:", profile)

    return NextResponse.json({
      success: true,
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        profile: profile,
      },
    })
  } catch (error) {
    console.error("❌ API route error:", error)
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 })
  }
}
