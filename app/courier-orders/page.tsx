"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Sample data for courier orders
const courierOrders = [
  {
    id: "CO-001",
    sender: "Acme Corp",
    recipient: "TechGiant Inc",
    date: "2023-05-15",
    status: "Delivered",
    priority: "High",
  },
  {
    id: "CO-002",
    sender: "Global Logistics",
    recipient: "City Distributors",
    date: "2023-05-14",
    status: "In Transit",
    priority: "Medium",
  },
  {
    id: "CO-003",
    sender: "Express Shipping",
    recipient: "Quick Delivery Co",
    date: "2023-05-13",
    status: "Processing",
    priority: "Low",
  },
  {
    id: "CO-004",
    sender: "Fast Freight Ltd",
    recipient: "Warehouse Solutions",
    date: "2023-05-12",
    status: "Delivered",
    priority: "Medium",
  },
  {
    id: "CO-005",
    sender: "Package Plus",
    recipient: "Office Supplies Inc",
    date: "2023-05-11",
    status: "Cancelled",
    priority: "High",
  },
]

export default function CourierOrdersPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredOrders = courierOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Courier Orders</h1>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
          <Button onClick={() => router.push("/courier-orders/new")}>Create New Courier Order</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Courier Orders</CardTitle>
            <Input
              placeholder="Search courier orders..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.sender}</TableCell>
                  <TableCell>{order.recipient}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "Delivered"
                          ? "default"
                          : order.status === "In Transit"
                            ? "secondary"
                            : order.status === "Processing"
                              ? "outline"
                              : "destructive"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.priority === "High"
                          ? "destructive"
                          : order.priority === "Medium"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {order.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/courier-orders/details/${order.id}`)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
