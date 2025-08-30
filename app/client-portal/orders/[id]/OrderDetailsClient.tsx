"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, Calendar, MapPin, Ship, Container, FileText, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import type { Order } from "@/types/models"
import { formatDate } from "@/lib/utils"

function getStatusColor(status: string) {
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

function getCargoStatusColor(status: string) {
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

function formatCargoStatus(status?: string | null) {
  if (!status) return "N/A"
  return status.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")
}

export default function OrderDetailsClient({ id }: { id: string }) {
  const router = useRouter()
  const { user, isLoading: isUserLoading } = useAuth()

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!user?.id) {
        setError("User not authenticated.")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/client-portal/orders/${id}?userId=${user.id}`)
        const result = await response.json()

        if (response.ok && result.data) {
          setOrder(result.data)
        } else {
          setError(result.message || "Failed to fetch order details.")
          setOrder(null)
        }
      } catch (err) {
        console.error("Error fetching order details:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred.")
        setOrder(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (!isUserLoading) fetchOrderDetails()
  }, [id, user, isUserLoading])

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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error Loading Order</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">{error}</p>
            <Button className="w-full" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-gray-800">Order Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">
              The order with ID "{id}" could not be found or you do not have permission to view it.
            </p>
            <Button className="w-full" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6 text-blue-600" />
                Order Details: {order.po_number}
              </div>
              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="font-medium">Customer Name:</p>
              <p>{order.customer_name}</p>
            </div>
            <div>
              <p className="font-medium">Freight Type:</p>
              <p>{order.freight_type || "N/A"}</p>
            </div>
            <div>
              <p className="font-medium">Origin:</p>
              <p className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {order.origin_port || "N/A"}
              </p>
            </div>
            <div>
              <p className="font-medium">Destination:</p>
              <p className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {order.destination_port || "N/A"}
              </p>
            </div>
            <div>
              <p className="font-medium">Estimated Delivery:</p>
              <p className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {formatDate(order.estimated_delivery)}
              </p>
            </div>
            <div>
              <p className="font-medium">Actual Delivery:</p>
              <p className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {formatDate(order.actual_delivery)}
              </p>
            </div>
            <div>
              <p className="font-medium">Current Cargo Status:</p>
              <Badge className={getCargoStatusColor(order.cargo_status || "")}>
                {formatCargoStatus(order.cargo_status)}
              </Badge>
            </div>
            <div>
              <p className="font-medium">Last Event:</p>
              <p>{order.last_event_description || "N/A"}</p>
              <p className="text-sm text-gray-500">{formatDate(order.last_event_date)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-green-600" /> Shipment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="font-medium">Tracking Number:</p>
              <p>{order.tracking_number || "N/A"}</p>
            </div>
            <div>
              <p className="font-medium">Shipping Line:</p>
              <p>{order.shipping_line || "N/A"}</p>
            </div>
            <div>
              <p className="font-medium">Vessel Name:</p>
              <p className="flex items-center gap-1">
                <Ship className="h-4 w-4" /> {order.vessel_name || "N/A"}
              </p>
            </div>
            <div>
              <p className="font-medium">Container Number:</p>
              <p className="flex items-center gap-1">
                <Container className="h-4 w-4" /> {order.container_number || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        {order.documents?.length ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-purple-600" /> Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {order.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between bg-gray-100 p-3 rounded-md">
                    <span className="font-medium">{doc.file_name}</span>
                    <Button variant="outline" size="sm" onClick={() => window.open(doc.file_url, "_blank")}>
                      View Document
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
