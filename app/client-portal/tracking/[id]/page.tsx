"use client"

import { CardDescription } from "@/components/ui/card"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, MapPin, Calendar, Truck, Ship, Plane, AlertCircle } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format } from "date-fns"

interface TrackingEvent {
  timestamp: string
  location: string
  status: string
  description: string
}

interface TrackingData {
  orderId: string
  poNumber: string
  currentStatus: string
  lastUpdated: string
  origin: string
  destination: string
  estimatedDelivery: string
  carrier: string
  trackingNumber?: string
  events: TrackingEvent[]
}

const mockTrackingData: TrackingData = {
  orderId: "ORD-2024-001",
  poNumber: "PO-ABC-001",
  currentStatus: "In Transit",
  lastUpdated: "2024-07-29T14:30:00Z",
  origin: "Shanghai, China",
  destination: "Cape Town, South Africa",
  estimatedDelivery: "2024-08-15T00:00:00Z",
  carrier: "MSC",
  trackingNumber: "MRSU0547355",
  events: [
    {
      timestamp: "2024-07-29T14:30:00Z",
      location: "Port of Singapore",
      status: "Departed",
      description: "Vessel departed from Singapore.",
    },
    {
      timestamp: "2024-07-25T09:00:00Z",
      location: "Port of Shanghai",
      status: "Loaded on Vessel",
      description: "Container loaded onto vessel MSC Pamela.",
    },
    {
      timestamp: "2024-07-24T16:00:00Z",
      location: "Shanghai Terminal",
      status: "Arrived at Port",
      description: "Shipment arrived at origin port terminal.",
    },
    {
      timestamp: "2024-07-23T10:00:00Z",
      location: "Supplier Warehouse, Shanghai",
      status: "Picked Up",
      description: "Shipment picked up from supplier.",
    },
  ],
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "TBD"
  try {
    return format(new Date(dateString), "dd MMM yyyy")
  } catch (e) {
    console.error("Error formatting date:", dateString, e)
    return "Invalid Date"
  }
}

const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return "TBD"
  try {
    return format(new Date(dateString), "dd MMM yyyy HH:mm")
  } catch (e) {
    console.error("Error formatting date time:", dateString, e)
    return "Invalid Date"
  }
}

export default function TrackingResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = params.id
  const trackingNumberFromUrl = searchParams.get("trackingNumber")

  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrackingDetails = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/client-portal/tracking/${orderId}?trackingNumber=${trackingNumberFromUrl || ""}`,
      )
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch tracking details.")
      }
      const data = await response.json()
      if (data.success) {
        setTrackingData(data.data)
      } else {
        setTrackingData(mockTrackingData) // Fallback to mock data
        setError("API returned success: false. Using mock data.")
      }
    } catch (err: any) {
      console.error("Error fetching tracking details:", err)
      setError(err.message || "An unexpected error occurred while fetching tracking details. Using mock data.")
      setTrackingData(mockTrackingData) // Fallback to mock data on error
    } finally {
      setLoading(false)
    }
  }, [orderId, trackingNumberFromUrl])

  useEffect(() => {
    fetchTrackingDetails()
  }, [fetchTrackingDetails])

  const getFreightIcon = (carrier: string) => {
    if (
      carrier.toLowerCase().includes("sea") ||
      carrier.toLowerCase().includes("msc") ||
      carrier.toLowerCase().includes("maersk")
    ) {
      return <Ship className="h-5 w-5 text-blue-500" />
    }
    if (carrier.toLowerCase().includes("air")) {
      return <Plane className="h-5 w-5 text-purple-500" />
    }
    return <Truck className="h-5 w-5 text-gray-500" />
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error && !trackingData) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/client-portal/orders")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>
      </div>
    )
  }

  if (!trackingData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Tracking Data Not Found</AlertTitle>
          <AlertDescription>No tracking information could be retrieved for order ID: {orderId}.</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/client-portal/orders")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Shipment Tracking</h1>
        <Button variant="outline" onClick={() => router.push("/client-portal/orders")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Order: {trackingData.poNumber}
          </CardTitle>
          <CardDescription>Tracking details for your shipment</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Current Status</p>
            <p className="text-lg font-semibold">{trackingData.currentStatus}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-lg font-semibold">{formatDateTime(trackingData.lastUpdated)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Origin</p>
            <p className="text-lg font-semibold flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {trackingData.origin}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Destination</p>
            <p className="text-lg font-semibold flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {trackingData.destination}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estimated Delivery</p>
            <p className="text-lg font-semibold flex items-center gap-1">
              <Calendar className="h-4 w-4" /> {formatDate(trackingData.estimatedDelivery)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Carrier</p>
            <p className="text-lg font-semibold flex items-center gap-1">
              {getFreightIcon(trackingData.carrier)} {trackingData.carrier}
            </p>
          </div>
          {trackingData.trackingNumber && (
            <div>
              <p className="text-sm text-gray-500">Tracking Number</p>
              <p className="text-lg font-semibold">{trackingData.trackingNumber}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracking History</CardTitle>
        </CardHeader>
        <CardContent>
          {trackingData.events.length === 0 ? (
            <p className="text-gray-500">No tracking events found yet.</p>
          ) : (
            <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-4">
              {trackingData.events.map((event, index) => (
                <li key={index} className="mb-10 ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                    <Truck className="w-3 h-3 text-blue-800 dark:text-blue-300" />
                  </span>
                  <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {event.status}
                  </h3>
                  <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                    {formatDateTime(event.timestamp)} - {event.location}
                  </time>
                  <p className="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">{event.description}</p>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
