import { NextResponse } from "next/server"
import { courierOrdersApi } from "@/lib/api/courierOrdersApi"

// Temporarily disable notifications for deployment:
// - Keep the order lookup so invalid IDs still return 404
// - Always return an empty notifications array
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Ensure the order exists; otherwise return 404
    const orderResponse = await courierOrdersApi.getCourierOrder(id)
    if (!orderResponse.success || !orderResponse.data) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      )
    }

    // Notifications disabled: return empty list
    return NextResponse.json({ success: true, data: [] })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
