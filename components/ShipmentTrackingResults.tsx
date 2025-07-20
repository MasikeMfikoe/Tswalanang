"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Ship,
  PlaneTakeoff,
  Package,
  MapPin,
  Calendar,
  Hourglass,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react"
import type { TrackingResult, TrackingEvent } from "@/types/tracking"
import { format, parseISO } from "date-fns"
import { Info, Truck } from "lucide-react" // Added missing imports
import { getStatusBadge } from "@/utils/status-badge"

const getStatusColor = (status: string) => {
  const lowerStatus = status.toLowerCase()
  if (lowerStatus.includes("delivered") || lowerStatus.includes("completed")) {
    return "bg-green-100 text-green-800"
  }
  if (lowerStatus.includes("in transit") || lowerStatus.includes("departed") || lowerStatus.includes("arrived")) {
    return "bg-blue-100 text-blue-800"
  }
  if (lowerStatus.includes("pending") || lowerStatus.includes("exception")) {
    return "bg-yellow-100 text-yellow-800"
  }
  return "bg-gray-100 text-gray-800"
}

const getEventIcon = (event: TrackingEvent) => {
  const status = event.status.toLowerCase()
  if (status.includes("departed") || status.includes("loaded")) {
    return event.mode === "air" ? <PlaneTakeoff className="h-4 w-4" /> : <Ship className="h-4 w-4" />
  }
  if (status.includes("arrived") || status.includes("unloaded")) {
    return <MapPin className="h-4 w-4" />
  }
  if (status.includes("delivered")) {
    return <Truck className="h-4 w-4" />
  }
  return <Info className="h-4 w-4" />
}

const getIconForBookingType = (type: string) => {
  switch (type) {
    case "ocean":
    case "lcl":
      return <Ship className="h-4 w-4 mr-1 text-blue-500" />
    case "air":
      return <PlaneTakeoff className="h-4 w-4 mr-1 text-purple-500" />
    default:
      return <Package className="h-4 w-4 mr-1 text-gray-500" />
  }
}

export default function ShipmentTrackingResults({ trackingNumber, bookingType, preferScraping, carrierHint }: any) {
  const [isLoading, setIsLoading] = useState(true)
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null)
  const [error, setError] = useState<{
    title: string
    message: string
    suggestion?: string
    fallbackOptions?: { name: string; url: string }[]
  } | null>(null)

  useEffect(() => {
    const fetchTrackingData = async () => {
      setIsLoading(true)
      setTrackingResult(null)
      setError(null)

      try {
        const response = await fetch("/api/tracking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trackingNumber,
            bookingType,
            preferScraping,
            carrierHint,
          }),
        })

        let result: TrackingResult | null = null
        let fallbackText = ""

        try {
          result = await response.clone().json()
        } catch {
          fallbackText = await response.text()
        }

        if (result) {
          if (result.success) {
            setTrackingResult(result)
          } else {
            setError({
              title: "Tracking Failed",
              message: result.error || "Could not retrieve tracking information.",
              suggestion: "Please check the tracking number and try again.",
              fallbackOptions: result.fallbackOptions,
            })
          }
        } else {
          setError({
            title: "Server Error",
            message: `Tracking service returned an unexpected response${
              response.status ? ` (HTTP ${response.status})` : ""
            }.`,
            suggestion:
              fallbackText.length > 0
                ? `Response excerpt: ${fallbackText.slice(0, 120)}…`
                : "Please try again later or contact support.",
          })
        }
      } catch (err) {
        console.error("Error fetching tracking data:", err)
        setError({
          title: "Network Error",
          message: "Failed to connect to tracking services. Please try again later.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (trackingNumber) {
      fetchTrackingData()
    }
  }, [trackingNumber, bookingType, preferScraping, carrierHint])

  const formatTimestamp = (timestamp: string | null | undefined) => {
    if (!timestamp) return "N/A"
    try {
      const date = parseISO(timestamp)
      if (isNaN(date.getTime())) return "N/A"
      return format(date, "PPP p")
    } catch {
      return "N/A"
    }
  }

  if (isLoading) {
    return (
      <Card className="mt-8 bg-white/90 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Hourglass className="h-10 w-10 text-blue-500 animate-spin" />
          <p className="mt-4 text-lg font-medium text-gray-700">Fetching tracking details...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mt-8 bg-white/90 backdrop-blur-sm">
        <CardContent className="py-8">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>{error.title}</AlertTitle>
            <AlertDescription>
              {error.message}
              {error.suggestion && <p className="mt-2">{error.suggestion}</p>}
              {error.fallbackOptions && error.fallbackOptions.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold">Try tracking directly with the carrier:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {error.fallbackOptions.map((option, index) => (
                      <li key={index}>
                        <a
                          href={option.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {option.name}
                          <ExternalLink className="inline-block h-3 w-3 ml-1" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!trackingResult || !trackingResult.data) {
    return null // Should ideally not happen if error handling is robust
  }

  const { data } = trackingResult

  return (
    <Card className="mt-8 w-full max-w-4xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          {getIconForBookingType(bookingType)}
          Shipment {data.shipmentNumber}
        </CardTitle>
        <div className="flex items-center justify-between mt-2">
          {data.status && getStatusBadge(data.status)}
          <span className="text-sm text-gray-500">
            Source: {trackingResult.source} {trackingResult.isLiveData ? "(Live)" : "(Cached)"}
            {trackingResult.scrapedAt && ` (Scraped: ${formatTimestamp(trackingResult.scrapedAt)})`}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Carrier</p>
            <p className="font-medium">{data.carrier || "N/A"}</p>
          </div>
          {data.containerNumber && (
            <div>
              <p className="text-gray-600">Container / AWB</p>
              <p className="font-medium">{data.containerNumber}</p>
            </div>
          )}
          {data.vesselName && (
            <div>
              <p className="text-gray-600">Vessel</p>
              <p className="font-medium">
                {data.vesselName} {data.voyage ? `/ ${data.voyage}` : ""}
              </p>
            </div>
          )}
          {data.location && (
            <div>
              <p className="text-gray-600">Current Location</p>
              <p className="font-medium flex items-center gap-1">
                <MapPin className="h-4 w-4 text-red-500" />
                {data.location}
              </p>
            </div>
          )}
          {data.estimatedArrival && (
            <div>
              <p className="text-gray-600">Estimated Arrival</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4 text-green-500" />
                {formatTimestamp(data.estimatedArrival)}
              </p>
            </div>
          )}
        </div>

        {/* Tracking Events Timeline */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Tracking History</h3>
          {data.events && data.events.length > 0 ? (
            <div className="relative pl-6 before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:bg-gray-200">
              {data.events.map((event, index) => (
                <div key={index} className="mb-6 relative">
                  <div className="absolute left-[-29px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div className="ml-0">
                    <p className="font-semibold text-gray-800">{event.status}</p>
                    {event.description && <p className="text-sm text-gray-700">{event.description}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      <MapPin className="inline-block h-3 w-3 mr-1" />
                      {event.location}
                    </p>
                    <p className="text-xs text-gray-500">
                      <Calendar className="inline-block h-3 w-3 mr-1" />
                      {formatTimestamp(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No detailed event history available.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
