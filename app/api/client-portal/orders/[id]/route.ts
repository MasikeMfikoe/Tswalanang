import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ success: false, message: "User ID is required." }, { status: 400 })
  }

  try {
    // 1. Get user profile to determine role and customer_id
    const { data: userProfile, error: userProfileError } = await supabase
      .from("user_profiles")
      .select("role, customer_id, email")
      .eq("id", userId)
      .single()

    if (userProfileError || !userProfile) {
      console.error("Error fetching user profile:", userProfileError?.message || "Profile not found")
      return NextResponse.json({ success: false, message: "User profile not found or access denied." }, { status: 404 })
    }

    const isAdmin = userProfile.role === "admin"
    let customerId: string | null = userProfile.customer_id
    let customerName: string | null = null

    // 2. If not admin, and customer_id is not directly set, try to infer from email domain
    if (!isAdmin && !customerId && userProfile.email) {
      const emailDomain = userProfile.email.split("@")[1]
      if (emailDomain) {
        const { data: customersByEmail, error: customersByEmailError } = await supabase
          .from("customers")
          .select("id, name")
          .ilike("email", `%@${emailDomain}`)
          .limit(1) // Limit to 1 to avoid multiple rows error

        if (customersByEmailError) {
          console.error("Error inferring customer from email domain:", customersByEmailError.message)
          // Do not return error here, continue with null customerId/Name
        } else if (customersByEmail && customersByEmail.length > 0) {
          customerId = customersByEmail[0].id
          customerName = customersByEmail[0].name
          // Optionally, update user_profile with customer_id for future direct access
          await supabase.from("user_profiles").update({ customer_id: customerId }).eq("id", userId)
        }
      }
    } else if (isAdmin && userProfile.customer_id) {
      // If admin and has a customer_id (e.g., admin viewing a specific client's portal)
      // This case might not be strictly necessary for fetching ALL orders, but good for consistency
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("name")
        .eq("id", userProfile.customer_id)
        .single()
      if (!customerError && customerData) {
        customerName = customerData.name
      }
    } else if (!isAdmin && customerId) {
      // If client and customer_id is directly set
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("name")
        .eq("id", customerId)
        .single()
      if (!customerError && customerData) {
        customerName = customerData.name
      }
    }

    let query = supabase.from("orders").select("*").eq("id", id)

    // 3. Apply filtering based on user role
    if (!isAdmin) {
      if (!customerName) {
        console.warn(`No customer name found for user ${userId}. Cannot filter orders.`)
        return NextResponse.json(
          { success: false, message: "Could not identify associated customer." },
          { status: 403 },
        )
      }
      query = query.eq("customer_name", customerName)
    }

    const { data: order, error: orderError } = await query.single()

    if (orderError) {
      console.error("Error fetching order:", orderError.message)
      if (orderError.code === "PGRST116") {
        // No rows found
        return NextResponse.json(
          { success: false, message: "Order not found or you do not have permission to view it." },
          { status: 404 },
        )
      }
      return NextResponse.json({ success: false, message: "Failed to retrieve order details." }, { status: 500 })
    }

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error("Unhandled error in GET /api/client-portal/orders/[id]:", error)
    return NextResponse.json({ success: false, message: "Internal server error." }, { status: 500 })
  }
}
