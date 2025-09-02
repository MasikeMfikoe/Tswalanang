// app/api/courier-orders/[id]/notifications/route.ts
import { NextResponse } from "next/server"
import { courierOrdersApi } from "@/lib/api/courierOrdersApi"

// Notifications disabled for now: we just ensure the order exists and return []
export async function GET(_req: Request, context: any) {
  try {
    const orderId = context?.params?.id as string | undefined
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Missing order id" },
        { status: 400 }
      )
    }

    // Ensure the order exists
    const orderResponse = await courierOrdersApi.getCourierOrder(orderId)
    if (!orderResponse?.success || !orderResponse.data) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      )
    }

    // Return empty notifications for now
    return NextResponse.json({ success: true, data: [] })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
