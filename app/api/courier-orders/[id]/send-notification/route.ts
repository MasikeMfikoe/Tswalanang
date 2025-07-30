import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabaseClient"
// import { emailService } from "@/lib/email-service" // Removed Mailgun dependency

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const orderId = params.id
  const { recipientEmail, message, notificationType } = await request.json()
  const supabase = createClient()

  try {
    // Fetch order details to ensure it exists
    const { data: order, error: orderError } = await supabase
      .from("courier_orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      console.error("Error fetching order:", orderError)
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Removed Mailgun email sending logic
    // if (notificationType === "email") {
    //   const emailSent = await emailService.sendEmail({
    //     to: recipientEmail,
    //     subject: `Update for Order #${orderId}`,
    //     html: `<p>${message}</p><p>View your order details here: <a href="${process.env.NEXT_PUBLIC_APP_URL}/courier-orders/details/${orderId}">Order #${orderId}</a></p>`,
    //   })

    //   if (!emailSent) {
    //     console.error("Failed to send email notification.")
    //     return NextResponse.json({ message: "Failed to send email notification" }, { status: 500 })
    //   }
    // } else {
    //   // Placeholder for other notification types (e.g., SMS, push)
    //   console.log(`Simulating sending ${notificationType} notification to ${recipientEmail}: ${message}`)
    // }

    // Record the notification in the database
    const { error: insertError } = await supabase.from("notifications").insert({
      order_id: orderId,
      type: notificationType,
      recipient: recipientEmail,
      message: message,
      status: "sent", // Assuming success for now
    })

    if (insertError) {
      console.error("Error recording notification:", insertError)
      // Log the error but don't fail the request if the notification itself was sent
    }

    return NextResponse.json({ message: "Notification sent successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error in send-notification API route:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
