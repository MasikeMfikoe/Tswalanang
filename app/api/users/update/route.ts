import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, email, first_name, surname, role, password } = body as {
      id?: string
      email: string
      first_name?: string
      surname?: string
      role?: string
      password?: string
    }

    console.log(`[v0] 🔄 Updating user: ${email}`)

    // IMPORTANT: Use a non-public URL env var if possible (e.g., SUPABASE_URL)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, // or process.env.SUPABASE_URL
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    )

    // 1) Update your app's profile row
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .update({
        first_name,
        surname,
        full_name: `${first_name ?? ""} ${surname ?? ""}`.trim(),
        role,
      })
      .eq("email", email)
      .select()
      .single()

    if (profileError) {
      console.error("[v0] ❌ Error updating user profile:", profileError)
      return NextResponse.json(
        { error: `Database error updating profile: ${profileError.message}` },
        { status: 500 }
      )
    }

    // 2) If password provided, update the Auth user by ID
    if (password) {
      console.log("[v0] 🔄 Updating password for user:", email)

      // Prefer the id passed in. If missing, try to fetch it from your table.
      let userId = id
      if (!userId) {
        const { data: idRow, error: idErr } = await supabaseAdmin
          .from("user_profiles")
          .select("id")
          .eq("email", email)
          .single()

        if (idErr) {
          console.error("[v0] ❌ Error looking up user id by email:", idErr)
          return NextResponse.json(
            { error: `Database error finding user id: ${idErr.message}` },
            { status: 500 }
          )
        }
        userId = idRow?.id
      }

      if (!userId) {
        console.warn("[v0] ⚠️ No Auth user id found for email:", email)
        // Don’t fail the whole request—just skip the password update
      } else {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { password }
        )

        if (updateError) {
          console.error("[v0] ❌ Error updating auth user password:", updateError)
          return NextResponse.json(
            { error: `Database error updating password: ${updateError.message}` },
            { status: 500 }
          )
        }

        console.log("[v0] ✅ Password updated successfully for user:", email)
      }
    }

    console.log("[v0] ✅ User updated successfully")
    return NextResponse.json({
      message: "User updated successfully",
      user: profileData,
    })
  } catch (error) {
    console.error("[v0] ❌ Error in user update API:", error)
    return NextResponse.json(
      {
        error: `Internal server error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    )
  }
}
