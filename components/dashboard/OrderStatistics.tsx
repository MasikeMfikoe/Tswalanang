"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Charts } from "@/components/Charts" // Assuming Charts component is available
import type { Order } from "@/types/models" // Assuming Order type is defined here

interface OrderStatisticsProps {
  orders: Order[]
}

export function OrderStatistics({ orders }: OrderStatisticsProps) {
  // Aggregate order data by month for the chart
  const monthlyOrderData = orders.reduce((acc: { [key: string]: number }, order) => {
    const month = new Date(order.createdAt).toLocaleString("en-US", { month: "short", year: "numeric" })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(monthlyOrderData)
    .map(([month, count]) => ({ month, orders: count }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()) // Sort by month

  const activeOrders = orders.filter((order) => order.status === "Pending" || order.status === "In Transit").length
  const completedOrders = orders.filter((order) => order.status === "Delivered").length
  const cancelledOrders = orders.filter((order) => order.status === "Cancelled").length

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Order Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{activeOrders}</div>
            <p className="text-sm text-gray-500">Active</p>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{completedOrders}</div>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-600">{cancelledOrders}</div>
            <p className="text-sm text-gray-500">Cancelled</p>
          </div>
        </div>
        <div className="h-[250px]">
          <Charts
            type="line"
            title="Order Volume by Month"
            data={chartData}
            xAxisDataKey="month"
            series={[{ dataKey: "orders", color: "#82ca9d", name: "Orders" }]}
          />
        </div>
      </CardContent>
    </Card>
  )
}
