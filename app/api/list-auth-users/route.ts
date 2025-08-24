import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Listing all auth users...")

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      console.error("[v0] Error listing auth users:", authError)
      return NextResponse.json({ error: "Failed to list auth users", details: authError.message }, { status: 500 })
    }

    const { data: userProfiles, error: profileError } = await supabaseAdmin.from("user_profiles").select("*")

    if (profileError) {
      console.error("[v0] Error listing user profiles:", profileError)
      return NextResponse.json(
        { error: "Failed to list user profiles", details: profileError.message },
        { status: 500 },
      )
    }

    const authUsersList = authUsers.users.map((user) => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      raw_user_meta_data: user.raw_user_meta_data,
    }))

    const userProfilesList =
      userProfiles?.map((profile) => ({
        id: profile.id,
        user_id: profile.user_id,
        email: profile.email,
        first_name: profile.first_name,
        surname: profile.surname,
        role: profile.role,
        department: profile.department,
      })) || []

    console.log(`[v0] Found ${authUsersList.length} auth users and ${userProfilesList.length} user profiles`)

    return NextResponse.json({
      success: true,
      auth_users: authUsersList,
      user_profiles: userProfilesList,
      summary: {
        total_auth_users: authUsersList.length,
        total_user_profiles: userProfilesList.length,
      },
    })
  } catch (error) {
    console.error("[v0] Error in list-auth-users API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
