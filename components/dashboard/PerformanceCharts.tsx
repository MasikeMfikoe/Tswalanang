"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Charts } from "@/components/Charts"

export function PerformanceCharts() {
  const performanceData = [
    { month: "Jan", onTime: 90, delayed: 10 },
    { month: "Feb", onTime: 85, delayed: 15 },
    { month: "Mar", onTime: 92, delayed: 8 },
    { month: "Apr", onTime: 88, delayed: 12 },
    { month: "May", onTime: 95, delayed: 5 },
    { month: "Jun", onTime: 93, delayed: 7 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <Charts
            type="line"
            title=""
            data={performanceData}
            xAxisDataKey="month"
            series={[
              { dataKey: "onTime", color: "#82ca9d", name: "On-Time" },
              { dataKey: "delayed", color: "#ffc658", name: "Delayed" },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  )
}
