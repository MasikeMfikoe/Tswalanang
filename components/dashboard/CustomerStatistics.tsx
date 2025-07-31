"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface CustomerStatisticsProps {
  isDarkMode: boolean
  customerAcquisitionData: {
    data: Array<{ name: string; value: number }>
    totalNew: number
    monthlyAvg: number
    growth: number
  }
  customerRetentionRate: {
    percentage: number
    description: string
  }
}

export function CustomerStatistics({
  isDarkMode,
  customerAcquisitionData,
  customerRetentionRate,
}: CustomerStatisticsProps) {
  const COLORS = ["#82ca9d", "#8884d8"] // Colors for retention chart

  return (
    <div className="grid gap-6 md:grid-cols-2 mt-6">
      {/* Customer Acquisition */}
      <Card className={isDarkMode ? "bg-zinc-900 text-white" : "bg-white text-gray-900"}>
        <CardHeader>
          <CardTitle>Customer Acquisition</CardTitle>
        </CardHeader>
        <CardContent>
          {customerAcquisitionData.data.some((data) => data.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={customerAcquisitionData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#444" : "#ccc"} />
                <XAxis dataKey="name" stroke={isDarkMode ? "#bbb" : "#333"} />
                <YAxis stroke={isDarkMode ? "#bbb" : "#333"} />
                <Tooltip
                  contentStyle={isDarkMode ? { backgroundColor: "#333", border: "none" } : {}}
                  itemStyle={isDarkMode ? { color: "#fff" } : {}}
                />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#82ca9d" activeDot={{ r: 8 }} name="New Customers" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              No customer acquisition data available.
            </div>
          )}
          <div className="mt-4 text-sm text-gray-500">
            <p>Total new customers (last 12 months): {customerAcquisitionData.totalNew}</p>
            <p>Monthly average: {customerAcquisitionData.monthlyAvg}</p>
            <p>Growth: {customerAcquisitionData.growth.toFixed(1)}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Customer Retention */}
      <Card className={isDarkMode ? "bg-zinc-900 text-white" : "bg-white text-gray-900"}>
        <CardHeader>
          <CardTitle>Customer Retention</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          {customerRetentionRate.percentage > 0 ||
          (customerRetentionRate.percentage === 0 &&
            customerRetentionRate.description !== "No customers with orders yet.") ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Retained", value: customerRetentionRate.percentage },
                    { name: "Lost", value: 100 - customerRetentionRate.percentage },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  <Cell key={`cell-retained`} fill={COLORS[0]} />
                  <Cell key={`cell-lost`} fill={COLORS[1]} />
                </Pie>
                <Tooltip
                  contentStyle={isDarkMode ? { backgroundColor: "#333", border: "none" } : {}}
                  itemStyle={isDarkMode ? { color: "#fff" } : {}}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              No customer retention data available.
            </div>
          )}
          <div className="mt-4 text-sm text-gray-500 text-center">
            <p>{customerRetentionRate.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
