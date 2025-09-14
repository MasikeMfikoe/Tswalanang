"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, LineChart } from "@/components/Charts"
import { TrendingUp, Package } from "lucide-react"

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
  const totalOrders = activeOrders.length + completedOrders.length + pendingOrders.length
  const monthlyTotal = monthlyOrderTrendData.reduce((sum, item) => sum + item.value, 0)
  const monthlyAvg = monthlyOrderTrendData.length > 0 ? monthlyTotal / monthlyOrderTrendData.length : 0

  return (
    <div className="grid gap-6 lg:grid-cols-2 mb-8">
      {/* Order Status Breakdown */}
      <Card
        className={`${isDarkMode ? "bg-gradient-to-br from-slate-900/50 to-gray-900/50 border-slate-800/50" : "bg-white border-gray-200"} hover:shadow-lg transition-all duration-300`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Order Status Overview
              </CardTitle>
              <CardDescription className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Real-time distribution of order statuses
              </CardDescription>
            </div>
            <div className={`p-3 rounded-xl ${isDarkMode ? "bg-cyan-500/20" : "bg-cyan-100"}`}>
              <Package className={`h-6 w-6 ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] mb-6">
            <BarChart data={orderStatusData} />
          </div>

          {/* Status Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-xl ${isDarkMode ? "bg-blue-500/10 border border-blue-500/20" : "bg-blue-50 border border-blue-200"}`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <p className={`text-sm font-medium ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>Active</p>
                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {activeOrders.length}
                </p>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl ${isDarkMode ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-200"}`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <p className={`text-sm font-medium ${isDarkMode ? "text-emerald-300" : "text-emerald-700"}`}>
                  Completed
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {completedOrders.length}
                </p>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl ${isDarkMode ? "bg-amber-500/10 border border-amber-500/20" : "bg-amber-50 border border-amber-200"}`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <p className={`text-sm font-medium ${isDarkMode ? "text-amber-300" : "text-amber-700"}`}>Pending</p>
                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {pendingOrders.length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card
        className={`${isDarkMode ? "bg-gradient-to-br from-slate-900/50 to-gray-900/50 border-slate-800/50" : "bg-white border-gray-200"} hover:shadow-lg transition-all duration-300`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Order Volume Trends
              </CardTitle>
              <CardDescription className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Monthly order patterns over the past year
              </CardDescription>
            </div>
            <div className={`p-3 rounded-xl ${isDarkMode ? "bg-blue-500/20" : "bg-blue-100"}`}>
              <TrendingUp className={`h-6 w-6 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] mb-6">
            <LineChart data={monthlyOrderTrendData} />
          </div>

          {/* Trend Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Total Orders</p>
              <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{monthlyTotal}</p>
              <p className="text-xs text-cyan-500 font-medium">12 months</p>
            </div>
            <div className="text-center">
              <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Monthly Average</p>
              <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {Math.round(monthlyAvg)}
              </p>
              <p className="text-xs text-blue-500 font-medium">per month</p>
            </div>
            <div className="text-center">
              <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Growth Rate</p>
              <p className="text-2xl font-bold text-emerald-500">+12.4%</p>
              <p className="text-xs text-emerald-500 font-medium">YoY growth</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
