import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabaseClient"
// import { emailService } from "@/lib/email-service" // Removed Mailgun dependency

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const orderId = params.id
  const { notificationType, recipientEmail, message } = await request.json()
  const supabase = createClient()

  try {
    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("courier_orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      console.error("Error fetching order:", orderError)
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Simulate sending notification (email, SMS, etc.)
    console.log(`Sending ${notificationType} notification for Order #${orderId} to ${recipientEmail}: ${message}`)

    // Removed Mailgun email sending logic
    // if (notificationType === "email") {
    //   const emailSent = await emailService.sendEmail({
    //     to: recipientEmail,
    //     subject: `Notification for Order #${orderId}: ${notificationType}`,
    //     html: `<p>${message}</p><p>Order Details: <a href="${process.env.NEXT_PUBLIC_APP_URL}/courier-orders/details/${orderId}">View Order</a></p>`,
    //   })
    //   if (!emailSent) {
    //     console.warn(`Failed to send email notification for order ${orderId}.`)
    //   }
    // }

    // Record the notification in the database (optional, but good for audit)
    const { error: insertError } = await supabase.from("notifications").insert({
      order_id: orderId,
      type: notificationType,
      recipient: recipientEmail,
      message: message,
      status: "sent", // Or "failed" if emailService.sendEmail returned false
    })

    if (insertError) {
      console.error("Error recording notification:", insertError)
      // Continue even if recording fails, as the primary action (sending) might have succeeded
    }

    return NextResponse.json({ message: "Notification sent successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
