// app/api/courier-orders/[id]/notifications/route.ts
import { NextResponse } from "next/server"
import { courierOrdersApi } from "@/lib/api/courierOrdersApi"

// Notifications are temporarily disabled.
// We also avoid `{ params }` in the handler signature (Next 15 typing issue)
// and extract `orderId` directly from the URL.
export async function GET(request: Request) {
  try {
    const { pathname } = new URL(request.url)
    const match = pathname.match(/\/courier-orders\/([^/]+)\/notifications\/?$/)
    const orderId = match?.[1] ?? null

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID not found in URL" },
        { status: 400 }
      )
    }

    // Optional sanity check: ensure the order exists
    const orderResp = await courierOrdersApi.getCourierOrder(orderId)
    if (!orderResp.success || !orderResp.data) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      )
    }

    // Feature disabled -> always return an empty list
    return NextResponse.json({ success: true, data: [] })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
