// Bulk Password Reset Script
// Resets passwords for all users except demo user to: ...Tswa@#2025...

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const NEW_PASSWORD = "...Tswa@#2025..."
const DEMO_EMAIL = "demo@tswsmartlog.com"

// Create admin client with service role key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function resetUserPasswords() {
  try {
    console.log("🔄 Starting bulk password reset...")

    // Get all users from Supabase Auth
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error("❌ Error fetching users:", listError)
      return
    }

    const users = usersData.users
    console.log(`📊 Found ${users.length} total users`)

    let updatedCount = 0
    let skippedCount = 0

    for (const user of users) {
      // Skip demo user
      if (user.email === DEMO_EMAIL) {
        console.log(`⏭️ Skipping demo user: ${user.email}`)
        skippedCount++
        continue
      }

      try {
        // Update password for non-demo users
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
          password: NEW_PASSWORD,
        })

        if (updateError) {
          console.error(`❌ Failed to update password for ${user.email}:`, updateError)
        } else {
          console.log(`✅ Updated password for: ${user.email}`)
          updatedCount++
        }
      } catch (error) {
        console.error(`❌ Error updating ${user.email}:`, error)
      }
    }

    console.log("\n📈 Password Reset Summary:")
    console.log(`✅ Successfully updated: ${updatedCount} users`)
    console.log(`⏭️ Skipped (demo user): ${skippedCount} users`)
    console.log(`❌ Failed: ${users.length - updatedCount - skippedCount} users`)
    console.log("\n🔐 New password for all users (except demo): ...Tswa@#2025...")
  } catch (error) {
    console.error("❌ Script execution failed:", error)
  }
}

// Execute the password reset
resetUserPasswords()
