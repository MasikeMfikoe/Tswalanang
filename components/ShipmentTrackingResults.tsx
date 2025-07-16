"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import type { TrackingResult } from "@/types/tracking"

interface ShipmentTrackingResultsProps {
  trackingNumber: string
  bookingType: "ocean" | "air" | "lcl" | "unknown"
  preferScraping: boolean
  carrierHint?: string
}

export default function ShipmentTrackingResults({
  trackingNumber,
  bookingType,
  preferScraping,
  carrierHint,
}: ShipmentTrackingResultsProps) {
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

        let data: TrackingResult | null = null

        try {
          // Try to parse JSON from a *clone* so we don't lose the body
          data = (await response.clone().json()) as TrackingResult
        } catch {
          // If JSON parsing fails, fall back to reading the original response as text
          const text = await response.text()
          throw new Error(`Unexpected response format (${response.status}). Body preview: ${text.slice(0, 120)}…`)
        }

        if (response.ok && data?.success) {
          setTrackingResult(data)
        } else {
          setError({
            title: "Tracking Failed",
            message: data?.error || `Service returned status ${response.status}. Please try again later.`,
            fallbackOptions: data?.fallbackOptions,
          })
        }
      } catch (err) {
        console.error("Error fetching tracking data:", err)
        setError({
          title: "Network / Server Error",
          message:
            err instanceof Error ? err.message : "Failed to connect to tracking services. Please try again later.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (trackingNumber) {
      fetchTrackingData()
    }
  }, [trackingNumber, bookingType, preferScraping, carrierHint])

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    let colorClass = "bg-gray-100 text-gray-800"

    if (statusLower.includes("transit") || statusLower.includes("departed") || statusLower.includes("loaded")) {
      colorClass = "bg-blue-100 text-blue-800"
    } else if (statusLower.includes("arrived") || statusLower.includes("at destination")) {
      colorClass = "bg-green-100 text-green-800"
    } else if (statusLower.includes("delivered") || statusLower.includes("completed")) {
      colorClass = "bg-emerald-100 text-emerald-800"
    } else if (statusLower.includes("pending") || statusLower.includes("scheduled")) {
      colorClass = "bg-yellow-100 text-yellow-800"
    } else if (statusLower.includes("exception") || statusLower.includes("delay")) {
      colorClass = "bg-red-100 text-red-800"
    }

    return (
      <Badge variant="secondary" className={`${colorClass} px-3 py-1 text-xs font-medium`}>
        {status.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </Badge>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) return "N/A" // Check for invalid date
      return date.toLocaleString()
    } catch {
      return "N/A"
    }
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
