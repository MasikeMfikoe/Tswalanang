import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error("Error checking existing users:", listError)
      return NextResponse.json({ error: `Failed to check existing users: ${listError.message}` }, { status: 400 })
    }

    const existingUser = existingUsers.users.find((user) => user.email === userData.email)
    let userId: string

    if (existingUser) {
      console.log(`[v0] User ${userData.email} already exists in auth, updating profile`)
      userId = existingUser.id
    } else {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
      })

      if (authError) {
        console.error("Error creating auth user:", authError.message)
        return NextResponse.json({ error: `Failed to create user: ${authError.message}` }, { status: 400 })
      }

      userId = authData.user.id
      console.log(`[v0] Created new auth user for ${userData.email}`)
    }

    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from("user_profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (profileCheckError && profileCheckError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error checking user profile:", profileCheckError)
      return NextResponse.json({ error: `Failed to check user profile: ${profileCheckError.message}` }, { status: 400 })
    }

    if (existingProfile) {
      const { error: updateError } = await supabaseAdmin
        .from("user_profiles")
        .update({
          email: userData.email,
          first_name: userData.name,
          surname: userData.surname,
          role: userData.role,
          department: userData.department,
          page_access: userData.pageAccess || [],
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) {
        console.error("Error updating user profile:", updateError)
        return NextResponse.json({ error: `Failed to update user profile: ${updateError.message}` }, { status: 400 })
      }

      console.log(`[v0] Updated user profile for ${userData.email}`)
    } else {
      const { error: profileError } = await supabaseAdmin.from("user_profiles").insert({
        id: userId,
        email: userData.email,
        first_name: userData.name,
        surname: userData.surname,
        role: userData.role,
        department: userData.department,
        page_access: userData.pageAccess || [],
      })

      if (profileError) {
        console.error("Error creating user profile:", profileError)
        return NextResponse.json({ error: `Failed to create user profile: ${profileError.message}` }, { status: 400 })
      }

      console.log(`[v0] Created user profile for ${userData.email}`)
    }

    return NextResponse.json({
      success: true,
      user: { id: userId, email: userData.email },
      message: existingUser ? "User profile updated successfully" : "User created successfully",
    })
  } catch (error) {
    console.error("Error in user creation API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
