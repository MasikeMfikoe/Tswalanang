import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"
import { sendEmail } from "@/lib/email-service"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { recipientEmail, subject, message } = await request.json()

  if (!id || !recipientEmail || !subject || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    // Fetch courier order details
    const { data: order, error: orderError } = await supabase
      .from("courier_orders")
      .select("*")
      .eq("id", id)
      .single()

    if (orderError || !order) {
      console.error("Error fetching courier order:", orderError)
      return NextResponse.json({ error: "Courier order not found" }, { status: 404 })
    }

    // Send email notification
    const emailResult = await sendEmail({
      to: recipientEmail,
      subject: subject,
      text: message,
      html: `<p>${message}</p>`,
    })

    if (emailResult.success) {
      // Optionally log the notification in your database
      const { error: notificationError } = await supabase.from("notifications").insert({
        type: "courier_order_update",
        message: `Notification sent for order ${order.order_id}: ${subject}`,
        related_id: id,
        recipient: recipientEmail,
        status: "sent",
      })

      if (notificationError) {
        console.error("Error logging notification:", notificationError)
      }

      return NextResponse.json({ message: "Notification sent successfully" }, { status: 200 })
    } else {
      console.error("Failed to send email:", emailResult.error)
      return NextResponse.json({ error: "Failed to send notification email" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in send-notification API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
