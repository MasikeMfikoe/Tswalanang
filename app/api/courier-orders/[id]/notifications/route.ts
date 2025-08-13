import { NextResponse } from "next/server"
import { courierOrdersApi } from "@/lib/api/courierOrdersApi"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const orderId = id

    // Get order details
    const orderResponse = await courierOrdersApi.getCourierOrder(orderId)
    if (!orderResponse.success || !orderResponse.data) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    const order = orderResponse.data

    // In a real implementation, this would fetch from a notifications table
    // For now, we'll construct a response based on the order data
    const notifications = []

    if (order.notifyRecipient && order.recipientEmail) {
      notifications.push({
        id: 1,
        type: "recipient",
        email: order.recipientEmail,
        status: "sent",
        sentAt: order.notificationSentAt || new Date().toISOString(),
      })
    }

    if (order.notifySenderOnCreate && order.senderEmail) {
      notifications.push({
        id: 2,
        type: "sender_created",
        email: order.senderEmail,
        status: "sent",
        sentAt: order.senderNotificationSentAt || new Date().toISOString(),
      })
    }

    if (order.notifySenderOnConfirm && order.senderEmail) {
      notifications.push({
        id: 3,
        type: "sender_confirmed",
        email: order.senderEmail,
        status: "sent",
        sentAt: order.senderConfirmationSentAt || new Date().toISOString(),
      })
    }

    if (order.sendConfirmationToAdmin) {
      notifications.push({
        id: 4,
        type: "admin",
        email: "admin@example.com", // This would come from system settings
        status: "sent",
        sentAt: order.notificationSentAt || new Date().toISOString(), // Using general notification timestamp
      })
    }

    return NextResponse.json({
      success: true,
      data: notifications,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
