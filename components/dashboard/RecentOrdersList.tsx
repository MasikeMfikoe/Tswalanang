"use client"

import { format } from "date-fns"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

interface RecentOrdersListProps {
  isDarkMode: boolean
  recentOrders: any[]
}

export function RecentOrdersList({ isDarkMode, recentOrders }: RecentOrdersListProps) {
  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-orange-500" />
    }
  }

  return (
    <Card className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"} hover:shadow-md transition-all mb-6`}>
      <CardHeader>
        <CardTitle className={`${isDarkMode ? "text-white" : "text-gray-900"}`}>Recent Orders</CardTitle>
        <CardDescription className={`${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
          Latest orders in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div
            className={`${isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-gray-50 border-gray-200"} px-4 py-3 text-sm font-medium flex items-center border-b`}
          >
            <div className="w-12 font-semibold">ID</div>
            <div className="flex-1 font-semibold">Customer</div>
            <div className="w-24 font-semibold">Status</div>
            <div className="w-24 font-semibold">Value</div>
            <div className="w-32 font-semibold">Date</div>
            <div className="w-20 font-semibold text-right">Action</div>
          </div>
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className={`${isDarkMode ? "border-zinc-700 hover:bg-zinc-800" : "border-gray-200 hover:bg-gray-50"} px-4 py-3 text-sm flex items-center border-b last:border-b-0`}
            >
              <div className="w-12 font-medium">{order.id.substring(0, 5)}</div>
              <div className="flex-1">{order.customerName}</div>
              <div className="w-24 flex items-center gap-1">
                {getStatusIcon(order.status)}
                <span>{order.status}</span>
              </div>
              <div className="w-24">R {order.totalValue.toLocaleString()}</div>
              <div className="w-32">{format(new Date(order.createdAt), "dd MMM yyyy")}</div>
              <div className="w-20 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${isDarkMode ? "hover:bg-zinc-700" : "hover:bg-gray-100"}`}
                  asChild
                >
                  <Link href={`/orders/${order.id}`}>View</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            className={`${isDarkMode ? "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700" : "bg-white hover:bg-gray-100"}`}
            asChild
          >
            <Link href="/orders">View All Orders</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
