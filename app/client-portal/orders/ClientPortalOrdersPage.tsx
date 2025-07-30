"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, DollarSign, Filter, Package, Search, Truck } from "lucide-react"

import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import { format } from "date-fns"

interface Order {
  id: string
  po_number: string
  status: string
  cargo_status: string
  freight_type: string
  total_value: number
  created_at: string
  estimated_delivery: string
  supplier: string
  destination: string
  vessel_name: string
  eta_at_port: string
  tracking_number?: string
}

// Mock data - used as fallback if API fails or no customer ID
const mockClientOrders: Order[] = [
  {
    id: "ORD-2024-001",
    po_number: "PO-ABC-001",
    status: "In Progress",
    cargo_status: "in-transit",
    freight_type: "Sea Freight",
    total_value: 25000,
    created_at: "2024-01-15T10:00:00Z",
    estimated_delivery: "2024-02-15T10:00:00Z",
    supplier: "Global Electronics Ltd",
    destination: "Cape Town, South Africa",
    vessel_name: "MSC Pamela",
    eta_at_port: "2024-02-10T10:00:00Z",
    tracking_number: "MRSU0547355",
  },
  {
    id: "ORD-2024-002",
    po_number: "PO-ABC-002",
    status: "Completed",
    cargo_status: "delivered",
    freight_type: "Air Freight",
    total_value: 15000,
    created_at: "2024-01-10T10:00:00Z",
    estimated_delivery: "2024-01-25T10:00:00Z",
    supplier: "Tech Components Inc",
    destination: "Johannesburg, South Africa",
    vessel_name: "N/A",
    eta_at_port: "2024-01-20T10:00:00Z",
    tracking_number: "AIRTRACK123",
  },
  {
    id: "ORD-2024-003",
    po_number: "PO-ABC-003",
    status: "Pending",
    cargo_status: "at-origin",
    freight_type: "Sea Freight",
    total_value: 35000,
    created_at: "2024-01-20T10:00:00Z",
    estimated_delivery: "2024-03-01T10:00:00Z",
    supplier: "Industrial Supplies Co",
    destination: "Durban, South Africa",
    vessel_name: "Maersk Seletar",
    eta_at_port: "2024-02-25T10:00:00Z",
    tracking_number: "MAEU9876543",
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

const formatCargoStatus = (status: string) =>
  status
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "TBD"
  try {
    return format(new Date(dateString), "dd MMM yyyy")
  } catch (e) {
    console.error("Error formatting date:", dateString, e)
    return "Invalid Date"
  }
}

export default function ClientPortalOrdersPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [freightFilter, setFreightFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomerOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    if (!user?.id) {
      setLoading(false)
      setError("User not logged in or user ID not available.")
      setOrders(mockClientOrders) // Fallback to mock data
      return
    }

    try {
      // Fetch customer-specific orders using clientId
      const response = await fetch(`/api/client-portal/orders?clientId=${user.id}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch orders from API.")
      }
      const data = await response.json()
      if (data.success) {
        // Transform API data to match our interface
        const transformedOrders = data.data.orders.map((order: any) => ({
          id: order.id,
          po_number: order.po_number || order.poNumber,
          status: order.status,
          cargo_status: order.cargo_status || order.cargoStatus,
          freight_type: order.freight_type || order.freightType,
          total_value: order.total_value || order.totalValue,
          created_at: order.created_at || order.createdAt,
          estimated_delivery: order.estimated_delivery || order.estimatedDelivery,
          supplier: order.supplier,
          destination: order.destination,
          vessel_name: order.vessel_name || order.vesselName,
          eta_at_port: order.eta_at_port || order.etaAtPort,
          tracking_number: order.tracking_number || order.trackingNumber,
        }))
        setOrders(transformedOrders)
      } else {
        setOrders(mockClientOrders) // Fallback to mock data if API returns success: false
        setError("API returned success: false. Using mock data.")
      }
    } catch (err: any) {
      console.error("Error fetching orders:", err)
      setError(err.message || "An unexpected error occurred while fetching orders. Using mock data.")
      setOrders(mockClientOrders) // Fallback to mock data on error
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!isAuthLoading) {
      fetchCustomerOrders()
    }
  }, [isAuthLoading, fetchCustomerOrders])

  useEffect(() => {
    let next = orders

    if (searchTerm) {
      next = next.filter(
        (o) =>
          o.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.destination.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    if (statusFilter !== "all") {
      next = next.filter((o) => o.status.toLowerCase() === statusFilter)
    }
    if (freightFilter !== "all") {
      next = next.filter((o) => o.freight_type.toLowerCase() === freightFilter)
    }
    setFilteredOrders(next)
  }, [searchTerm, statusFilter, freightFilter, orders])

  const handleTrackOrder = (order: Order) => {
    if (order.tracking_number) {
      router.push(`/client-portal/tracking/${order.id}?trackingNumber=${order.tracking_number}`)
    } else {
      router.push(`/client-portal/tracking/${order.id}`)
    }
  }

  const isAdmin = user?.role === "admin"

  if (isAuthLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-2 text-gray-500">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (error && orders.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Loading Orders</AlertTitle>
          <AlertDescription>
            {error} Please ensure your Supabase database is correctly configured and accessible.
          </AlertDescription>
        </Alert>
        <div className="py-12 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No orders found</h3>
          <p className="text-gray-600">Try adjusting your search or filters.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin banner */}
      {isAdmin && (
        <div className="bg-blue-600 text-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <span className="font-medium">Admin View – Client Orders</span>
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

      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isAdmin ? "Admin View – Client Orders" : `${user?.department || "Company"} Orders`}
            </h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? "Admin viewing client orders" : `Welcome ${user?.department || "Company"}`}
            </p>
            <p className="text-gray-600 text-sm mt-1">
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

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

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" /> Filter Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search PO, supplier or destination…"
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
                  <SelectItem value="in progress">In-Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={freightFilter} onValueChange={setFreightFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by freight" />
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

        {/* Quick summary cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">Your recent order activity</p>
              <div className="space-y-2 text-sm">
                {orders.slice(0, 2).map((order) => (
                  <div key={order.id}>
                    <span className="font-medium">{order.po_number}</span> – {order.status}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> Order Summary
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

        {/* Orders table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders List</CardTitle>
            <CardDescription>
              {filteredOrders.length} of {orders.length} orders shown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">No orders found</h3>
                <p className="text-gray-600">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Freight Type</TableHead>
                      <TableHead>Vessel Name</TableHead>
                      <TableHead>Cargo Status</TableHead>
                      <TableHead>ETA at Port</TableHead>
                      <TableHead>Est. Delivery</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.po_number}</TableCell>
                        <TableCell>{order.supplier}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>{order.freight_type}</TableCell>
                        <TableCell>{order.vessel_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={getCargoStatusColor(order.cargo_status)}>
                              {formatCargoStatus(order.cargo_status)}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTrackOrder(order)}
                              className="h-6 px-2 text-xs"
                            >
                              <Truck className="h-3 w-3 mr-1" />
                              Track
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(order.eta_at_port)}</TableCell>
                        <TableCell>{formatDate(order.estimated_delivery)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/client-portal/orders/${order.id}`)}
                            className="h-6 px-2 text-xs"
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
