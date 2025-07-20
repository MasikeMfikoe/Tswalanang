"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const customerData = [
  { name: "Acme Corp", orders: 120, revenue: 150000 },
  { name: "Globex Inc", orders: 90, revenue: 120000 },
  { name: "Stark Ind.", orders: 75, revenue: 90000 },
  { name: "Wayne Ent.", orders: 60, revenue: 80000 },
  { name: "Cyberdyne", orders: 50, revenue: 70000 },
]

export function CustomerStatistics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Customers by Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={customerData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="orders" fill="#8884d8" name="Orders" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
