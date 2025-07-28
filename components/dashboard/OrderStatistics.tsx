"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface OrderStatisticsProps {
  isDarkMode: boolean
}

export function OrderStatistics({ isDarkMode }: OrderStatisticsProps) {
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
            <div className={`text-5xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>2.4</div>
            <div className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>days on average</div>
            <div className="w-full mt-6">
              <div className="flex justify-between mb-1">
                <span className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Target: 2 days</span>
                <span className="text-xs text-yellow-500">+0.4 days</span>
              </div>
              <Progress value={80} className="h-2" />
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
            <div>
              <div className="flex justify-between mb-1">
                <span className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>R 0 - R 1,000</span>
                <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>15%</span>
              </div>
              <Progress value={15} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>R 1,001 - R 5,000</span>
                <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>35%</span>
              </div>
              <Progress value={35} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>R 5,001 - R 10,000</span>
                <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>25%</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>R 10,001 - R 50,000</span>
                <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>20%</span>
              </div>
              <Progress value={20} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>R 50,001+</span>
                <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>5%</span>
              </div>
              <Progress value={5} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
