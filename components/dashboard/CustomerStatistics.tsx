"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, TrendingDown } from "lucide-react"
import type { Customer } from "@/types/models" // Assuming Customer type is defined here
import { Charts } from "@/components/Charts" // Assuming Charts component is available

interface CustomerStatisticsProps {
  customers: Customer[]
}

export function CustomerStatistics({ customers }: CustomerStatisticsProps) {
  const activeCustomers = customers.length
  // Mock data for customer growth, replace with actual data if available
  const customerGrowthData = [
    { month: "Jan", newCustomers: 10 },
    { month: "Feb", newCustomers: 12 },
    { month: "Mar", newCustomers: 8 },
    { month: "Apr", newCustomers: 15 },
    { month: "May", newCustomers: 11 },
    { month: "Jun", newCustomers: 13 },
  ]

  const totalNewCustomersLastMonth = customerGrowthData[customerGrowthData.length - 1]?.newCustomers || 0
  const totalNewCustomersPreviousMonth = customerGrowthData[customerGrowthData.length - 2]?.newCustomers || 0
  const growthPercentage =
    totalNewCustomersPreviousMonth > 0
      ? ((totalNewCustomersLastMonth - totalNewCustomersPreviousMonth) / totalNewCustomersPreviousMonth) * 100
      : totalNewCustomersLastMonth > 0
        ? 100
        : 0

  return (
    <Card className="lg:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
        <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{activeCustomers}</div>
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          {growthPercentage >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          {growthPercentage.toFixed(1)}% from last month
        </p>
        <div className="h-[150px] mt-4">
          <Charts
            type="line"
            title=""
            data={customerGrowthData}
            xAxisDataKey="month"
            series={[{ dataKey: "newCustomers", color: "#8884d8", name: "New Customers" }]}
          />
        </div>
      </CardContent>
    </Card>
  )
}
