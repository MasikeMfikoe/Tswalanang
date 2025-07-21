import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Package, Truck } from "lucide-react"

export default function CustomerSummaryReportPage() {
  const customer = {
    id: "cust123",
    name: "Global Freight Solutions",
    totalOrders: 150,
    completedOrders: 120,
    inTransitOrders: 25,
    pendingOrders: 5,
    totalSpend: 125000.0,
    averageDeliveryTime: "3.5 days",
    onTimeDeliveryRate: "95%",
    lastActivity: "2024-07-20",
    topRoutes: [
      { origin: "Shanghai", destination: "Rotterdam", count: 30 },
      { origin: "New York", destination: "London", count: 20 },
    ],
    recentOrders: [
      { id: "ORD001", status: "Delivered", value: 1200, date: "2024-07-18" },
      { id: "ORD002", status: "In Transit", value: 5000, date: "2024-07-15" },
      { id: "ORD003", status: "Pending", value: 350, date: "2024-07-10" },
    ],
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Customer Summary: {customer.name}</h1>
        <Button>Download Report</Button>
      </header>
      <main className="flex-1 p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.totalOrders}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {customer.completedOrders} completed, {customer.inTransitOrders} in transit
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${customer.totalSpend.toLocaleString()}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Across all shipments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Delivery Rate</CardTitle>
            <Truck className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.onTimeDeliveryRate}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Average: {customer.averageDeliveryTime}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Overview of the customer's latest shipments.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "Delivered"
                            ? "success"
                            : order.status === "In Transit"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${order.value.toLocaleString()}</TableCell>
                    <TableCell>{order.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Shipping Routes</CardTitle>
            <CardDescription>Most frequently used routes by this customer.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origin</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Shipments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.topRoutes.map((route, index) => (
                  <TableRow key={index}>
                    <TableCell>{route.origin}</TableCell>
                    <TableCell>{route.destination}</TableCell>
                    <TableCell>{route.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function Button({ children, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      {...props}
    >
      {children}
    </button>
  )
}
