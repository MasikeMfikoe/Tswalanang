// app/api/courier-orders/[id]/notifications/route.ts
import { NextResponse } from "next/server"
import type { RouteContext } from "next"
import { courierOrdersApi } from "@/lib/api/courierOrdersApi"

// Notifications temporarily disabled: we only verify the order exists.
export async function GET(_req: Request, ctx: RouteContext<{ id: string }>) {
  try {
    const orderId = ctx.params.id

    // Ensure the order exists; otherwise return 404
    const orderResponse = await courierOrdersApi.getCourierOrder(orderId)
    if (!orderResponse.success || !orderResponse.data) {
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
