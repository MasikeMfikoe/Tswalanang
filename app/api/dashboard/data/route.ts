import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Dashboard API: Fetching all dashboard data")

    // Fetch all data in parallel using service role client
    const [ordersResult, customersResult, documentsResult, notificationsResult] = await Promise.all([
      supabaseAdmin.from("orders").select("*"),
      supabaseAdmin.from("customers").select("*"),
      supabaseAdmin.from("documents").select("*"),
      supabaseAdmin.from("notifications").select("*").order("created_at", { ascending: false }),
    ])

    console.log("[v0] Dashboard API: Orders result:", ordersResult.data?.length || 0, "records")
    console.log("[v0] Dashboard API: Customers result:", customersResult.data?.length || 0, "records")
    console.log("[v0] Dashboard API: Documents result:", documentsResult.data?.length || 0, "records")
    console.log("[v0] Dashboard API: Notifications result:", notificationsResult.data?.length || 0, "records")

    // Check for errors
    if (ordersResult.error) {
      console.error("[v0] Dashboard API: Orders error:", ordersResult.error)
    }
    if (customersResult.error) {
      console.error("[v0] Dashboard API: Customers error:", customersResult.error)
    }
    if (documentsResult.error) {
      console.error("[v0] Dashboard API: Documents error:", documentsResult.error)
    }
    if (notificationsResult.error) {
      console.error("[v0] Dashboard API: Notifications error:", notificationsResult.error)
    }

    return NextResponse.json({
      success: true,
      data: {
        orders: ordersResult.data || [],
        customers: customersResult.data || [],
        documents: documentsResult.data || [],
        notifications: notificationsResult.data || [],
      },
      errors: {
        orders: ordersResult.error?.message || null,
        customers: customersResult.error?.message || null,
        documents: documentsResult.error?.message || null,
        notifications: notificationsResult.error?.message || null,
      },
    })
  } catch (error) {
    console.error("[v0] Dashboard API: Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
