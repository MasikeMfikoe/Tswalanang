"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Truck, Package, Clock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getCustomerSummaryData } from "@/lib/customer-summary-data" // Assuming this function exists

interface CustomerSummary {
  customerName: string
  contactEmail: string
  totalOrders: number
  totalRevenue: number
  avgDeliveryTime: string
  onTimeDeliveryRate: string
  orderVolumeByMonth: { name: string; orders: number }[]
  revenueByMonth: { name: string; revenue: number }[]
  recentOrders: {
    id: string
    status: string
    origin: string
    destination: string
    eta: string
    value: number
  }[]
}

export default function CustomerSummaryReportPage() {
  const [summary, setSummary] = useState<CustomerSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      setError(null)
      try {
        // In a real app, you'd pass a customer ID to fetch specific data
        const data = await getCustomerSummaryData("customer123")
        setSummary(data)
      } catch (err) {
        setError("Failed to load customer summary data.")
        console.error("Error fetching customer summary:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <PageHeader
          title="Customer Summary Report"
          description="Detailed financial and operational summary for customers."
        />
        <p>Loading summary data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <PageHeader
          title="Customer Summary Report"
          description="Detailed financial and operational summary for customers."
        />
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <PageHeader
          title="Customer Summary Report"
          description="Detailed financial and operational summary for customers."
        />
        <p>No summary data available.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={`Customer Summary Report: ${summary.customerName}`}
        description={`Detailed financial and operational summary for ${summary.customerName}.`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Customer Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <p>
              <strong>Name:</strong> {summary.customerName}
            </p>
            <p>
              <strong>Contact:</strong> {summary.contactEmail}
            </p>
            <p>
              <strong>Account Status:</strong> Active
            </p>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Delivery Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgDeliveryTime}</div>
            <p className="text-xs text-muted-foreground">Improved by 5%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Delivery Rate</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.onTimeDeliveryRate}</div>
            <p className="text-xs text-muted-foreground">Consistent performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Order Volume by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary.orderVolumeByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue by Month Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={summary.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#82ca9d" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{order.origin}</TableCell>
                  <TableCell>{order.destination}</TableCell>
                  <TableCell>{order.eta}</TableCell>
                  <TableCell className="text-right">${order.value.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
