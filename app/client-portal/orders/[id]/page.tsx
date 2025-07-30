"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, FileText, Calendar, Ship } from "lucide-react"

import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabaseClient" // Import supabase

// Define types for better clarity
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
  origin: string
  vessel_name?: string
  eta_at_port?: string
  customer_id: string
}

interface Document {
  id: string
  document_type: string
  file_name: string
  url: string
  created_at: string
  order_id: string
  client_accessible: boolean
}

interface Event {
  id: string
  timestamp: string
  location: string
  description: string
}

// ─────────────────────────────────────────────────────────────────────────
//  MOCK DATA (for demonstration if API fails or user is not logged in)
// ─────────────────────────────────────────────────────────────────────────
const mockOrderDetails: Order = {
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
  origin: "Shanghai, China",
  vessel_name: "MSC Pamela",
  eta_at_port: "2024-02-10T10:00:00Z",
  customer_id: "mock-customer-123",
}

const mockDocuments: Document[] = [
  {
    id: "DOC-001",
    document_type: "Bill of Lading",
    file_name: "BL_PO-ABC-001.pdf",
    url: "/placeholder.svg?height=24&width=24",
    created_at: "2024-01-16T11:00:00Z",
    order_id: "ORD-2024-001",
    client_accessible: true,
  },
  {
    id: "DOC-002",
    document_type: "Commercial Invoice",
    file_name: "CI_PO-ABC-001.pdf",
    url: "/placeholder.svg?height=24&width=24",
    created_at: "2024-01-17T12:00:00Z",
    order_id: "ORD-2024-001",
    client_accessible: true,
  },
]

const mockEventHistory: Event[] = [
  {
    id: "EVT-001",
    timestamp: "2024-01-15T10:00:00Z",
    location: "Shanghai Port",
    description: "Cargo received at origin port",
  },
  {
    id: "EVT-002",
    timestamp: "2024-01-18T15:00:00Z",
    location: "Shanghai Port",
    description: "Loaded onto vessel MSC Pamela",
  },
  {
    id: "EVT-003",
    timestamp: "2024-01-19T08:00:00Z",
    location: "At Sea",
    description: "Vessel departed origin port",
  },
]

// ─────────────────────────────────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────────────────────────────────
const getStatusColor = (status?: string | null) => {
  if (!status) return "bg-gray-100 text-gray-800"
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

const getCargoStatusColor = (status?: string | null) => {
  if (!status) return "bg-gray-100 text-gray-800"
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

const formatCargoStatus = (status?: string | null) =>
  status
    ? status
        .split("-")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(" ")
    : "N/A"

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch (e) {
    return "Invalid Date"
  }
}

const formatDateTime = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (e) {
    return "Invalid Date"
  }
}

// ─────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────
export default function ClientPortalOrderDetailsPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const orderId = params.id

  const [order, setOrder] = useState<Order | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [eventHistory, setEventHistory] = useState<Event[]>([]) // Assuming event history is part of order details or a separate fetch
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrderDetails = async () => {
    if (!user?.id) {
      setOrder(mockOrderDetails)
      setDocuments(mockDocuments)
      setEventHistory(mockEventHistory)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      // Fetch order details
      const orderResponse = await fetch(`/api/client-portal/orders/${orderId}?clientId=${user.id}`)
      if (!orderResponse.ok) {
        throw new Error(`Failed to fetch order details: ${orderResponse.statusText}`)
      }
      const orderData = await orderResponse.json()
      if (orderData.success && orderData.data.order) {
        setOrder(orderData.data.order)
      } else {
        console.warn("API returned success: false for order details, using mock data.", orderData.error)
        setOrder(mockOrderDetails)
      }

      // Fetch documents for this order
      const documentsResponse = await fetch(`/api/client-portal/documents?orderId=${orderId}&clientId=${user.id}`)
      if (!documentsResponse.ok) {
        throw new Error(`Failed to fetch documents: ${documentsResponse.statusText}`)
      }
      const documentsData = await documentsResponse.json()
      if (documentsData.success && documentsData.data.documents) {
        // Filter for client_accessible documents
        const accessibleDocs = documentsData.data.documents.filter((doc: Document) => doc.client_accessible)
        setDocuments(accessibleDocs)
      } else {
        console.warn("API returned success: false for documents, using mock data.", documentsData.error)
        setDocuments(mockDocuments)
      }

      // For event history, assuming it's either part of the order object or a separate API
      // For now, using mock data or an empty array if not available
      setEventHistory(mockEventHistory) // Replace with actual API call if available
    } catch (err: any) {
      console.error("Error fetching order details:", err)
      setError(err.message || "Failed to load order details.")
      setOrder(mockOrderDetails) // Fallback to mock data on error
      setDocuments(mockDocuments)
      setEventHistory(mockEventHistory)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderDetails()

    // Set up Realtime subscriptions for this specific order and its documents
    const orderChannel = supabase
      .channel(`order_details_${orderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => {
          console.log("Realtime order details change:", payload)
          fetchOrderDetails() // Re-fetch data on any change to this specific order
        },
      )
      .subscribe()

    const documentsChannel = supabase
      .channel(`order_documents_${orderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "documents", filter: `order_id=eq.${orderId}` },
        (payload) => {
          console.log("Realtime document change for order:", payload)
          fetchOrderDetails() // Re-fetch documents on any change to documents linked to this order
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(orderChannel)
      supabase.removeChannel(documentsChannel)
    }
  }, [orderId, user?.id]) // Re-run effect if orderId or user ID changes

  const isAdmin = user?.role === "admin"

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading order details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
          <p className="font-semibold">Error loading data:</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={fetchOrderDetails}>Retry</Button>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Order Not Found</h2>
        <p className="text-gray-600 mb-4">The order with ID "{orderId}" could not be found.</p>
        <Button onClick={() => router.push("/client-portal/orders")}>Back to Orders</Button>
      </div>
    )
  }

  // Check if the logged-in user is authorized to view this order
  // Admin users can view any order. Client users can only view their own orders.
  if (!isAdmin && user?.customer_id !== order.customer_id) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Unauthorized Access</h2>
        <p className="text-gray-600 mb-4">You do not have permission to view this order.</p>
        <Button onClick={() => router.push("/client-portal/orders")}>Back to Orders</Button>
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
              <span className="font-medium">Admin View – Order Details</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Order Details: {order.po_number || order.id}</h1>
            <p className="text-gray-600 mt-1">Comprehensive view of your shipment</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/client-portal/orders")}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" /> Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">PO Number:</p>
                <p className="font-medium">{order.po_number}</p>
              </div>
              <div>
                <p className="text-gray-500">Status:</p>
                <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
              </div>
              <div>
                <p className="text-gray-500">Cargo Status:</p>
                <Badge className={getCargoStatusColor(order.cargo_status)}>
                  {formatCargoStatus(order.cargo_status)}
                </Badge>
              </div>
              <div>
                <p className="text-gray-500">Freight Type:</p>
                <p className="font-medium">{order.freight_type}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Value:</p>
                <p className="font-medium">R {order.total_value?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Created At:</p>
                <p className="font-medium">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-500">Estimated Delivery:</p>
                <p className="font-medium">{formatDate(order.estimated_delivery)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" /> Shipment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Supplier:</p>
                <p className="font-medium">{order.supplier}</p>
              </div>
              <div>
                <p className="text-gray-500">Origin:</p>
                <p className="font-medium">{order.origin}</p>
              </div>
              <div>
                <p className="text-gray-500">Destination:</p>
                <p className="font-medium">{order.destination}</p>
              </div>
              {order.freight_type?.toLowerCase() === "sea freight" && (
                <>
                  <div>
                    <p className="text-gray-500">Vessel Name:</p>
                    <p className="font-medium">{order.vessel_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">ETA at Port:</p>
                    <p className="font-medium">{order.eta_at_port ? formatDate(order.eta_at_port) : "N/A"}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event History */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Event History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventHistory.length === 0 ? (
              <div className="py-4 text-center text-gray-500">No event history available.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventHistory.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{formatDateTime(event.timestamp)}</TableCell>{" "}
                        {/* Fix: First TableCell on same line as TableRow */}
                        <TableCell>{event.location}</TableCell>
                        <TableCell>{event.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="py-4 text-center text-gray-500">No documents available for this order.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Type</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Uploaded On</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.document_type}</TableCell>{" "}
                        {/* Fix: First TableCell on same line as TableRow */}
                        <TableCell>{doc.file_name}</TableCell>
                        <TableCell>{formatDate(doc.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
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
