"use client"

import type React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, BarChartIcon, Users, TrendingUp } from "lucide-react"
import { KPISummaryCards } from "./KPISummaryCards"
import { OrderStatusCharts } from "./OrderStatusCharts"

interface DashboardTabsProps {
  isDarkMode: boolean
  activeTab: string
  setActiveTab: (value: string) => void
  isLoading: boolean
  renderSkeleton: () => React.ReactNode
  filteredOrders: any[]
  totalOrderValue: number
  completedOrders: any[]
  customers: any[]
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
  pendingOrders: any[]
  children?: React.ReactNode
}

export function DashboardTabs({
  isDarkMode,
  activeTab,
  setActiveTab,
  isLoading,
  renderSkeleton,
  filteredOrders,
  totalOrderValue,
  completedOrders,
  customers,
  orderStatusData,
  monthlyOrderTrendData,
  activeOrders,
  pendingOrders,
  children,
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
      <TabsList className={isDarkMode ? "bg-zinc-800" : "bg-gray-100"}>
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BarChartIcon className="h-4 w-4" />
          <span>Overview</span>
        </TabsTrigger>
        <TabsTrigger value="orders" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span>Orders</span>
        </TabsTrigger>
        <TabsTrigger value="customers" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>Customers</span>
        </TabsTrigger>
        <TabsTrigger value="performance" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span>Performance</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-4">
        {isLoading ? (
          renderSkeleton()
        ) : (
          <>
            <KPISummaryCards
              isDarkMode={isDarkMode}
              filteredOrders={filteredOrders}
              totalOrderValue={totalOrderValue}
              completedOrders={completedOrders}
              customers={customers}
            />
            <OrderStatusCharts
              isDarkMode={isDarkMode}
              orderStatusData={orderStatusData}
              monthlyOrderTrendData={monthlyOrderTrendData}
              activeOrders={activeOrders}
              completedOrders={completedOrders}
              pendingOrders={pendingOrders}
            />
          </>
        )}
      </TabsContent>

      {/* Other tabs content will be passed as children */}
      {children}
    </Tabs>
  )
}
