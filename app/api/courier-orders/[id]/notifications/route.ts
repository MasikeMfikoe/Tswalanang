import { NextResponse } from "next/server"
import { courierOrdersApi } from "@/lib/api/courierOrdersApi"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params

    // Get order details
    const orderResponse = await courierOrdersApi.getCourierOrder(orderId)
    if (!orderResponse.success || !orderResponse.data) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    const order = orderResponse.data

    // Construct notifications (placeholder logic)
    const notifications: Array<{
      id: number
      type: string
      email: string
      status: "sent" | "pending" | "failed"
      sentAt: string
    }> = []

    if (order.notify_recipient && order.recipient_email) {
      notifications.push({
        id: 1,
        type: "recipient",
        email: order.recipient_email,
        status: "sent",
        sentAt: order.notification_sent_at || new Date().toISOString(),
      })
    }

    if (order.notify_sender_on_create && order.sender_email) {
      notifications.push({
        id: 2,
        type: "sender_created",
        email: order.sender_email,
        status: "sent",
        sentAt: order.sender_notification_sent_at || new Date().toISOString(),
      })
    }

    if (order.notify_sender_on_confirm && order.sender_email) {
      notifications.push({
        id: 3,
        type: "sender_confirmed",
        email: order.sender_email,
        status: "sent",
        sentAt: order.sender_confirmation_sent_at || new Date().toISOString(),
      })
    }

    if (order.send_confirmation_to_admin) {
      notifications.push({
        id: 4,
        type: "admin",
        email: "admin@example.com", // TODO: read from system settings
        status: "sent",
        sentAt: order.admin_notification_sent_at || new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true, data: notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
