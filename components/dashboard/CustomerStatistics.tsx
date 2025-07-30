"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart } from "@/components/Charts"

interface CustomerStatisticsProps {
  isDarkMode: boolean
}

export function CustomerStatistics({ isDarkMode }: CustomerStatisticsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"} hover:shadow-md transition-all`}>
        <CardHeader>
          <CardTitle className={`${isDarkMode ? "text-white" : "text-gray-900"}`}>Customer Acquisition</CardTitle>
          <CardDescription className={`${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
            New customers over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <LineChart
              data={[
                { name: "Jan", value: 4 },
                { name: "Feb", value: 3 },
                { name: "Mar", value: 5 },
                { name: "Apr", value: 2 },
                { name: "May", value: 7 },
                { name: "Jun", value: 4 },
              ]}
            />
          </div>
          <div className="flex justify-between items-center mt-4">
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Total New</p>
              <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>25</p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Monthly Avg</p>
              <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>4.2</p>
            </div>
            <div>
              <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Growth</p>
              <p className={`text-lg font-bold text-green-500`}>+15%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"} hover:shadow-md transition-all`}>
        <CardHeader>
          <CardTitle className={`${isDarkMode ? "text-white" : "text-gray-900"}`}>Customer Retention</CardTitle>
          <CardDescription className={`${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
            Repeat order statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[240px]">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className={`${isDarkMode ? "text-zinc-800" : "text-gray-200"} stroke-current`}
                  strokeWidth="10"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-blue-500 stroke-current"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  strokeDasharray="251.2"
                  strokeDashoffset="75.36"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>70%</div>
                  <div className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>retention</div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>
                70% of customers place repeat orders
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
