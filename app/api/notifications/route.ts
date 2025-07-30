import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Fetch real notifications from various sources
    const notifications = []

    // Get recent orders for notifications
    const { data: recentOrders } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)

    // Get recent customers for notifications
    const { data: recentCustomers } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3)

    // Get recent deliveries for notifications
    const { data: recentDeliveries } = await supabase
      .from("deliveries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3)

    // Create notifications from recent orders
    recentOrders?.forEach((order, index) => {
      const createdAt = new Date(order.created_at)
      const now = new Date()
      const diffHours = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60))

      let timeAgo = ""
      if (diffHours < 1) {
        timeAgo = "Just now"
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
      } else {
        const diffDays = Math.floor(diffHours / 24)
        timeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
      }

      notifications.push({
        id: `order-${order.id}`,
        title: "New Order",
        message: `Order ${order.po_number || order.id} has been created`,
        time: timeAgo,
        read: index > 1, // Mark first 2 as unread
        type: "order",
        data: order,
      })
    })

    // Create notifications from recent customers
    recentCustomers?.forEach((customer, index) => {
      const createdAt = new Date(customer.created_at)
      const now = new Date()
      const diffHours = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60))

      let timeAgo = ""
      if (diffHours < 24) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
      } else {
        const diffDays = Math.floor(diffHours / 24)
        timeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
      }

      notifications.push({
        id: `customer-${customer.id}`,
        title: "New Customer",
        message: `New customer '${customer.name}' has been added`,
        time: timeAgo,
        read: true,
        type: "customer",
        data: customer,
      })
    })

    // Create notifications from recent deliveries
    recentDeliveries?.forEach((delivery, index) => {
      const createdAt = new Date(delivery.created_at)
      const now = new Date()
      const diffHours = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60))

      let timeAgo = ""
      if (diffHours < 24) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
      } else {
        const diffDays = Math.floor(diffHours / 24)
        timeAgo = `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
      }

      const isDelayed = delivery.status === "delayed" || delivery.status === "Delayed"

      notifications.push({
        id: `delivery-${delivery.id}`,
        title: isDelayed ? "Delivery Alert" : "Delivery Update",
        message: isDelayed
          ? `Delivery for Order ${delivery.order_number || delivery.id} is delayed`
          : `Delivery for Order ${delivery.order_number || delivery.id} has been updated`,
        time: timeAgo,
        read: !isDelayed, // Mark delayed deliveries as unread
        type: "delivery",
        data: delivery,
      })
    })

    // Sort notifications by time (most recent first)
    notifications.sort((a, b) => {
      // Simple sorting by read status and then by ID (newer IDs first)
      if (a.read !== b.read) {
        return a.read ? 1 : -1 // Unread first
      }
      return b.id.localeCompare(a.id)
    })

    // Limit results
    const limitedNotifications = notifications.slice(0, limit)

    return NextResponse.json({
      notifications: limitedNotifications,
      total: notifications.length,
      unreadCount: notifications.filter((n) => !n.read).length,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { notificationId, markAsRead } = await request.json()

    // In a real implementation, you would update the notification status in the database
    // For now, we'll just return success since notifications are generated dynamically

    return NextResponse.json({
      success: true,
      message: `Notification ${markAsRead ? "marked as read" : "marked as unread"}`,
    })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 })
  }
}
