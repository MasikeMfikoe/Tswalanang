"use client"
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useTheme } from "next-themes"

type ChartData = {
  name: string
  value: number
  color?: string
}

interface ChartProps {
  data: Array<{
    name: string
    value: number
  }>
  colors?: string[]
}

export function BarChart({ data, colors = ["#3b82f6", "#6366f1", "#8b5cf6", "#ec4899"] }: ChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsBarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "#888888" }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
        <YAxis
          tick={{ fill: "#888888" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <Tooltip
          formatter={(value: number) => [value.toLocaleString(), "Count"]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "0.375rem",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export function LineChart({ data }: { data: ChartData[] }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} />
        <XAxis
          dataKey="name"
          tick={{ fill: isDark ? "#aaa" : "#666" }}
          axisLine={{ stroke: isDark ? "#333" : "#eee" }}
        />
        <YAxis tick={{ fill: isDark ? "#aaa" : "#666" }} axisLine={{ stroke: isDark ? "#333" : "#eee" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#222" : "#fff",
            borderColor: isDark ? "#333" : "#ddd",
            color: isDark ? "#fff" : "#000",
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: "#3b82f6", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export function PieChartComponent({ data, colors = ["#3b82f6", "#6366f1", "#8b5cf6", "#ec4899"] }: ChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [value.toLocaleString(), "Count"]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "0.375rem",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
