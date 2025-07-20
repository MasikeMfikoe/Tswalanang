import { NextResponse } from "next/server"
import { courierOrdersApi } from "@/lib/api/courierOrdersApi"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id

    // Get order details
    const orderResponse = await courierOrdersApi.getCourierOrder(orderId)
    if (!orderResponse.success || !orderResponse.data) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    const order = orderResponse.data

    // In a real implementation, this would fetch from a notifications table
    // For now, we'll construct a response based on the order data
    const notifications = [
      {
        id: "notif_001",
        type: "status_update",
        message: `Order ${orderId} is now 'Out for Delivery'.`,
        timestamp: "2024-07-19T10:00:00Z",
      },
      {
        id: "notif_002",
        type: "delivery_attempt",
        message: `Attempted delivery for order ${orderId}. Customer not available.`,
        timestamp: "2024-07-19T14:30:00Z",
      },
    ]

    // Additional notifications based on order data
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
        email: "admin@example.com", // This would come from system settings
        status: "sent",
        sentAt: order.admin_notification_sent_at || new Date().toISOString(),
      })
    }

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
