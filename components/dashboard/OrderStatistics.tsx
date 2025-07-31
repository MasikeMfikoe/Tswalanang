"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface OrderStatisticsProps {
  isDarkMode: boolean
  averageProcessingTime: {
    value: number
    unit: string
    target: number
    trend: number
  }
  orderValueDistribution: Array<{
    label: string
    percentage: number
  }>
}

export function OrderStatistics({ isDarkMode, averageProcessingTime, orderValueDistribution }: OrderStatisticsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"} hover:shadow-md transition-all`}>
        <CardHeader>
          <CardTitle className={`${isDarkMode ? "text-white" : "text-gray-900"}`}>Order Processing Time</CardTitle>
          <CardDescription className={`${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
            Average time to process orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[240px]">
            <div className={`text-5xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {averageProcessingTime.value}
            </div>
            <div className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
              {averageProcessingTime.unit} on average
            </div>
            <div className="w-full mt-6">
              <div className="flex justify-between mb-1">
                <span className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
                  Target: {averageProcessingTime.target} {averageProcessingTime.unit}
                </span>
                <span className="text-xs text-yellow-500">
                  {averageProcessingTime.trend > 0 ? `+${averageProcessingTime.trend}` : averageProcessingTime.trend}{" "}
                  {averageProcessingTime.unit}
                </span>
              </div>
              <Progress value={(averageProcessingTime.value / averageProcessingTime.target) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"} hover:shadow-md transition-all`}>
        <CardHeader>
          <CardTitle className={`${isDarkMode ? "text-white" : "text-gray-900"}`}>Order Value Distribution</CardTitle>
          <CardDescription className={`${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
            Distribution of orders by value
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderValueDistribution.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <span className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>{item.label}</span>
                  <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
