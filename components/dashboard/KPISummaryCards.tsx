"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Truck, Package, Clock } from "lucide-react"

interface KPISummaryCardsProps {
  isDarkMode: boolean
  filteredOrders: any[]
  totalOrderValue: number
  completedOrders: any[]
  customers: any[]
  avgDeliveryTime: string
  onTimeDeliveryRate: string
}

const kpiData = [
  { title: "Total Orders", value: "1,234", change: "+20.1% from last month", icon: Package },
  { title: "Revenue", value: "$45,231.89", change: "+15.5% from last month", icon: DollarSign },
  { title: "Avg. Delivery Time", value: "3.2 days", change: "-5% from last month", icon: Clock },
  { title: "On-Time Delivery", value: "98.5%", change: "+1.2% from last month", icon: Truck },
]

export function KPISummaryCards({
  isDarkMode,
  filteredOrders,
  totalOrderValue,
  completedOrders,
  customers,
  avgDeliveryTime,
  onTimeDeliveryRate,
}: KPISummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpiData.map((kpi, index) => (
        <Card
          key={index}
          className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"} hover:shadow-md transition-all`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
              {kpi.title}
            </CardTitle>
            <kpi.icon className={`h-4 w-4 ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`} />
          </CardHeader>
          <CardContent className="p-6">
            <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{kpi.value}</div>
            <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>{kpi.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
