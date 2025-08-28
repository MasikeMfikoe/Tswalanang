import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    console.log(`[v0] Creating user with data:`, { email: userData.email, role: userData.role })

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[v0] Missing Supabase environment variables")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log(`[v0] Step 1: Checking for existing users...`)
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error("[v0] Error checking existing users:", listError)
      return NextResponse.json({ error: `Failed to check existing users: ${listError.message}` }, { status: 400 })
    }

    const existingUser = existingUsers.users.find((user) => user.email === userData.email)
    let userId: string

    if (existingUser) {
      console.log(`[v0] Step 2a: User ${userData.email} already exists in auth, using existing ID: ${existingUser.id}`)
      userId = existingUser.id
    } else {
      console.log(`[v0] Step 2b: Creating new auth user for ${userData.email}`)

      const createUserPayload = {
        email: userData.email,
        password: userData.password || "TempPassword123!",
        email_confirm: true,
      }
      console.log(`[v0] 🔍 Auth user creation payload:`, {
        email: createUserPayload.email,
        hasPassword: !!createUserPayload.password,
      })

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser(createUserPayload)

      if (authError) {
        console.error("[v0] ❌ Detailed auth error:", {
          message: authError.message,
          status: authError.status,
          name: authError.name,
          cause: authError.cause,
        })
        return NextResponse.json({ error: `Failed to create auth user: ${authError.message}` }, { status: 400 })
      }

      if (!authData || !authData.user) {
        console.error("[v0] ❌ Auth user creation returned no data")
        return NextResponse.json({ error: "Auth user creation failed - no user data returned" }, { status: 400 })
      }

      userId = authData.user.id
      console.log(`[v0] ✅ Created new auth user with ID: ${userId}`)
    }

    console.log(`[v0] Step 3: Checking for existing user profile with ID: ${userId}`)
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from("user_profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (profileCheckError && profileCheckError.code !== "PGRST116") {
      console.error("[v0] Error checking user profile:", profileCheckError)
      return NextResponse.json(
        { error: `Database error checking profile: ${profileCheckError.message}` },
        { status: 400 },
      )
    }

    const profileData = {
      email: userData.email,
      full_name: userData.name || userData.email.split("@")[0],
      surname: userData.surname || "",
      role: userData.role,
      department: userData.department || "",
      page_access: userData.pageAccess || [],
      updated_at: new Date().toISOString(),
    }

    console.log(`[v0] Step 4: Profile data prepared:`, profileData)

    if (existingProfile) {
      console.log(`[v0] Step 5a: Updating existing user profile for ${userData.email}`)
      const { error: updateError } = await supabaseAdmin.from("user_profiles").update(profileData).eq("id", userId)

      if (updateError) {
        console.error("[v0] Error updating user profile:", updateError)
        return NextResponse.json({ error: `Database error updating profile: ${updateError.message}` }, { status: 400 })
      }

      console.log(`[v0] ✅ Updated user profile for ${userData.email}`)
    } else {
      console.log(`[v0] Step 5b: Creating new user profile for ${userData.email}`)
      const { error: profileError } = await supabaseAdmin.from("user_profiles").insert({
        id: userId,
        ...profileData,
      })

      if (profileError) {
        console.error("[v0] Error creating user profile:", profileError)
        console.error("[v0] Profile data that failed:", { id: userId, ...profileData })
        return NextResponse.json({ error: `Database error creating profile: ${profileError.message}` }, { status: 400 })
      }

      console.log(`[v0] ✅ Created user profile for ${userData.email}`)
    }

    console.log(`[v0] ✅ User creation completed successfully for ${userData.email}`)
    return NextResponse.json({
      success: true,
      user: { id: userId, email: userData.email },
      message: existingUser ? "User profile updated successfully" : "User created successfully",
    })
  } catch (error) {
    console.error("[v0] ❌ Unexpected error in user creation API:", error)
    return NextResponse.json({ error: `Database error creating new user` }, { status: 500 })
  }
}
