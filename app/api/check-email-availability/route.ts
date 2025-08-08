import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      return NextResponse.json({ error: "Server configuration error: Missing Supabase URL" }, { status: 500 })
    }

    if (!supabaseServiceKey) {
      return NextResponse.json({ error: "Server configuration error: Missing service role key" }, { status: 500 })
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if email exists in auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserByEmail(email)

    if (authError && authError.message !== "User not found") {
      console.error("Error checking auth user:", authError)
      return NextResponse.json({ error: "Failed to check email availability" }, { status: 500 })
    }

    // Check if email exists in user_profiles
    const { data: profileUser, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("email")
      .eq("email", email)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 is "not found" error
      console.error("Error checking profile user:", profileError)
      return NextResponse.json({ error: "Failed to check email availability" }, { status: 500 })
    }

    const isAvailable = !authUser?.user && !profileUser

    return NextResponse.json({
      available: isAvailable,
      message: isAvailable ? "Email is available" : "Email is already in use",
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
