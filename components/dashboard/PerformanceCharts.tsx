"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart } from "@/components/Charts"

interface PerformanceChartsProps {
  isDarkMode: boolean
}

export function PerformanceCharts({ isDarkMode }: PerformanceChartsProps) {
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
            <LineChart
              data={[
                { name: "Jan", value: 82 },
                { name: "Feb", value: 78 },
                { name: "Mar", value: 85 },
                { name: "Apr", value: 91 },
                { name: "May", value: 88 },
                { name: "Jun", value: 92 },
              ]}
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Current</p>
              <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>92%</p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Target</p>
              <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>95%</p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Trend</p>
              <p className={`text-lg font-bold text-green-500`}>+4%</p>
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
            <LineChart
              data={[
                { name: "Jan", value: 450 },
                { name: "Feb", value: 420 },
                { name: "Mar", value: 410 },
                { name: "Apr", value: 390 },
                { name: "May", value: 380 },
                { name: "Jun", value: 375 },
              ]}
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Current</p>
              <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>R 375</p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Target</p>
              <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>R 350</p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Trend</p>
              <p className={`text-lg font-bold text-green-500`}>-16.7%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
