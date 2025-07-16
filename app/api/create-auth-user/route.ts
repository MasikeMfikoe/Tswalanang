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

    // 1️⃣ try to create auth user
    let { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: userData.name,
        surname: userData.surname,
        role: userData.role,
      },
    })

    // 2️⃣ if the email already exists, fetch the existing user
    if (authError?.code === "email_exists") {
      const { data: existing, error: fetchError } = await supabaseAdmin.auth.admin.getUserByEmail(email)
      if (fetchError || !existing?.user) {
        return NextResponse.json({ error: "Email already exists and could not be fetched" }, { status: 422 })
      }
      authUser = { user: existing.user }
      authError = null
    } else if (authError) {
      return NextResponse.json({ error: "Failed to create auth user", details: authError }, { status: 400 })
    }

    // 3️⃣ ensure profile row exists
    const profilePayload = {
      id: authUser!.user.id,
      username: userData.username,
      name: userData.name,
      surname: userData.surname,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      page_access: userData.page_access,
    }

    // Try insert; on conflict just return existing row
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .upsert(profilePayload, { onConflict: "id", ignoreDuplicates: true })
      .select()
      .single()

    return NextResponse.json({
      success: true,
      user: { id: authUser!.user.id, email: authUser!.user.email, profile },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 })
  }
}
