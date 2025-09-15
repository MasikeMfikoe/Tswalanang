"use client"

import type React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, BarChartIcon, TrendingUp } from "lucide-react"
import { KPISummaryCards } from "./KPISummaryCards"
import { OrderStatusCharts } from "./OrderStatusCharts"
import { RecentOrdersList } from "./RecentOrdersList"
import { OrderStatistics } from "./OrderStatistics"
import { PerformanceMetrics } from "./PerformanceMetrics"
import { PerformanceCharts } from "./PerformanceCharts"

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
  // New props for other tabs
  recentOrders: any[]
  averageProcessingTime: { value: number; unit: string; target: number; trend: number }
  orderValueDistribution: Array<{ label: string; percentage: number }>
  topCustomers: any[]
  customerAcquisitionData: {
    data: Array<{ name: string; value: number }>
    totalNew: number
    monthlyAvg: number
    growth: number
  }
  customerRetentionRate: { percentage: number; description: string }
  performanceMetrics: Array<{
    title: string
    description: string
    value: number
    target: number
    timeframe: string
    status: string
    statusColor: string
    progressColor: string
    color: string
    icon: string
    daysLeft: number
  }>
  deliveryPerformanceData: Array<{ name: string; value: number }>
  operationalEfficiencyData: Array<{ name: string; value: number }>
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
  recentOrders, // New
  averageProcessingTime, // New
  orderValueDistribution, // New
  topCustomers, // New
  customerAcquisitionData, // New
  customerRetentionRate, // New
  performanceMetrics, // New
  deliveryPerformanceData, // New
  operationalEfficiencyData, // New
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

      {/* Orders Tab Content */}
      <TabsContent value="orders" className="mt-4">
        {isLoading ? (
          renderSkeleton()
        ) : (
          <>
            <RecentOrdersList isDarkMode={isDarkMode} recentOrders={recentOrders} />
            <OrderStatistics
              isDarkMode={isDarkMode}
              averageProcessingTime={averageProcessingTime}
              orderValueDistribution={orderValueDistribution}
            />
          </>
        )}
      </TabsContent>

      {/* Performance Tab Content */}
      <TabsContent value="performance" className="mt-4">
        {isLoading ? (
          renderSkeleton()
        ) : (
          <>
            <PerformanceMetrics isDarkMode={isDarkMode} performanceMetrics={performanceMetrics} />
            <PerformanceCharts
              isDarkMode={isDarkMode}
              deliveryPerformanceData={deliveryPerformanceData}
              operationalEfficiencyData={operationalEfficiencyData}
            />
          </>
        )}
      </TabsContent>
    </Tabs>
  )
}
