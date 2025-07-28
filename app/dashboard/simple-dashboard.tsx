"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SimpleDashboard() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">123</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">R 45,678</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">56</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">78%</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="p-2 bg-gray-100 rounded-md">Order #12345 was created</li>
              <li className="p-2 bg-gray-100 rounded-md">Customer ABC Ltd added</li>
              <li className="p-2 bg-gray-100 rounded-md">Delivery completed for Order #12340</li>
              <li className="p-2 bg-gray-100 rounded-md">New rate card uploaded</li>
              <li className="p-2 bg-gray-100 rounded-md">User login from new device</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
