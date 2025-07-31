"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart } from "@/components/Charts"

interface PerformanceChartsProps {
  isDarkMode: boolean
  deliveryPerformanceData: Array<{ name: string; value: number }>
  operationalEfficiencyData: Array<{ name: string; value: number }>
}

export function PerformanceCharts({
  isDarkMode,
  deliveryPerformanceData,
  operationalEfficiencyData,
}: PerformanceChartsProps) {
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
            <LineChart data={deliveryPerformanceData} />
          </div>
          <div className="flex justify-between items-center mt-4">
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Current</p>
              <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {deliveryPerformanceData.length > 0
                  ? deliveryPerformanceData[deliveryPerformanceData.length - 1].value.toFixed(0)
                  : 0}
                %
              </p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Target</p>
              <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>95%</p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Trend</p>
              <p
                className={`text-lg font-bold ${deliveryPerformanceData.length > 1 && deliveryPerformanceData[deliveryPerformanceData.length - 1].value > deliveryPerformanceData[deliveryPerformanceData.length - 2].value ? "text-green-500" : "text-red-500"}`}
              >
                {deliveryPerformanceData.length > 1
                  ? `${(deliveryPerformanceData[deliveryPerformanceData.length - 1].value - deliveryPerformanceData[deliveryPerformanceData.length - 2].value).toFixed(1)}%`
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"} hover:shadow-md transition-all`}>
        <CardHeader>
          <CardTitle className={`${isDarkMode ? "text-white" : "text-gray-900"}`}>Operational Efficiency</CardTitle>
          <CardDescription className={`${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
            Cost per order metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <LineChart data={operationalEfficiencyData} />
          </div>
          <div className="flex justify-between items-center mt-4">
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Current</p>
              <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                R{" "}
                {operationalEfficiencyData.length > 0
                  ? operationalEfficiencyData[operationalEfficiencyData.length - 1].value.toFixed(0)
                  : 0}
              </p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Target</p>
              <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>R 350</p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Trend</p>
              <p
                className={`text-lg font-bold ${operationalEfficiencyData.length > 1 && operationalEfficiencyData[operationalEfficiencyData.length - 1].value < operationalEfficiencyData[operationalEfficiencyData.length - 2].value ? "text-green-500" : "text-red-500"}`}
              >
                {operationalEfficiencyData.length > 1
                  ? `${(operationalEfficiencyData[operationalEfficiencyData.length - 1].value - operationalEfficiencyData[operationalEfficiencyData.length - 2].value).toFixed(1)}`
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
