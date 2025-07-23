"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChartProps {
  type: "bar" | "line"
  data: any[]
  title: string
  xAxisDataKey: string
  series: { dataKey: string; color: string; name: string }[]
}

export function Charts({ type, data, title, xAxisDataKey, series }: ChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {type === "bar" ? (
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisDataKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {series.map((s, index) => (
                <Bar key={index} dataKey={s.dataKey} fill={s.color} name={s.name} />
              ))}
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisDataKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {series.map((s, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={s.dataKey}
                  stroke={s.color}
                  name={s.name}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
