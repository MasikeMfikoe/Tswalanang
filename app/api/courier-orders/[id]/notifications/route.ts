import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const orderId = params.id

  // In a real application, fetch notifications related to this courier order from your database
  // For now, return mock data
  const mockNotifications = [
    {
      id: "notif1",
      orderId: orderId,
      type: "status_update",
      message: `Order ${orderId} status updated to 'In Transit'.`,
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      read: false,
    },
    {
      id: "notif2",
      orderId: orderId,
      type: "delivery_alert",
      message: `Order ${orderId} is estimated to arrive within 24 hours.`,
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      read: true,
    },
  ]

  return NextResponse.json(mockNotifications)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const orderId = params.id
  const { type, message } = await request.json()

  // In a real application, save the new notification to your database
  const newNotification = {
    id: `notif_${Date.now()}`,
    orderId: orderId,
    type,
    message,
    timestamp: new Date().toISOString(),
    read: false,
  }

  console.log(`New notification for order ${orderId}:`, newNotification)

  return NextResponse.json(newNotification, { status: 201 })
}
