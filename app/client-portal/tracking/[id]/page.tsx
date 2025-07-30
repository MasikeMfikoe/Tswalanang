"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, Ship, MapPin, Clock, Truck } from "lucide-react"

interface TrackingEvent {
  id: string
  status: string
  location: string
  timestamp: string
  description: string
}

interface OrderTrackingData {
  id: string
  po_number: string
  tracking_number?: string
  status: string
  cargo_status: string
  supplier: string
  origin: string
  destination: string
  vessel_name?: string
  freight_type: string
  estimated_delivery?: string
  events: TrackingEvent[]
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
    case "delivered":
      return "bg-green-100 text-green-800"
    case "in progress":
    case "in-transit":
      return "bg-blue-100 text-blue-800"
    case "pending":
    case "at-origin":
      return "bg-yellow-100 text-yellow-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const formatCargoStatus = (status: string) =>
  status
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")

const formatDate = (dateString: string) => {
  if (!dateString) return "TBD"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "TBD"
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "TBD"
  }
}

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const trackingNumber = searchParams.get("trackingNumber")

  const [trackingData, setTrackingData] = useState<OrderTrackingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock tracking data
  const mockTrackingData: OrderTrackingData = {
    id: params.id,
    po_number: "PO-ABC-001",
    tracking_number: trackingNumber || "MRSU0547355",
    status: "In Progress",
    cargo_status: "in-transit",
    supplier: "Global Electronics Ltd",
    origin: "Shanghai, China",
    destination: "Cape Town, South Africa",
    vessel_name: "MSC Pamela",
    freight_type: "Sea Freight",
    estimated_delivery: "2024-02-15T10:00:00Z",
    events: [
      {
        id: "1",
        status: "Cargo Departed",
        location: "Shanghai Port, China",
        timestamp: "2024-01-15T08:00:00Z",
        description: "Container loaded and vessel departed from origin port",
      },
      {
        id: "2",
        status: "In Transit",
        location: "Indian Ocean",
        timestamp: "2024-01-25T14:30:00Z",
        description: "Vessel in transit, on schedule",
      },
      {
        id: "3",
        status: "Approaching Destination",
        location: "South Atlantic Ocean",
        timestamp: "2024-02-05T09:15:00Z",
        description: "Vessel approaching destination port",
      },
      {
        id: "4",
        status: "At Destination Port",
        location: "Cape Town Port, South Africa",
        timestamp: "2024-02-10T16:45:00Z",
        description: "Vessel arrived at destination port, awaiting discharge",
      },
    ],
  }

  useEffect(() => {
    fetchTrackingData()
  }, [params.id])

  const fetchTrackingData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // In production, this would fetch from your tracking API
      /*
      const response = await fetch(`/api/client-portal/tracking/${params.id}?clientId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTrackingData(data.data)
        } else {
          setError(data.error || "Failed to fetch tracking data")
        }
      } else {
        setError("Failed to fetch tracking data")
      }
      */

      // Using mock data for demonstration
      setTimeout(() => {
        setTrackingData(mockTrackingData)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching tracking data:", error)
      setError("An error occurred while fetching tracking data")
      setIsLoading(false)
    }
  }

  if (!user || (user.role !== "client" && user.role !== "guest" && user.role !== "admin")) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">You don't have permission to view this tracking information.</p>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading tracking information...</p>
        </div>
      </div>
    )
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Tracking Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600 mb-4">
              {error || "Unable to load tracking information for this order."}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => router.push("/client-portal/orders")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
              <Button className="flex-1" onClick={fetchTrackingData}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push("/client-portal/orders")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
              <p className="text-gray-600 mt-2">{trackingData.po_number}</p>
            </div>

            <div className="flex space-x-2">
              <Badge className={getStatusColor(trackingData.status)}>{trackingData.status}</Badge>
              <Badge className={getStatusColor(trackingData.cargo_status)}>
                {formatCargoStatus(trackingData.cargo_status)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Shipment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Tracking Number</label>
                <p className="text-lg font-mono">{trackingData.tracking_number || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Supplier</label>
                <p className="text-lg">{trackingData.supplier}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Freight Type</label>
                <p className="text-lg">{trackingData.freight_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Origin</label>
                <p className="text-lg">{trackingData.origin}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Destination</label>
                <p className="text-lg">{trackingData.destination}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Vessel</label>
                <p className="text-lg">{trackingData.vessel_name || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Tracking Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trackingData.events && trackingData.events.length > 0 ? (
              <div className="space-y-6">
                {trackingData.events.map((event, index) => (
                  <div key={event.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          index === trackingData.events.length - 1 ? "bg-blue-500" : "bg-green-500"
                        }`}
                      />
                      {index < trackingData.events.length - 1 && <div className="w-px h-12 bg-gray-300 mt-2" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{event.status}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(event.timestamp)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{event.location}</p>
                      <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tracking events available</h3>
                <p className="text-gray-600">Tracking information will be updated as your shipment progresses.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* External Tracking Links */}
        {trackingData.tracking_number && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>External Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://www.msc.com/track-a-shipment?trackingNumber=${trackingData.tracking_number}`,
                      "_blank",
                    )
                  }
                >
                  Track on MSC Website
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(`https://www.maersk.com/tracking/${trackingData.tracking_number}`, "_blank")
                  }
                >
                  Track on Maersk Website
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
