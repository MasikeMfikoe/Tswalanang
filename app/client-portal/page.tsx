"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Package, FileText, Truck, Search } from "lucide-react"
import { useRouter } from "next/navigation"

interface ClientOrder {
  id: string
  order_number: string
  po_number?: string
  status: string
  cargo_status: string
  origin: string
  destination: string
  created_at: string
  estimated_delivery?: string
  tracking_number?: string
}

export default function ClientPortal() {
  const { user } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<ClientOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<ClientOrder[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for demonstration - in production this would come from Supabase
  const mockClientOrders: ClientOrder[] = [
    {
      id: "ord-001",
      order_number: "ORD-2024-001",
      po_number: "PO-ABC-123",
      status: "In Progress",
      cargo_status: "in-transit",
      origin: "Shanghai, China",
      destination: "Cape Town, South Africa",
      created_at: "2024-01-15T10:00:00Z",
      estimated_delivery: "2024-02-15T10:00:00Z",
      tracking_number: "MRSU0547355",
    },
    {
      id: "ord-002",
      order_number: "ORD-2024-002",
      po_number: "PO-XYZ-456",
      status: "Completed",
      cargo_status: "delivered",
      origin: "Hamburg, Germany",
      destination: "Durban, South Africa",
      created_at: "2024-01-10T08:00:00Z",
      estimated_delivery: "2024-01-25T08:00:00Z",
      tracking_number: "MAEU1234567",
    },
    {
      id: "ord-003",
      order_number: "ORD-2024-003",
      po_number: "PO-DEF-789",
      status: "Pending",
      cargo_status: "at-origin",
      origin: "Los Angeles, USA",
      destination: "Cape Town, South Africa",
      created_at: "2024-01-20T14:00:00Z",
      estimated_delivery: "2024-02-20T14:00:00Z",
      tracking_number: "MSCU9876543",
    },
  ]

  useEffect(() => {
    fetchClientOrders()
  }, [user])

  useEffect(() => {
    // Filter orders based on search term
    const filtered = orders.filter(
      (order) =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredOrders(filtered)
  }, [orders, searchTerm])

  const fetchClientOrders = async () => {
    try {
      setIsLoading(true)

      if (!user) return

      // For demo purposes, use mock data
      // In production, this would filter orders by client ID
      /*
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id) // or however you link orders to clients
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setOrders(data || [])
      */

      // Using mock data for demonstration
      setOrders(mockClientOrders)
    } catch (error) {
      console.error("Error fetching client orders:", error)
      setOrders(mockClientOrders) // Fallback to mock data
    } finally {
      setIsLoading(false)
    }
  }

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
    switch (status.toLowerCase()) {
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

  const handleViewOrder = (orderId: string) => {
    router.push(`/client-portal/orders/${orderId}`)
  }

  const handleTrackShipment = (trackingNumber: string) => {
    router.push(`/shipment-tracker?container=${trackingNumber}`)
  }

  if (!user || (user.role !== "client" && user.role !== "guest")) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">This portal is only accessible to client users.</p>
            <Button className="w-full mt-4" onClick={() => router.push("/login")}>
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user.name} {user.surname}
          </h1>
          <p className="text-gray-600 mt-2">Track your shipments and manage your orders</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Transit</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter((o) => o.cargo_status === "in-transit").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter((o) => o.cargo_status === "delivered").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter((o) => o.status === "Pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="tracking">Quick Track</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by order number, PO number, or tracking number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            <div className="space-y-4">
              {isLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-gray-600">Loading your orders...</p>
                  </CardContent>
                </Card>
              ) : filteredOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-gray-600">
                      {searchTerm ? "No orders found matching your search." : "No orders found."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-4">
                            <h3 className="text-lg font-semibold">{order.order_number}</h3>
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                            <Badge className={getCargoStatusColor(order.cargo_status)}>
                              {order.cargo_status.replace("-", " ")}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">PO Number:</span> {order.po_number || "N/A"}
                            </div>
                            <div>
                              <span className="font-medium">Origin:</span> {order.origin}
                            </div>
                            <div>
                              <span className="font-medium">Destination:</span> {order.destination}
                            </div>
                            <div>
                              <span className="font-medium">Created:</span>{" "}
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="font-medium">Est. Delivery:</span>{" "}
                              {order.estimated_delivery
                                ? new Date(order.estimated_delivery).toLocaleDateString()
                                : "TBD"}
                            </div>
                            <div>
                              <span className="font-medium">Tracking:</span> {order.tracking_number || "N/A"}
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewOrder(order.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {order.tracking_number && (
                            <Button size="sm" onClick={() => handleTrackShipment(order.tracking_number!)}>
                              <Truck className="h-4 w-4 mr-2" />
                              Track Shipment
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="tracking">
            <Card>
              <CardHeader>
                <CardTitle>Quick Shipment Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Enter a container number or bill of lading to track your shipment.</p>
                <Button onClick={() => router.push("/shipment-tracker")} className="w-full md:w-auto">
                  <Truck className="h-4 w-4 mr-2" />
                  Go to Shipment Tracker
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
