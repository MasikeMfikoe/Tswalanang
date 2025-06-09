import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Mock users data (same as in AuthContext)
const MOCK_USERS = [
  {
    id: "mock-user-id",
    username: "demo",
    name: "Demo",
    surname: "User",
    role: "admin",
    department: "IT",
    pageAccess: ["dashboard", "orders", "customers", "documents", "deliveries", "courierOrders", "shipmentTracker"],
    email: "demo@tswsmartlog.com",
    password: "demo",
  },
  {
    id: "mock-tracking-id",
    username: "tracking",
    name: "Tracking",
    surname: "User",
    role: "guest",
    department: "Client",
    pageAccess: ["shipmentTracker"],
    email: "tracking@client.com",
    password: "tracking",
  },
  {
    id: "mock-manager-id",
    username: "manager",
    name: "John",
    surname: "Manager",
    role: "manager",
    department: "Operations",
    pageAccess: ["dashboard", "orders", "customers", "deliveries"],
    email: "john.manager@tswsmartlog.com",
    password: "manager",
  },
  {
    id: "mock-employee-id",
    username: "employee",
    name: "Jane",
    surname: "Employee",
    role: "employee",
    department: "Customer Service",
    pageAccess: ["dashboard", "orders"],
    email: "jane.employee@tswsmartlog.com",
    password: "employee",
  },
  {
    id: "client-user-1",
    username: "client1",
    name: "Alice",
    surname: "Johnson",
    role: "client",
    department: "ABC Company",
    pageAccess: ["clientPortal", "shipmentTracker"],
    email: "alice.johnson@abccompany.com",
    password: "client1",
  },
  {
    id: "client-user-2",
    username: "client2",
    name: "Bob",
    surname: "Smith",
    role: "client",
    department: "XYZ Corp",
    pageAccess: ["clientPortal", "shipmentTracker"],
    email: "bob.smith@xyzcorp.com",
    password: "client2",
  },
]

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Starting mock data sync to Supabase...")

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const mockUser of MOCK_USERS) {
      try {
        console.log(`📝 Processing user: ${mockUser.email}`)

        // Step 1: Create or update auth user
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: mockUser.email,
          password: mockUser.password,
          email_confirm: true,
          user_metadata: {
            name: `${mockUser.name} ${mockUser.surname}`,
            role: mockUser.role,
          },
        })

        if (authError && !authError.message.includes("already registered")) {
          console.error(`❌ Auth user creation failed for ${mockUser.email}:`, authError)
          results.push({
            email: mockUser.email,
            status: "error",
            error: `Auth creation failed: ${authError.message}`,
          })
          errorCount++
          continue
        }

        // Use the existing user ID if user already exists
        const userId = authUser?.user?.id || mockUser.id

        console.log(`✅ Auth user processed for ${mockUser.email}, ID: ${userId}`)

        // Step 2: Create or update user profile
        const profileData = {
          id: userId,
          username: mockUser.username,
          name: mockUser.name,
          surname: mockUser.surname,
          email: mockUser.email,
          role: mockUser.role,
          department: mockUser.department,
          page_access: mockUser.pageAccess,
        }

        const { data: profile, error: profileError } = await supabaseAdmin
          .from("user_profiles")
          .upsert(profileData, { onConflict: "id" })
          .select()
          .single()

        if (profileError) {
          console.error(`❌ Profile creation failed for ${mockUser.email}:`, profileError)
          results.push({
            email: mockUser.email,
            status: "error",
            error: `Profile creation failed: ${profileError.message}`,
          })
          errorCount++
          continue
        }

        console.log(`✅ Profile created/updated for ${mockUser.email}`)

        results.push({
          email: mockUser.email,
          status: "success",
          authUserId: userId,
          profile: profile,
        })
        successCount++
      } catch (userError) {
        console.error(`❌ Error processing user ${mockUser.email}:`, userError)
        results.push({
          email: mockUser.email,
          status: "error",
          error: `Processing failed: ${userError}`,
        })
        errorCount++
      }
    }

    console.log(`🎉 Sync completed: ${successCount} success, ${errorCount} errors`)

    return NextResponse.json({
      success: true,
      message: `Mock data sync completed: ${successCount} users synced, ${errorCount} errors`,
      results: results,
      summary: {
        total: MOCK_USERS.length,
        success: successCount,
        errors: errorCount,
      },
    })
  } catch (error) {
    console.error("❌ Sync API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to sync mock data",
        details: error,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Checking current sync status...")

    // Check how many users exist in Supabase
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("user_profiles")
      .select("id, email, name, surname, role")
      .order("role", { ascending: true })

    if (profilesError) {
      throw profilesError
    }

    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      throw authError
    }

    return NextResponse.json({
      success: true,
      mockUsers: MOCK_USERS.length,
      supabaseProfiles: profiles?.length || 0,
      supabaseAuthUsers: authUsers?.users?.length || 0,
      profiles: profiles,
      needsSync: profiles?.length !== MOCK_USERS.length,
    })
  } catch (error) {
    console.error("❌ Status check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check sync status",
        details: error,
      },
      { status: 500 },
    )
  }
}
