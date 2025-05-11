"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Truck, Package, FileText } from "lucide-react"

interface PerformanceMetricsProps {
  isDarkMode: boolean
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
}

export function PerformanceMetrics({ isDarkMode, performanceMetrics }: PerformanceMetricsProps) {
  // Helper function to render the correct icon
  const renderIcon = (iconName: string, colorClass: string) => {
    switch (iconName) {
      case "Truck":
        return <Truck className={`h-5 w-5 ${colorClass}`} />
      case "Package":
        return <Package className={`h-5 w-5 ${colorClass}`} />
      case "FileText":
        return <FileText className={`h-5 w-5 ${colorClass}`} />
      default:
        return null
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3 mb-6">
      {performanceMetrics.map((metric, index) => (
        <Card
          key={index}
          className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white"} hover:shadow-md transition-all`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full ${isDarkMode ? metric.statusColor + "/20" : "bg-gray-100"}`}>
                {renderIcon(metric.icon, metric.color)}
              </div>
              <Badge variant="outline" className={`${metric.color} ${isDarkMode ? "border-opacity-50" : ""}`}>
                {metric.status}
              </Badge>
            </div>
            <h3 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>{metric.title}</h3>
            <p className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"} mb-4`}>{metric.description}</p>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={`text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Progress</span>
                <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {metric.value} / {metric.target}
                </span>
              </div>
              <Progress
                value={(metric.value / metric.target) * 100}
                className={`h-2 ${isDarkMode ? "bg-zinc-800" : "bg-gray-200"}`}
                indicatorClassName={metric.progressColor}
              />
              <div className="flex justify-between text-xs">
                <span className={`${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>Target: {metric.timeframe}</span>
                <span className={`${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}>{metric.daysLeft} days left</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
