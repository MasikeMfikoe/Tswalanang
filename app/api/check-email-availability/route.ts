import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Ensure environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json(
        {
          isAvailable: false,
          error: "Server configuration error",
        },
        { status: 500 },
      )
    }

    // Create a Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check in Supabase auth users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserByEmail(email)

    if (authError && !authError.message.includes("User not found")) {
      console.error("Error checking email in auth:", authError)
      return NextResponse.json(
        {
          isAvailable: false,
          error: "Unable to verify email availability",
        },
        { status: 500 },
      )
    }

    if (authUser?.user) {
      return NextResponse.json({
        isAvailable: false,
        error: "Email already exists",
      })
    }

    // Also check in user_profiles table
    const { data: profileUser, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("email")
      .eq("email", email)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error checking email in profiles:", profileError)
      return NextResponse.json(
        {
          isAvailable: false,
          error: "Unable to verify email availability",
        },
        { status: 500 },
      )
    }

    if (profileUser) {
      return NextResponse.json({
        isAvailable: false,
        error: "Email already exists",
      })
    }

    return NextResponse.json({
      isAvailable: true,
    })
  } catch (error) {
    console.error("Email availability check failed:", error)
    return NextResponse.json(
      {
        isAvailable: false,
        error: "Unable to verify email availability",
      },
      { status: 500 },
    )
  }
}
