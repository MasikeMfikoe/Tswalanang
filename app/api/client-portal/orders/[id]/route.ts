import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// ✅ Next 15: params is async → type as Promise<...> and await it
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ success: false, message: "User ID is required." }, { status: 400 })
  }

  try {
    // 1) Load user profile
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

    // 2) Infer customer by email domain (non-admins) if missing
    if (!isAdmin && !customerId && userProfile.email) {
      const emailDomain = userProfile.email.split("@")[1]
      if (emailDomain) {
        const { data: customersByEmail, error: customersByEmailError } = await supabase
          .from("customers")
          .select("id, name")
          .ilike("email", `%@${emailDomain}`)
          .limit(1)

        if (customersByEmailError) {
          console.error("Error inferring customer from email domain:", customersByEmailError.message)
        } else if (customersByEmail?.length) {
          customerId = customersByEmail[0].id
          customerName = customersByEmail[0].name
          // Best-effort update; ignore result
          await supabase.from("user_profiles").update({ customer_id: customerId }).eq("id", userId)
        }
      }
    } else if (isAdmin && userProfile.customer_id) {
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("name")
        .eq("id", userProfile.customer_id)
        .single()
      if (!customerError && customerData) customerName = customerData.name
    } else if (!isAdmin && customerId) {
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("name")
        .eq("id", customerId)
        .single()
      if (!customerError && customerData) customerName = customerData.name
    }

    // 3) Build order query
    let query = supabase.from("orders").select("*").eq("id", id)

    // Apply role-based filter
    if (!isAdmin) {
      if (!customerName) {
        console.warn(`No customer name found for user ${userId}. Cannot filter orders.`)
        return NextResponse.json(
          { success: false, message: "Could not identify associated customer." },
          { status: 403 }
        )
      }
      query = query.eq("customer_name", customerName)
    }

    const { data: order, error: orderError } = await query.single()

    if (orderError) {
      console.error("Error fetching order:", orderError.message)
      if ((orderError as any).code === "PGRST116") {
        return NextResponse.json(
          { success: false, message: "Order not found or you do not have permission to view it." },
          { status: 404 }
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
