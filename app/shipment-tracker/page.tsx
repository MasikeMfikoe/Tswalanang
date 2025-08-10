"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Truck, MapPin, Calendar, Clock, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

interface TrackingEvent {
  id: string
  status: string
  location: string
  timestamp: string
  description: string
}

interface TrackingResult {
  trackingNumber: string
  status: "in-transit" | "delivered" | "pending" | "exception"
  currentLocation: string
  estimatedDelivery: string
  events: TrackingEvent[]
  carrier: string
  origin: string
  destination: string
}

const mockTrackingData: TrackingResult = {
  trackingNumber: "TG123456789",
  status: "in-transit",
  currentLocation: "Johannesburg Distribution Center",
  estimatedDelivery: "2024-01-15",
  carrier: "Tswalanang Global",
  origin: "Cape Town, South Africa",
  destination: "Durban, South Africa",
  events: [
    {
      id: "1",
      status: "Package picked up",
      location: "Cape Town Depot",
      timestamp: "2024-01-10T08:00:00Z",
      description: "Package collected from sender",
    },
    {
      id: "2",
      status: "In transit",
      location: "Cape Town Distribution Center",
      timestamp: "2024-01-10T14:30:00Z",
      description: "Package processed at distribution center",
    },
    {
      id: "3",
      status: "In transit",
      location: "Johannesburg Distribution Center",
      timestamp: "2024-01-12T09:15:00Z",
      description: "Package arrived at intermediate facility",
    },
  ],
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-500"
    case "in-transit":
      return "bg-blue-500"
    case "pending":
      return "bg-yellow-500"
    case "exception":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "delivered":
      return "Delivered"
    case "in-transit":
      return "In Transit"
    case "pending":
      return "Pending"
    case "exception":
      return "Exception"
    default:
      return "Unknown"
  }
}

export default function ShipmentTrackerPage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showResults, setShowResults] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // For demo purposes, return mock data for any tracking number
      setTrackingResult(mockTrackingData)
      setShowResults(true)
    } catch (err) {
      setError("Failed to fetch tracking information. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewSearch = () => {
    setTrackingNumber("")
    setTrackingResult(null)
    setError("")
    setShowResults(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Shipment</h1>
          <p className="text-gray-600">Enter your tracking number to get real-time updates on your shipment</p>
        </div>

        {/* Back to Landing Page Button - Only show if results are displayed and no user is logged in */}
        {showResults && !user && (
          <div className="flex justify-center mb-6">
            <Button
              onClick={() => router.push("/")}
              className="bg-gray-500 hover:bg-gray-600 text-white flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Landing Page
            </Button>
          </div>
        )}

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Track Shipment
            </CardTitle>
            <CardDescription>Enter your tracking number to view shipment details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter tracking number (e.g., TG123456789)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleTrack()}
                className="flex-1"
              />
              <Button onClick={handleTrack} disabled={isLoading} className="min-w-[100px]">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Tracking...
                  </div>
                ) : (
                  "Track"
                )}
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </CardContent>
        </Card>

        {/* Tracking Results */}
        {showResults && trackingResult && (
          <div className="space-y-6">
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Tracking: {trackingResult.trackingNumber}
                  </CardTitle>
                  <Badge className={`${getStatusColor(trackingResult.status)} text-white`}>
                    {getStatusText(trackingResult.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Current Location:</span>
                      <span className="font-medium">{trackingResult.currentLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Estimated Delivery:</span>
                      <span className="font-medium">{formatDate(trackingResult.estimatedDelivery)}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Carrier:</span>
                      <span className="font-medium">{trackingResult.carrier}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span>From:</span> <span className="font-medium">{trackingResult.origin}</span>
                      <span className="mx-2">→</span>
                      <span>To:</span> <span className="font-medium">{trackingResult.destination}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tracking History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trackingResult.events.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${index === 0 ? "bg-blue-500" : "bg-gray-300"}`} />
                        {index < trackingResult.events.length - 1 && <div className="w-px h-8 bg-gray-200 mt-2" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{event.status}</h4>
                          <span className="text-sm text-gray-500">{formatDate(event.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                        <p className="text-sm text-gray-500">{event.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* New Search Button */}
            <div className="text-center">
              <Button onClick={handleNewSearch} variant="outline">
                Track Another Shipment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
