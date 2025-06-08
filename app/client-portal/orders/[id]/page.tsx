"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Eye, Truck, Package, FileText } from "lucide-react"

interface OrderDetails {
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
  supplier?: string
  importer?: string
  freight_type?: string
  total_value?: number
}

interface Document {
  id: string
  name: string
  type: string
  url: string
  uploaded_at: string
}

export default function ClientOrderDetails({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Mock data for demonstration
  const mockOrder: OrderDetails = {
    id: params.id,
    order_number: "ORD-2024-001",
    po_number: "PO-ABC-123",
    status: "In Progress",
    cargo_status: "in-transit",
    origin: "Shanghai, China",
    destination: "Cape Town, South Africa",
    created_at: "2024-01-15T10:00:00Z",
    estimated_delivery: "2024-02-15T10:00:00Z",
    tracking_number: "MRSU0547355",
    supplier: "Shanghai Manufacturing Co.",
    importer: "Cape Town Imports Ltd.",
    freight_type: "Sea Freight",
    total_value: 25000,
  }

  const mockDocuments: Document[] = [
    {
      id: "doc-1",
      name: "Commercial Invoice",
      type: "invoice",
      url: "/documents/commercial-invoice.pdf",
      uploaded_at: "2024-01-15T10:00:00Z",
    },
    {
      id: "doc-2",
      name: "Bill of Lading",
      type: "bol",
      url: "/documents/bill-of-lading.pdf",
      uploaded_at: "2024-01-16T08:00:00Z",
    },
    {
      id: "doc-3",
      name: "Packing List",
      type: "packing",
      url: "/documents/packing-list.pdf",
      uploaded_at: "2024-01-15T12:00:00Z",
    },
  ]

  useEffect(() => {
    fetchOrderDetails()
  }, [params.id])

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true)

      // In production, this would fetch from Supabase with proper client access controls
      /*
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', params.id)
        .eq('customer_id', user?.id) // Ensure client can only see their orders
        .single()
      
      if (orderError) throw orderError
      
      const { data: docsData, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('order_id', params.id)
        .eq('client_accessible', true) // Only show client-accessible documents
      
      if (docsError) throw docsError
      
      setOrder(orderData)
      setDocuments(docsData || [])
      */

      // Using mock data for demonstration
      setOrder(mockOrder)
      setDocuments(mockDocuments)
    } catch (error) {
      console.error("Error fetching order details:", error)
      // Fallback to mock data
      setOrder(mockOrder)
      setDocuments(mockDocuments)
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

  const handleDownloadDocument = (doc: Document) => {
    // In production, this would handle secure document download
    window.open(doc.url, "_blank")
  }

  const handleTrackShipment = () => {
    if (order?.tracking_number) {
      router.push(`/shipment-tracker?container=${order.tracking_number}`)
    }
  }

  if (!user || (user.role !== "client" && user.role !== "guest")) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">You don't have permission to view this order.</p>
            <Button className="w-full mt-4" onClick={() => router.push("/client-portal")}>
              Return to Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Order Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              The requested order could not be found or you don't have access to it.
            </p>
            <Button className="w-full mt-4" onClick={() => router.push("/client-portal")}>
              Return to Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push("/client-portal")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portal
          </Button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{order.order_number}</h1>
              <p className="text-gray-600 mt-2">Order Details and Tracking</p>
            </div>

            <div className="flex space-x-2">
              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
              {order.tracking_number && (
                <Button onClick={handleTrackShipment}>
                  <Truck className="h-4 w-4 mr-2" />
                  Track Shipment
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Order Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Order Number</label>
                <p className="text-lg font-semibold">{order.order_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">PO Number</label>
                <p className="text-lg">{order.po_number || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tracking Number</label>
                <p className="text-lg font-mono">{order.tracking_number || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Origin</label>
                <p className="text-lg">{order.origin}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Destination</label>
                <p className="text-lg">{order.destination}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Freight Type</label>
                <p className="text-lg">{order.freight_type || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Supplier</label>
                <p className="text-lg">{order.supplier || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Order Date</label>
                <p className="text-lg">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Est. Delivery</label>
                <p className="text-lg">
                  {order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString() : "TBD"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Documents and Tracking */}
        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="tracking">Shipment Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Order Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No documents available for this order yet.</p>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div>
                            <h3 className="font-medium">{doc.name}</h3>
                            <p className="text-sm text-gray-600">
                              Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleDownloadDocument(doc)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" onClick={() => handleDownloadDocument(doc)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking">
            <Card>
              <CardHeader>
                <CardTitle>Shipment Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                {order.tracking_number ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-900">Tracking Number</h3>
                      <p className="text-2xl font-mono text-blue-800">{order.tracking_number}</p>
                    </div>

                    <div className="flex space-x-4">
                      <Button onClick={handleTrackShipment} className="flex-1">
                        <Truck className="h-4 w-4 mr-2" />
                        Track Live Shipment
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          window.open(
                            `https://www.msc.com/track-a-shipment?trackingNumber=${order.tracking_number}`,
                            "_blank",
                          )
                        }
                      >
                        Track on Carrier Website
                      </Button>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p>
                        Current Status:{" "}
                        <span className="font-medium capitalize">{order.cargo_status.replace("-", " ")}</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-600 py-8">
                    Tracking information will be available once the shipment is dispatched.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
