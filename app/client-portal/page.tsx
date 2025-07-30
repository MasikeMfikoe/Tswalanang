"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Package, FileText, Calendar, Truck, Users, ClipboardList, BarChart } from "lucide-react"

import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"
import { formatDate } from "@/lib/utils" // Import the new utility

// Mock data for demonstration
const mockRecentOrders = [
  {
    id: "ORD-2024-001",
    poNumber: "PO-ABC-001",
    status: "In Progress",
    cargoStatus: "in-transit",
    freightType: "Sea Freight",
    estimatedDelivery: "2024-02-15",
  },
  {
    id: "ORD-2024-002",
    poNumber: "PO-ABC-002",
    status: "Completed",
    cargoStatus: "delivered",
    freightType: "Air Freight",
    estimatedDelivery: "2024-01-25",
  },
  {
    id: "ORD-2024-003",
    poNumber: "PO-ABC-003",
    status: "Pending",
    cargoStatus: "at-origin",
    freightType: "Sea Freight",
    estimatedDelivery: "2024-03-01",
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

const formatCargoStatus = (status: string | null | undefined) => {
  if (!status) {
    return "N/A" // Return a default string if status is null or undefined
  }
  return status
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")
}

export default function ClientPortalPage() {
  const { user, isLoading: isUserLoading } = useAuth()
  const router = useRouter()

  const [totalOrders, setTotalOrders] = useState(0)
  const [activeOrders, setActiveOrders] = useState(0)
  const [completedOrders, setCompletedOrders] = useState(0)
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [recentOrders, setRecentOrders] = useState(mockRecentOrders)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const fetchClientData = async () => {
    if (!user?.id) {
      // Fallback to mock data if user is not logged in or ID is not available
      setTotalOrders(mockRecentOrders.length)
      setActiveOrders(mockRecentOrders.filter((o) => o.status === "In Progress").length)
      setCompletedOrders(mockRecentOrders.filter((o) => o.status === "Completed").length)
      setTotalDocuments(5) // Mock number of documents
      setRecentOrders(mockRecentOrders)
      setIsLoadingData(false)
      return
    }

    setIsLoadingData(true)
    try {
      // Fetch orders data
      const ordersResponse = await fetch(`/api/client-portal/orders?clientId=${user.id}`)
      const ordersData = await ordersResponse.json()

      if (ordersData.success && ordersData.data.orders) {
        setTotalOrders(ordersData.data.orders.length)
        setActiveOrders(ordersData.data.orders.filter((o: any) => o.status === "In Progress").length)
        setCompletedOrders(ordersData.data.orders.filter((o: any) => o.status === "Completed").length)
        // Sort recent orders by created_at descending
        const sortedRecentOrders = ordersData.data.orders
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5) // Get top 5 recent orders
          .map((o: any) => ({
            id: o.id,
            poNumber: o.po_number,
            status: o.status,
            cargoStatus: o.cargo_status || "unknown", // Provide a default if null/undefined
            freightType: o.freight_type,
            estimatedDelivery: o.estimated_delivery ? String(o.estimated_delivery) : null, // Ensure string or null
          }))
        setRecentOrders(sortedRecentOrders)
      } else {
        console.warn("Failed to fetch orders, using mock data:", ordersData.error)
        setTotalOrders(mockRecentOrders.length)
        setActiveOrders(mockRecentOrders.filter((o) => o.status === "In Progress").length)
        setCompletedOrders(mockRecentOrders.filter((o) => o.status === "Completed").length)
        setRecentOrders(mockRecentOrders)
      }

      // Fetch documents data
      const documentsResponse = await fetch(`/api/client-portal/documents?clientId=${user.id}`)
      const documentsData = await documentsResponse.json()

      if (documentsData.success && documentsData.data.documents) {
        setTotalDocuments(documentsData.data.documents.length)
      } else {
        console.warn("Failed to fetch documents, using mock data for count:", documentsData.error)
        setTotalDocuments(5) // Fallback mock count
      }
    } catch (error) {
      console.error("Error fetching client portal data:", error)
      // Fallback to mock data on any error
      setTotalOrders(mockRecentOrders.length)
      setActiveOrders(mockRecentOrders.filter((o) => o.status === "In Progress").length)
      setCompletedOrders(mockRecentOrders.filter((o) => o.status === "Completed").length)
      setTotalDocuments(5)
      setRecentOrders(mockRecentOrders)
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    fetchClientData()

    // Set up Realtime subscriptions
    const ordersChannel = supabase
      .channel("client_portal_orders_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        console.log("Realtime order change received for client portal!", payload)
        fetchClientData() // Re-fetch all data on order change
      })
      .subscribe()

    const documentsChannel = supabase
      .channel("client_portal_documents_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "documents" }, (payload) => {
        console.log("Realtime document change received for client portal!", payload)
        fetchClientData() // Re-fetch all data on document change
      })
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(documentsChannel)
    }
  }, [user?.id]) // Re-run effect if user ID changes

  if (isUserLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading client portal...</p>
        </div>
      </div>
    )
  }

  // Redirect if not a client or guest user
  if (!user || (user.role !== "client" && user.role !== "guest" && user.role !== "admin")) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">You don't have permission to access the client portal.</p>
            <Button className="w-full mt-4" onClick={() => router.push("/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isAdmin = user?.role === "admin"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin banner */}
      {isAdmin && (
        <div className="bg-blue-600 text-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="font-medium">Admin View – Client Portal</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? "Admin View - Client Portal" : `Welcome, ${user?.department || "Client"}!`}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? "Admin viewing client portal" : "Your personalized logistics overview."}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Shipments</p>
                  <p className="text-2xl font-bold text-orange-600">{activeOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ClipboardList className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                  <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conditionally render Total Documents card */}
          {isAdmin && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Documents</p>
                    <p className="text-2xl font-bold text-purple-600">{totalDocuments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Recent Orders
              </CardTitle>
              <CardDescription>Your latest shipment activities.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No recent orders to display.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cargo Status</TableHead>
                        <TableHead>Freight Type</TableHead>
                        <TableHead>Est. Delivery</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.poNumber}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCargoStatusColor(order.cargoStatus)}>
                              {formatCargoStatus(order.cargoStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.freightType}</TableCell>
                          <TableCell>{formatDate(order.estimatedDelivery)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/client-portal/orders/${order.id}`)}
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" /> Quick Actions
              </CardTitle>
              <CardDescription>Navigate quickly to key sections.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={() => router.push("/client-portal/orders")}>
                <Package className="h-4 w-4 mr-2" /> View All Orders
              </Button>
              {/* Conditionally render View All Documents button */}
              {isAdmin && (
                <Button className="w-full" onClick={() => router.push("/client-portal/documents")}>
                  <FileText className="h-4 w-4 mr-2" /> View All Documents
                </Button>
              )}
              <Button className="w-full" onClick={() => router.push("/shipment-tracker")}>
                <Truck className="h-4 w-4 mr-2" /> Track a Shipment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
