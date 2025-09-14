"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Package, FileText, Calendar, Truck, Users, ClipboardList, BarChart, MapPin } from "lucide-react" // Import MapPin

import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import type { Order } from "@/types/models" // Import Order type
import { useToast } from "@/components/ui/use-toast" // Import useToast

// Utility function to format dates
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Not available"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid date"

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch (error) {
    return "Invalid date"
  }
}

// Mock data for demonstration (used only as fallback)
const mockRecentOrders: Order[] = [
  {
    id: "ORD-2024-001",
    po_number: "PO-ABC-001",
    status: "In Progress",
    cargo_status: "in-transit",
    freight_type: "Sea Freight",
    estimated_delivery: "2024-02-15",
    customer_name: "Mock Customer",
    customer_id: "mock-id-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    supplier: "Mock Supplier",
    importer: "Mock Importer",
    total_cost: 1000,
    currency: "USD",
    actual_delivery: null,
    tracking_number: "TRACK123", // Added tracking number
    shipping_line: "Line A",
    origin_port: "Port X",
    destination_port: "Port Y",
    vessel_name: "Vessel Z",
    container_number: "CONT123",
    last_event_date: new Date().toISOString(),
    last_event_description: "Departed origin",
    documents: [],
  },
  {
    id: "ORD-2024-002",
    po_number: "PO-ABC-002",
    status: "Completed",
    cargo_status: "delivered",
    freight_type: "Air Freight",
    estimated_delivery: "2024-01-25",
    customer_name: "Mock Customer",
    customer_id: "mock-id-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    supplier: "Mock Supplier",
    importer: "Mock Importer",
    total_cost: 2000,
    currency: "USD",
    actual_delivery: new Date().toISOString(),
    tracking_number: "TRACK456", // Added tracking number
    shipping_line: "Line B",
    origin_port: "Port A",
    destination_port: "Port B",
    vessel_name: "Vessel C",
    container_number: "CONT456",
    last_event_date: new Date().toISOString(),
    last_event_description: "Delivered",
    documents: [],
  },
  {
    id: "ORD-2024-003",
    po_number: "PO-ABC-003",
    status: "Pending",
    cargo_status: "at-origin",
    freight_type: "Sea Freight",
    estimated_delivery: "2024-03-01",
    customer_name: "Mock Customer",
    customer_id: "mock-id-1",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    supplier: "Mock Supplier",
    importer: "Mock Importer",
    total_cost: 1500,
    currency: "USD",
    actual_delivery: null,
    tracking_number: null, // No tracking number for this one
    shipping_line: "Line C",
    origin_port: "Port D",
    destination_port: "Port E",
    vessel_name: "Vessel F",
    container_number: "CONT789",
    last_event_date: new Date().toISOString(),
    last_event_description: "Awaiting pickup",
    documents: [],
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
    return "N/A"
  }
  return status
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")
}

export default function ClientPortalPage() {
  const { user, isLoading: isUserLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast() // Initialize useToast

  const [totalOrders, setTotalOrders] = useState(0)
  const [activeOrders, setActiveOrders] = useState(0)
  const [completedOrders, setCompletedOrders] = useState(0)
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [recentOrders, setRecentOrders] = useState<Order[]>(mockRecentOrders)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClientData = async () => {
    setError(null) // Clear previous errors
    if (!user?.id) {
      // Fallback to mock data if user is not logged in or ID is not available
      console.warn("User ID not available, using mock data for client portal.")
      setTotalOrders(mockRecentOrders.length)
      setActiveOrders((mockRecentOrders || []).filter((o) => o.status === "In Progress").length)
      setCompletedOrders((mockRecentOrders || []).filter((o) => o.status === "Completed").length)
      setTotalDocuments(5) // Mock number of documents
      setRecentOrders(mockRecentOrders)
      setIsLoadingData(false)
      return
    }

    setIsLoadingData(true)
    try {
      // Fetch orders data
      // Pass clientId to the API route. The API will handle filtering based on user role.
      const ordersResponse = await fetch(`/api/client-portal/orders?clientId=${user.id}`)
      const ordersResult = await ordersResponse.json()

      if (ordersResponse.ok && ordersResult.data) {
        const fetchedOrders: Order[] = ordersResult.data
        setTotalOrders(fetchedOrders.length)
        setActiveOrders((fetchedOrders || []).filter((o) => o.status === "In Progress").length)
        setCompletedOrders((fetchedOrders || []).filter((o) => o.status === "Completed").length)
        // Sort recent orders by created_at descending
        const sortedRecentOrders = (fetchedOrders || [])
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5) // Get top 5 recent orders
        setRecentOrders(sortedRecentOrders)
      } else {
        console.error("Failed to fetch orders:", ordersResult.error || ordersResult.message)
        setError(ordersResult.error || ordersResult.message || "Failed to load orders.")
        // Fallback to mock data on API error
        setTotalOrders(mockRecentOrders.length)
        setActiveOrders((mockRecentOrders || []).filter((o) => o.status === "In Progress").length)
        setCompletedOrders((mockRecentOrders || []).filter((o) => o.status === "Completed").length)
        setRecentOrders(mockRecentOrders)
      }

      // Fetch documents data
      const documentsResponse = await fetch(`/api/client-portal/documents?clientId=${user.id}`)
      const documentsResult = await documentsResponse.json()

      if (documentsResponse.ok && documentsResult.data) {
        setTotalDocuments(documentsResult.data.length)
      } else {
        console.warn(
          "Failed to fetch documents, using mock data for count:",
          documentsResult.error || documentsResult.message,
        )
        setTotalDocuments(5) // Fallback mock count
      }
    } catch (err) {
      console.error("Error fetching client portal data:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred.")
      // Fallback to mock data on any error
      setTotalOrders(mockRecentOrders.length)
      setActiveOrders((mockRecentOrders || []).filter((o) => o.status === "In Progress").length)
      setCompletedOrders((mockRecentOrders || []).filter((o) => o.status === "Completed").length)
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

  const handleTrackShipment = (trackingNumber?: string | null) => {
    if (trackingNumber) {
      router.push(`/shipment-tracker/results/${trackingNumber}`)
    } else {
      toast({
        title: "No Tracking Number",
        description: "This order does not have a tracking number available.",
        variant: "default",
      })
    }
  }

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
  if (!user || (user.role !== "client" && user.role !== "guest" && user.role !== "admin" && user.role !== "manager")) {
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

  const isAdmin = user?.role === "admin" || user?.role === "manager"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin banner */}
      {isAdmin && (
        <div className="bg-blue-600 text-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="font-medium">{user?.role === "admin" ? "Admin" : "Manager"} View – Client Portal</span>
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
            {isAdmin
              ? `${user?.role === "admin" ? "Admin" : "Manager"} View - Client Portal`
              : `Welcome, ${user?.department || "Client"}!`}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin
              ? `${user?.role === "admin" ? "Admin" : "Manager"} viewing all client orders`
              : "Your personalized logistics overview."}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

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
              {!recentOrders || recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No recent orders to display.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PO Number</TableHead>
                        {isAdmin && <TableHead>Customer</TableHead>}
                        <TableHead>Status</TableHead>
                        <TableHead>Cargo Status</TableHead>
                        <TableHead>Freight Type</TableHead>
                        <TableHead>Est. Delivery</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(recentOrders || []).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.po_number}</TableCell>
                          {isAdmin && <TableCell>{order.customer_name}</TableCell>}
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCargoStatusColor(order.cargo_status || "")}>
                              {formatCargoStatus(order.cargo_status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.freight_type}</TableCell>
                          <TableCell>{formatDate(order.estimated_delivery)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/client-portal/orders/${order.id}`)}
                              >
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTrackShipment(order.tracking_number)}
                                disabled={!order.tracking_number}
                              >
                                <MapPin className="h-4 w-4 mr-1" />
                                Track
                              </Button>
                            </div>
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
