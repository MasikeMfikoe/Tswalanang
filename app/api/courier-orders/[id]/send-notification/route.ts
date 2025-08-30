import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"
import { generateSecureToken } from "@/lib/qr-code-utils"
import { courierOrdersApi } from "@/lib/api/courierOrdersApi"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ✅ params is a Promise
) {
  try {
    const { id: orderId } = await params                 // ✅ await params
    const body = await request.json()
    const { recipientEmail, recipientName, senderEmail, senderName, notificationType } = body

    // Validate input based on notification type
    if (notificationType === "recipient" && (!recipientEmail || !recipientName)) {
      return NextResponse.json({ success: false, message: "Recipient email and name are required" }, { status: 400 })
    }
    if (notificationType === "sender" && (!senderEmail || !senderName)) {
      return NextResponse.json({ success: false, message: "Sender email and name are required" }, { status: 400 })
    }

    // Get order details
    const orderResponse = await courierOrdersApi.getCourierOrder(orderId)
    if (!orderResponse.success || !orderResponse.data) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    const order = orderResponse.data
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://logistics.example.com"
    const trackingUrl = `${baseUrl}/courier-orders/details/${orderId}`

    let emailSent = false
    let updateData: Record<string, any> = {}

    if (notificationType === "recipient") {
      const token = generateSecureToken(orderId)
      emailSent = await emailService.sendDeliveryLinkEmail({
        orderId,
        recipientName,
        recipientEmail,
        senderName: order.sender,
        companyName: "TSW Smartlog",
        estimatedDelivery: order.estimatedDelivery,
        token,
      })
      updateData = {
        notify_recipient: true,
        recipient_email: recipientEmail,
        notification_sent_at: new Date().toISOString(),
      }
    } else if (notificationType === "sender_created") {
      emailSent = await emailService.sendSenderOrderCreatedEmail({
        orderId,
        waybillNo: order.waybillNo,
        senderName,
        senderEmail,
        recipientName: order.contactDetails?.receiver?.name || order.receiver,
        recipientCompany: order.contactDetails?.receiver?.company || order.receiver,
        estimatedDelivery: order.estimatedDelivery,
        trackingUrl,
        companyName: "TSW Smartlog",
      })
      updateData = {
        notify_sender_on_create: true,
        sender_email: senderEmail,
        sender_notification_sent_at: new Date().toISOString(),
      }
    } else if (notificationType === "sender_confirmed") {
      emailSent = await emailService.sendSenderDeliveryConfirmedEmail({
        orderId,
        waybillNo: order.waybillNo,
        senderName,
        senderEmail,
        recipientName: order.contactDetails?.receiver?.name || order.receiver,
        recipientDesignation: "Manager",
        deliveryTimestamp: new Date().toISOString(),
        signatureImageUrl: `${baseUrl}/images/signature-placeholder.png`,
        deliveryProofUrl: `${baseUrl}/courier-orders/details/${orderId}/proof`,
        companyName: "TSW Smartlog",
      })
      updateData = {
        notify_sender_on_confirm: true,
        sender_confirmation_sent_at: new Date().toISOString(),
      }
    }

    if (!emailSent) {
      return NextResponse.json({ success: false, message: "Failed to send email" }, { status: 500 })
    }

    await courierOrdersApi.updateCourierOrder(orderId, updateData)

    return NextResponse.json({ success: true, message: "Notification sent successfully" })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
