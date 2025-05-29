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
    const normalizedStatus = status?.toLowerCase() || ""

    if (normalizedStatus.includes("complet")) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    } else if (normalizedStatus.includes("progress") || normalizedStatus.includes("in_progress")) {
      return <Clock className="h-4 w-4 text-blue-500" />
    } else {
      return <AlertCircle className="h-4 w-4 text-orange-500" />
    }
  }

  // Helper function to normalize field names (handles both camelCase and snake_case)
  const getValue = (order: any, field: string, alternateField: string, defaultValue: any = "") => {
    return order[field] !== undefined
      ? order[field]
      : order[alternateField] !== undefined
        ? order[alternateField]
        : defaultValue
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
          {recentOrders.map((order) => {
            const id = getValue(order, "id", "id", "")
            const customerName = getValue(order, "customerName", "customer_name", "Unknown")
            const status = getValue(order, "status", "status", "Pending")
            const totalValue = getValue(order, "totalValue", "total_value", 0)
            const createdAt = getValue(order, "createdAt", "created_at", new Date().toISOString())

            return (
              <div
                key={id}
                className={`${isDarkMode ? "border-zinc-700 hover:bg-zinc-800" : "border-gray-200 hover:bg-gray-50"} px-4 py-3 text-sm flex items-center border-b last:border-b-0`}
              >
                <div className="w-12 font-medium">{typeof id === "string" ? id.substring(0, 5) : id}</div>
                <div className="flex-1">{customerName}</div>
                <div className="w-24 flex items-center gap-1">
                  {getStatusIcon(status)}
                  <span>{status}</span>
                </div>
                <div className="w-24">R {Number(totalValue).toLocaleString()}</div>
                <div className="w-32">{format(new Date(createdAt), "dd MMM yyyy")}</div>
                <div className="w-20 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`${isDarkMode ? "hover:bg-zinc-700" : "hover:bg-gray-100"}`}
                    asChild
                  >
                    <Link href={`/orders/${id}`}>View</Link>
                  </Button>
                </div>
              </div>
            )
          })}
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
