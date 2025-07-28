"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, LineChart } from "@/components/Charts"

interface OrderStatusChartsProps {
  isDarkMode: boolean
  orderStatusData: Array<{
    name: string
    value: number
    color: string
  }>
  monthlyOrderTrendData: Array<{
    name: string
    value: number
  }>
  activeOrders: any[]
  completedOrders: any[]
  pendingOrders: any[]
}

export function OrderStatusCharts({
  isDarkMode,
  orderStatusData,
  monthlyOrderTrendData,
  activeOrders,
  completedOrders,
  pendingOrders,
}: OrderStatusChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 mb-6">
      <Card className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"} hover:shadow-md transition-all`}>
        <CardHeader>
          <CardTitle className={`${isDarkMode ? "text-white" : "text-gray-900"}`}>Order Status Breakdown</CardTitle>
          <CardDescription className={`${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
            Distribution of orders by current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <BarChart data={orderStatusData} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className={`p-2 rounded-md ${isDarkMode ? "bg-blue-900/20" : "bg-blue-50"}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>Active</span>
                <span className="text-sm font-bold">{activeOrders.length}</span>
              </div>
            </div>
            <div className={`p-2 rounded-md ${isDarkMode ? "bg-green-900/20" : "bg-green-50"}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>Completed</span>
                <span className="text-sm font-bold">{completedOrders.length}</span>
              </div>
            </div>
            <div className={`p-2 rounded-md ${isDarkMode ? "bg-yellow-900/20" : "bg-yellow-50"}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>Pending</span>
                <span className="text-sm font-bold">{pendingOrders.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"} hover:shadow-md transition-all`}>
        <CardHeader>
          <CardTitle className={`${isDarkMode ? "text-white" : "text-gray-900"}`}>Monthly Order Trends</CardTitle>
          <CardDescription className={`${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
            Order volume over the past year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <LineChart data={monthlyOrderTrendData} />
          </div>
          <div className="flex justify-between items-center mt-4">
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Total Orders</p>
              <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>843</p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Average Monthly</p>
              <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>70.25</p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Growth Rate</p>
              <p className={`text-lg font-bold text-green-500`}>+12.4%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
