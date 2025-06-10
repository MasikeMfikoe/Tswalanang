"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Search, Package, Calendar, DollarSign, Eye, Filter } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock orders data - in real app, this would come from API filtered by client
const mockClientOrders = [
  {
    id: "ORD-2024-001",
    poNumber: "PO-ABC-001",
    status: "In Progress",
    cargoStatus: "in-transit",
    freightType: "Sea Freight",
    totalValue: 25000,
    createdAt: "2024-01-15",
    estimatedDelivery: "2024-02-15",
    supplier: "Global Electronics Ltd",
    destination: "Cape Town, South Africa",
  },
  {
    id: "ORD-2024-002",
    poNumber: "PO-ABC-002",
    status: "Completed",
    cargoStatus: "delivered",
    freightType: "Air Freight",
    totalValue: 15000,
    createdAt: "2024-01-10",
    estimatedDelivery: "2024-01-25",
    supplier: "Tech Components Inc",
    destination: "Johannesburg, South Africa",
  },
  {
    id: "ORD-2024-003",
    poNumber: "PO-ABC-003",
    status: "Pending",
    cargoStatus: "at-origin",
    freightType: "Sea Freight",
    totalValue: 35000,
    createdAt: "2024-01-20",
    estimatedDelivery: "2024-03-01",
    supplier: "Industrial Supplies Co",
    destination: "Durban, South Africa",
  },
]

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "in progress":
      return "bg-blue-100 text-blue-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getCargoStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800"
    case "in-transit":
      return "bg-blue-100 text-blue-800"
    case "at-origin":
      return "bg-orange-100 text-orange-800"
    case "at-destination":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const formatCargoStatus = (status: string) => {
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export default function ClientPortalOrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState(mockClientOrders)
  const [filteredOrders, setFilteredOrders] = useState(mockClientOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [freightFilter, setFreightFilter] = useState("all")

  // Filter orders based on search and filters
  useEffect(() => {
    let filtered = orders

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.destination.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status.toLowerCase() === statusFilter.toLowerCase())
    }

    // Freight type filter
    if (freightFilter !== "all") {
      filtered = filtered.filter((order) => order.freightType.toLowerCase() === freightFilter.toLowerCase())
    }

    setFilteredOrders(filtered)
  }, [searchTerm, statusFilter, freightFilter, orders])

  const isAdmin = user?.role === "admin"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Banner */}
      {isAdmin && (
        <div className="bg-blue-600 text-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <span className="font-medium">Admin View - Client Portal Orders</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/client-portal")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? "Admin viewing client orders" : `Welcome ${user?.name}, here are your orders`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{filteredOrders.length}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by PO number, supplier, or destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={freightFilter} onValueChange={setFreightFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by freight type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Freight Types</SelectItem>
                  <SelectItem value="sea freight">Sea Freight</SelectItem>
                  <SelectItem value="air freight">Air Freight</SelectItem>
                  <SelectItem value="exw">EXW</SelectItem>
                  <SelectItem value="fob">FOB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders List</CardTitle>
            <CardDescription>
              {filteredOrders.length} of {orders.length} orders shown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cargo Status</TableHead>
                      <TableHead>Freight Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Est. Delivery</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.poNumber}</TableCell>
                        <TableCell>{order.supplier}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCargoStatusColor(order.cargoStatus)}>
                            {formatCargoStatus(order.cargoStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.freightType}</TableCell>
                        <TableCell>R {order.totalValue.toLocaleString()}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(order.estimatedDelivery).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Link href={`/client-portal/orders/${order.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Total Order Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-green-600">
                  R {orders.reduce((total, order) => total + order.totalValue, 0).toLocaleString()}
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Active Orders:</span>
                    <span className="font-medium">
                      R{" "}
                      {orders
                        .filter((o) => o.status !== "Completed")
                        .reduce((total, order) => total + order.totalValue, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed Orders:</span>
                    <span className="font-medium">
                      R{" "}
                      {orders
                        .filter((o) => o.status === "Completed")
                        .reduce((total, order) => total + order.totalValue, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View your recent order activity</p>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">PO-ABC-001</span> - Status updated
                </div>
                <div className="text-sm">
                  <span className="font-medium">PO-ABC-002</span> - Delivered
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Orders:</span>
                  <span className="font-medium">{orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>In Progress:</span>
                  <span className="font-medium text-blue-600">
                    {orders.filter((o) => o.status === "In Progress").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-medium text-green-600">
                    {orders.filter((o) => o.status === "Completed").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
