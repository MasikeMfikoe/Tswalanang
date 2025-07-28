"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, TrendingUp, CheckCircle, Users } from "lucide-react"

interface KPISummaryCardsProps {
  isDarkMode: boolean
  filteredOrders: any[]
  totalOrderValue: number
  completedOrders: any[]
  customers: any[]
}

export function KPISummaryCards({
  isDarkMode,
  filteredOrders,
  totalOrderValue,
  completedOrders,
  customers,
}: KPISummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <Card className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"} hover:shadow-md transition-all`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Total Orders</p>
              <h3 className={`text-2xl font-bold mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {filteredOrders.length}
              </h3>
              <p className="text-xs text-green-500 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from previous period
              </p>
            </div>
            <div className={`p-3 rounded-full ${isDarkMode ? "bg-blue-900/20" : "bg-blue-50"}`}>
              <Package className={`h-5 w-5 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"} hover:shadow-md transition-all`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Total Revenue</p>
              <h3 className={`text-2xl font-bold mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                R {totalOrderValue.toLocaleString()}
              </h3>
              <p className="text-xs text-green-500 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.5% from previous period
              </p>
            </div>
            <div className={`p-3 rounded-full ${isDarkMode ? "bg-green-900/20" : "bg-green-50"}`}>
              <TrendingUp className={`h-5 w-5 ${isDarkMode ? "text-green-400" : "text-green-500"}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"} hover:shadow-md transition-all`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Completion Rate</p>
              <h3 className={`text-2xl font-bold mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {completedOrders.length > 0 ? Math.round((completedOrders.length / filteredOrders.length) * 100) : 0}%
              </h3>
              <p className="text-xs text-yellow-500 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2% from previous period
              </p>
            </div>
            <div className={`p-3 rounded-full ${isDarkMode ? "bg-yellow-900/20" : "bg-yellow-50"}`}>
              <CheckCircle className={`h-5 w-5 ${isDarkMode ? "text-yellow-400" : "text-yellow-500"}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"} hover:shadow-md transition-all`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Active Customers</p>
              <h3 className={`text-2xl font-bold mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {customers.length}
              </h3>
              <p className="text-xs text-green-500 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +5% from previous period
              </p>
            </div>
            <div className={`p-3 rounded-full ${isDarkMode ? "bg-purple-900/20" : "bg-purple-50"}`}>
              <Users className={`h-5 w-5 ${isDarkMode ? "text-purple-400" : "text-purple-500"}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
