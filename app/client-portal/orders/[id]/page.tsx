"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Package, FileText, Calendar, Truck, MapPin, Clock, ArrowLeft, Download, ExternalLink } from "lucide-react"

import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"

// ─────────────────────────────────────────────────────────────────────────
//  MOCK DATA (for demonstration if API fails or user is not logged in)
// ─────────────────────────────────────────────────────────────────────────
const mockOrderDetails = {
  id: "ORD-2024-001",
  po_number: "PO-ABC-001",
  status: "In Progress",
  cargo_status: "in-transit",
  freight_type: "Sea Freight",
  estimated_delivery: "2024-02-15T10:00:00Z",
  total_value: 25000,
  customer_name: "ABC Company",
  origin: "Shanghai, China",
  destination: "Durban, South Africa",
  current_location: "Indian Ocean",
  last_updated: "2024-02-10T18:00:00Z",
  tracking_number: "TRACK123456",
  documents: [
    {
      id: "DOC-001",
      name: "Bill of Lading",
      type: "PDF",
      url: "/placeholder.pdf",
      uploaded_at: "2024-01-20T11:00:00Z",
    },
    {
      id: "DOC-002",
      name: "Commercial Invoice",
      type: "PDF",
      url: "/placeholder.pdf",
      uploaded_at: "2024-01-22T09:00:00Z",
    },
  ],
  tracking_events: [
    {
      id: "EVT-001",
      timestamp: "2024-02-08T10:00:00Z",
      location: "Port of Shanghai",
      description: "Departed origin port",
    },
    {
      id: "EVT-002",
      timestamp: "2024-02-05T15:30:00Z",
      location: "Warehouse, Shanghai",
      description: "Loaded onto vessel",
    },
    { id: "EVT-003", timestamp: "2024-02-01T09:00:00Z", location: "Supplier Factory", description: "Cargo picked up" },
  ],
}

// ─────────────────────────────────────────────────────────────────────────
//  UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────
export default function ClientPortalOrderDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { user, isLoading: isUserLoading } = useAuth()
  const router = useRouter()

  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrderDetails = async () => {
    if (!user?.id) {
      setOrder(mockOrderDetails)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/client-portal/orders/${id}?clientId=${user.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch order details")
      }
      const data = await response.json()
      if (data.success && data.data.order) {
        setOrder(data.data.order)
      } else {
        console.warn("API returned success: false, using mock data.", data.error)
        setOrder(mockOrderDetails)
      }
    } catch (err: any) {
      console.error("Error fetching order details:", err)
      setError(err.message || "Failed to load order details.")
      setOrder(mockOrderDetails) // Fallback to mock data on error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderDetails()

    // Set up Realtime subscriptions for this specific order
    const orderChannel = supabase
      .channel(`order_details_${id}_changes`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `id=eq.${id}` }, (payload) => {
        console.log("Realtime order details change received!", payload)
        fetchOrderDetails() // Re-fetch data on any change to this order
      })
      .subscribe()

    const documentsChannel = supabase
      .channel(`order_documents_${id}_changes`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "documents", filter: `order_id=eq.${id}` },
        (payload) => {
          console.log("Realtime document change for order received!", payload)
          fetchOrderDetails() // Re-fetch data on any document change related to this order
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(orderChannel)
      supabase.removeChannel(documentsChannel)
    }
  }, [id, user?.id]) // Re-run effect if order ID or user ID changes

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading order details...</p>
        </div>
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
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Order Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">The order with ID "{id}" could not be found or you do not have access.</p>
            <Button onClick={() => router.push("/client-portal/orders")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
            </Button>
          </CardContent>
        </Card>
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
            <p className="text-center text-gray-600">You don't have permission to access this page.</p>
            <Button className="w-full mt-4" onClick={() => router.push("/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <Button variant="outline" onClick={() => router.push("/client-portal/orders")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to All Orders
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Details: {order.po_number}</span>
              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
            </CardTitle>
            <CardDescription>Comprehensive overview of your shipment.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Shipment Information</h3>
              <div className="space-y-2 text-gray-700">
                <p className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <strong>PO Number:</strong> {order.po_number}
                </p>
                <p className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <strong>Freight Type:</strong> {order.freight_type}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <strong>Estimated Delivery:</strong> {new Date(order.estimated_delivery).toLocaleDateString()}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <strong>Origin:</strong> {order.origin}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <strong>Destination:</strong> {order.destination}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <strong>Last Updated:</strong> {new Date(order.last_updated).toLocaleString()}
                </p>
                <p className="flex items-center gap-2">
                  <Badge className={getCargoStatusColor(order.cargo_status)}>
                    {formatCargoStatus(order.cargo_status)}
                  </Badge>
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Tracking Information</h3>
              <div className="space-y-2 text-gray-700">
                <p className="flex items-center gap-2">
                  <strong>Tracking Number:</strong> {order.tracking_number || "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <strong>Current Location:</strong> {order.current_location || "N/A"}
                </p>
                {order.tracking_number && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-transparent"
                    onClick={() => router.push(`/shipment-tracker/results/${order.tracking_number}`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" /> View Live Tracking
                  </Button>
                )}
              </div>

              <Separator className="my-4" />

              <h3 className="text-lg font-semibold mb-2">Financial Overview</h3>
              <div className="space-y-2 text-gray-700">
                <p className="flex items-center gap-2">
                  <strong>Total Value:</strong> R {order.total_value?.toLocaleString() || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Associated Documents
            </CardTitle>
            <CardDescription>Important documents related to this order.</CardDescription>
          </CardHeader>
          <CardContent>
            {order.documents && order.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {order.documents.map((doc: any) => (
                  <Card key={doc.id} className="flex items-center justify-between p-4 hover:shadow-md transition-all">
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        {doc.type} - {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" /> Download
                      </a>
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No documents available for this order.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Tracking History
            </CardTitle>
            <CardDescription>Timeline of key events for this shipment.</CardDescription>
          </CardHeader>
          <CardContent>
            {order.tracking_events && order.tracking_events.length > 0 ? (
              <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-4">
                {order.tracking_events
                  .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((event: any) => (
                    <li key={event.id} className="mb-10 ml-6">
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                        <Clock className="w-3 h-3 text-blue-800 dark:text-blue-300" />
                      </span>
                      <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                        {event.description}
                      </h3>
                      <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                        {new Date(event.timestamp).toLocaleString()} - {event.location}
                      </time>
                    </li>
                  ))}
              </ol>
            ) : (
              <div className="text-center py-8 text-gray-500">No tracking history available for this order.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
