"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const performanceData = [
  { name: "Jan", "On-Time Delivery": 90, "Avg. Transit Time": 5 },
  { name: "Feb", "On-Time Delivery": 92, "Avg. Transit Time": 4.8 },
  { name: "Mar", "On-Time Delivery": 88, "Avg. Transit Time": 5.5 },
  { name: "Apr", "On-Time Delivery": 95, "Avg. Transit Time": 4.2 },
  { name: "May", "On-Time Delivery": 93, "Avg. Transit Time": 4.5 },
  { name: "Jun", "On-Time Delivery": 96, "Avg. Transit Time": 4.0 },
  { name: "Jul", "On-Time Delivery": 94, "Avg. Transit Time": 4.3 },
]

export function PerformanceCharts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Operational Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" label={{ value: "On-Time (%)", angle: -90, position: "insideLeft" }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: "Avg. Transit (Days)", angle: 90, position: "insideRight" }}
            />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="On-Time Delivery" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line yAxisId="right" type="monotone" dataKey="Avg. Transit Time" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
