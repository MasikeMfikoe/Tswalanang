"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart } from "@/components/Charts"

interface PerformanceChartsProps {
  isDarkMode: boolean
  onTimeDeliveryRate: number
  avgProcessingTime: number
  monthlyOrderTrend: Array<{ name: string; value: number }>
}

export function PerformanceCharts({
  isDarkMode,
  onTimeDeliveryRate,
  avgProcessingTime,
  monthlyOrderTrend,
}: PerformanceChartsProps) {
  // Create delivery performance trend data (simulate monthly data)
  const deliveryPerformanceTrend = monthlyOrderTrend.map((month, index) => ({
    name: month.name,
    value: Math.max(70, Math.min(100, onTimeDeliveryRate + (Math.random() - 0.5) * 20)),
  }))

  // Create operational efficiency trend (cost per order simulation)
  const operationalEfficiencyTrend = monthlyOrderTrend.map((month, index) => ({
    name: month.name,
    value: Math.max(300, 500 - index * 15 + (Math.random() - 0.5) * 50), // Improving trend
  }))

  // Calculate trends
  const deliveryTrend =
    deliveryPerformanceTrend.length >= 2
      ? deliveryPerformanceTrend[deliveryPerformanceTrend.length - 1].value -
        deliveryPerformanceTrend[deliveryPerformanceTrend.length - 2].value
      : 0

  const efficiencyTrend =
    operationalEfficiencyTrend.length >= 2
      ? ((operationalEfficiencyTrend[operationalEfficiencyTrend.length - 2].value -
          operationalEfficiencyTrend[operationalEfficiencyTrend.length - 1].value) /
          operationalEfficiencyTrend[operationalEfficiencyTrend.length - 2].value) *
        100
      : 0

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"} hover:shadow-md transition-all`}>
        <CardHeader>
          <CardTitle className={`${isDarkMode ? "text-white" : "text-gray-900"}`}>Delivery Performance</CardTitle>
          <CardDescription className={`${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
            On-time delivery rate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <LineChart data={deliveryPerformanceTrend} />
          </div>
          <div className="flex justify-between items-center mt-4">
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Current</p>
              <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {Math.round(onTimeDeliveryRate)}%
              </p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Target</p>
              <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>95%</p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Trend</p>
              <p className={`text-lg font-bold ${deliveryTrend >= 0 ? "text-green-500" : "text-red-500"}`}>
                {deliveryTrend >= 0 ? "+" : ""}
                {deliveryTrend.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"} hover:shadow-md transition-all`}>
        <CardHeader>
          <CardTitle className={`${isDarkMode ? "text-white" : "text-gray-900"}`}>Operational Efficiency</CardTitle>
          <CardDescription className={`${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
            Processing efficiency metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <LineChart data={operationalEfficiencyTrend} />
          </div>
          <div className="flex justify-between items-center mt-4">
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Avg Time</p>
              <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {avgProcessingTime.toFixed(1)} days
              </p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Target</p>
              <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>2.0 days</p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Efficiency</p>
              <p className={`text-lg font-bold ${efficiencyTrend >= 0 ? "text-green-500" : "text-red-500"}`}>
                {efficiencyTrend >= 0 ? "+" : ""}
                {efficiencyTrend.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
