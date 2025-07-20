"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KPISummaryCards } from "./KPISummaryCards"
import { OrderStatistics } from "./OrderStatistics"
import { CustomerStatistics } from "./CustomerStatistics"
import { PerformanceCharts } from "./PerformanceCharts"
import { OrderStatusCharts } from "./OrderStatusCharts"
import { RecentOrdersList } from "./RecentOrdersList"
import { PerformanceMetrics } from "./PerformanceMetrics"

export function DashboardTabs() {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:grid-cols-8">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="customers">Customers</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
        <TabsTrigger value="status">Status</TabsTrigger>
        <TabsTrigger value="metrics">Metrics</TabsTrigger>
        <TabsTrigger value="recent">Recent</TabsTrigger>
        <TabsTrigger value="all-charts">All Charts</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-6">
        <KPISummaryCards />
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <OrderStatistics />
          <CustomerStatistics />
        </div>
        <div className="mt-6">
          <RecentOrdersList />
        </div>
      </TabsContent>
      <TabsContent value="orders" className="mt-6">
        <OrderStatistics />
        <div className="mt-6">
          <RecentOrdersList />
        </div>
      </TabsContent>
      <TabsContent value="customers" className="mt-6">
        <CustomerStatistics />
        <div className="mt-6">
          <RecentOrdersList />
        </div>
      </TabsContent>
      <TabsContent value="performance" className="mt-6">
        <PerformanceCharts />
        <div className="mt-6">
          <PerformanceMetrics />
        </div>
      </TabsContent>
      <TabsContent value="status" className="mt-6">
        <OrderStatusCharts />
      </TabsContent>
      <TabsContent value="metrics" className="mt-6">
        <PerformanceMetrics />
      </TabsContent>
      <TabsContent value="recent" className="mt-6">
        <RecentOrdersList />
      </TabsContent>
      <TabsContent value="all-charts" className="mt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <OrderStatistics />
          <CustomerStatistics />
          <PerformanceCharts />
          <OrderStatusCharts />
        </div>
      </TabsContent>
    </Tabs>
  )
}
