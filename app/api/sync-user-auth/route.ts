import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting user auth sync process...")

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[v0] Missing Supabase environment variables")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const { email, password, userId } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    console.log(`[v0] Syncing auth for user: ${email}`)

    // Step 1: Check if user exists in user_profiles
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("email", email)
      .single()

    if (profileError || !userProfile) {
      console.log(`[v0] User profile not found for ${email}`)
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    console.log(`[v0] Found user profile:`, {
      id: userProfile.id,
      email: userProfile.email,
      role: userProfile.role,
      first_name: userProfile.first_name,
    })

    // Step 2: Check if user exists in auth.users using service role client
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      console.error(`[v0] Error checking auth users:`, authError)
      return NextResponse.json({ error: "Failed to check auth users" }, { status: 500 })
    }

    const existingAuthUser = authUsers.users.find((user) => user.email === email)

    if (existingAuthUser) {
      console.log(`[v0] Auth user exists, updating password...`)

      try {
        // First try updating with minimal data
        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingAuthUser.id,
          {
            password: password || "TempPass123!",
            email_confirm: true,
          },
        )

        if (updateError) {
          console.error(`[v0] Error updating auth user (attempt 1):`, updateError)

          // Try alternative approach - delete and recreate if update fails
          console.log(`[v0] Attempting to recreate auth user...`)

          // Delete existing auth user
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(existingAuthUser.id)

          if (deleteError) {
            console.error(`[v0] Error deleting auth user:`, deleteError)
            return NextResponse.json({ error: "Failed to update auth user" }, { status: 500 })
          }

          // Create new auth user
          const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password || "TempPass123!",
            email_confirm: true,
            user_metadata: {
              first_name: userProfile.first_name,
              last_name: userProfile.surname,
              role: userProfile.role,
            },
          })

          if (createError) {
            console.error(`[v0] Error recreating auth user:`, createError)
            return NextResponse.json({ error: "Failed to recreate auth user" }, { status: 500 })
          }

          if (!createData.user) {
            return NextResponse.json({ error: "No user data returned from recreation" }, { status: 500 })
          }

          // Update user_profiles with new user_id
          const { error: profileUpdateError } = await supabaseAdmin
            .from("user_profiles")
            .update({ user_id: createData.user.id })
            .eq("email", email)

          if (profileUpdateError) {
            console.error(`[v0] Error updating user profile after recreation:`, profileUpdateError)
          }

          console.log(`[v0] Successfully recreated auth user`)
          return NextResponse.json({
            success: true,
            message: "Auth user recreated successfully",
            userId: createData.user.id,
          })
        }

        // Update user_profiles with correct user_id
        const { error: profileUpdateError } = await supabaseAdmin
          .from("user_profiles")
          .update({ user_id: existingAuthUser.id })
          .eq("email", email)

        if (profileUpdateError) {
          console.error(`[v0] Error updating user profile:`, profileUpdateError)
        }

        console.log(`[v0] Successfully updated existing auth user`)
        return NextResponse.json({
          success: true,
          message: "Auth user updated successfully",
          userId: existingAuthUser.id,
        })
      } catch (syncError) {
        console.error(`[v0] Unexpected error during auth sync:`, syncError)
        return NextResponse.json({ error: "Auth sync failed unexpectedly" }, { status: 500 })
      }
    } else {
      console.log(`[v0] Creating new auth user...`)

      // Create new auth user
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password || "TempPass123!",
        email_confirm: true,
        user_metadata: {
          first_name: userProfile.first_name,
          last_name: userProfile.surname,
          role: userProfile.role,
        },
      })

      if (createError) {
        console.error(`[v0] Error creating auth user:`, createError)
        return NextResponse.json({ error: "Failed to create auth user" }, { status: 500 })
      }

      if (!createData.user) {
        return NextResponse.json({ error: "No user data returned" }, { status: 500 })
      }

      // Update user_profiles with correct user_id
      const { error: profileUpdateError } = await supabaseAdmin
        .from("user_profiles")
        .update({ user_id: createData.user.id })
        .eq("email", email)

      if (profileUpdateError) {
        console.error(`[v0] Error updating user profile:`, profileUpdateError)
      }

      console.log(`[v0] Successfully created new auth user`)
      return NextResponse.json({
        success: true,
        message: "Auth user created successfully",
        userId: createData.user.id,
      })
    }
  } catch (error) {
    console.error("[v0] User sync error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
