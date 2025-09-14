"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, TrendingUp, CheckCircle, Users, DollarSign, Target, Activity } from "lucide-react"

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
  const completionRate =
    filteredOrders.length > 0 ? Math.round((completedOrders.length / filteredOrders.length) * 100) : 0
  const avgOrderValue = filteredOrders.length > 0 ? totalOrderValue / filteredOrders.length : 0

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Total Revenue Card */}
      <Card
        className={`${isDarkMode ? "bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-cyan-800/30" : "bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200"} hover:shadow-lg transition-all duration-300`}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${isDarkMode ? "bg-cyan-500/20" : "bg-cyan-100"}`}>
                  <DollarSign className={`h-5 w-5 ${isDarkMode ? "text-cyan-400" : "text-cyan-600"}`} />
                </div>
                <p className={`text-sm font-medium ${isDarkMode ? "text-cyan-300" : "text-cyan-700"}`}>Total Revenue</p>
              </div>
              <h3 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                R {totalOrderValue.toLocaleString()}
              </h3>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">+12.5%</span>
                <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>vs last month</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Orders Card */}
      <Card
        className={`${isDarkMode ? "bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-800/30" : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"} hover:shadow-lg transition-all duration-300`}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${isDarkMode ? "bg-blue-500/20" : "bg-blue-100"}`}>
                  <Package className={`h-5 w-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                </div>
                <p className={`text-sm font-medium ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>Total Orders</p>
              </div>
              <h3 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {filteredOrders.length}
              </h3>
              <div className="flex items-center gap-1 mt-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-500">R {avgOrderValue.toLocaleString()}</span>
                <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>avg value</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Rate Card */}
      <Card
        className={`${isDarkMode ? "bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-800/30" : "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200"} hover:shadow-lg transition-all duration-300`}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${isDarkMode ? "bg-emerald-500/20" : "bg-emerald-100"}`}>
                  <Target className={`h-5 w-5 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`} />
                </div>
                <p className={`text-sm font-medium ${isDarkMode ? "text-emerald-300" : "text-emerald-700"}`}>
                  Completion Rate
                </p>
              </div>
              <h3 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{completionRate}%</h3>
              <div className="flex items-center gap-1 mt-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-500">{completedOrders.length}</span>
                <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>completed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Customers Card */}
      <Card
        className={`${isDarkMode ? "bg-gradient-to-br from-violet-900/20 to-purple-900/20 border-violet-800/30" : "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200"} hover:shadow-lg transition-all duration-300`}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${isDarkMode ? "bg-violet-500/20" : "bg-violet-100"}`}>
                  <Users className={`h-5 w-5 ${isDarkMode ? "text-violet-400" : "text-violet-600"}`} />
                </div>
                <p className={`text-sm font-medium ${isDarkMode ? "text-violet-300" : "text-violet-700"}`}>
                  Active Customers
                </p>
              </div>
              <h3 className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {customers.length}
              </h3>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-violet-500" />
                <span className="text-sm font-medium text-violet-500">+8.2%</span>
                <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>growth rate</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
