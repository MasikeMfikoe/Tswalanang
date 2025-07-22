"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Plane,
  Ship,
  Package,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TrackingResult, TrackingEvent, ShipmentType } from "@/types/tracking"

interface ShipmentTrackingResultsProps {
  trackingNumber: string
  bookingType: ShipmentType
  carrierHint?: string
  gocometToken: string | null // Pass the GoComet token here
}

const getIconForEventType = (type?: TrackingEvent["type"]) => {
  switch (type) {
    case "vessel-departure":
    case "vessel-arrival":
      return <Ship className="h-4 w-4 text-blue-500" />
    case "plane-takeoff":
    case "plane-landing":
      return <Plane className="h-4 w-4 text-blue-500" />
    case "cargo-received":
    case "load":
      return <Package className="h-4 w-4 text-green-500" />
    case "customs-cleared":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "event":
    default:
      return <Info className="h-4 w-4 text-gray-500" />
  }
}

const formatTimestamp = (isoString: string) => {
  try {
    const date = new Date(isoString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  } catch (e) {
    return isoString // Return original if invalid
  }
}

export default function ShipmentTrackingResults({
  trackingNumber,
  bookingType,
  carrierHint,
  gocometToken,
}: ShipmentTrackingResultsProps) {
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrackingData = async () => {
      setLoading(true)
      setError(null)
      setTrackingResult(null) // Clear previous results

      try {
        const response = await fetch("/api/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trackingNumber,
            bookingType,
            carrierHint,
            gocometToken, // Pass the GoComet token to the API route
          }),
        })

        const result: TrackingResult = await response.json()

        if (result.success) {
          setTrackingResult(result)
        } else {
          setError(result.error || "Failed to fetch tracking data.")
          setTrackingResult(result) // Keep the result to show fallback options if available
        }
      } catch (err: any) {
        console.error("Client-side fetch error:", err)
        setError(`Network error: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    if (trackingNumber) {
      fetchTrackingData()
    }
  }, [trackingNumber, bookingType, carrierHint, gocometToken])

  if (loading) {
    return (
      <Card className="w-full bg-white/90 dark:bg-gray-800/90">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300">Fetching live tracking data...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full bg-white/90 dark:bg-gray-800/90 border-red-400">
        <CardContent className="p-6 text-center text-red-600 dark:text-red-400">
          <AlertCircle className="h-8 w-8 mx-auto mb-4" />
          <p>{error}</p>
          {trackingResult?.fallbackOptions && (
            <div className="mt-4 text-gray-700 dark:text-gray-300">
              <p>You might be able to track directly on the carrier's website:</p>
              <a
                href={trackingResult.fallbackOptions.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {trackingResult.fallbackOptions.carrier} Tracking Link
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!trackingResult || !trackingResult.data) {
    return (
      <Card className="w-full bg-white/90 dark:bg-gray-800/90">
        <CardContent className="p-6 text-center text-gray-700 dark:text-gray-300">
          <XCircle className="h-8 w-8 mx-auto mb-4" />
          <p>No tracking information found for {trackingNumber}.</p>
          {trackingResult?.fallbackOptions && (
            <div className="mt-4">
              <p>You might be able to track directly on the carrier's website:</p>
              <a
                href={trackingResult.fallbackOptions.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {trackingResult.fallbackOptions.carrier} Tracking Link
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const { data } = trackingResult

  return (
    <Card className="w-full bg-white/90 dark:bg-gray-800/90 shadow-lg">
      <CardHeader className="border-b border-gray-200 dark:border-700 p-6">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
          Shipment Details: {data.shipmentNumber}
        </CardTitle>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-2">
          <span className="capitalize">{data.details?.shipmentType || bookingType}</span>
          {data.carrier && <span className="ml-2">| Carrier: {data.carrier}</span>}
          {trackingResult.isLiveData && (
            <span className="ml-auto text-green-600 dark:text-green-400 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" /> Live Data ({trackingResult.source})
            </span>
          )}
          {!trackingResult.isLiveData && (
            <span className="ml-auto text-yellow-600 dark:text-yellow-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" /> Mock Data ({trackingResult.source})
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Key Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            <span>
              Status: <span className="font-semibold">{data.status}</span>
            </span>
          </div>
          {data.origin && (
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span>
                Origin: {data.origin} {data.pol && `(${data.pol})`}
              </span>
            </div>
          )}
          {data.destination && (
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span>
                Destination: {data.destination} {data.pod && `(${data.pod})`}
              </span>
            </div>
          )}
          {data.eta && (
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span>ETA: {data.eta}</span>
            </div>
          )}
          {data.etd && (
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span>ETD: {data.etd}</span>
            </div>
          )}
          {data.containerNumber && (
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <span>
                Container: {data.containerNumber} {data.containerType && `(${data.containerType})`}
              </span>
            </div>
          )}
          {data.weight && (
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              <span>Weight: {data.weight}</span>
            </div>
          )}
          {data.details?.freeDaysBeforeDemurrage !== undefined && (
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span>Free Days Before Demurrage: {data.details.freeDaysBeforeDemurrage}</span>
            </div>
          )}
          {data.lastLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span>Last Location: {data.lastLocation}</span>
            </div>
          )}
        </div>

        <Separator className="my-6 bg-gray-200 dark:bg-gray-700" />

        {/* Timeline */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Shipment Timeline</h3>
          {data.timeline && data.timeline.length > 0 ? (
            <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-4">
              {data.timeline.map((locationEntry, locIndex) => (
                <li key={locIndex} className="mb-6 ml-6">
                  <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 ring-8 ring-white dark:bg-blue-900 dark:ring-gray-900">
                    <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-300" />
                  </span>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {locationEntry.location} {locationEntry.terminal && `(${locationEntry.terminal})`}
                  </h4>
                  <ul className="mt-2 space-y-2">
                    {locationEntry.events.map((event, eventIndex) => (
                      <li key={eventIndex} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                        <div className="mt-1">{getIconForEventType(event.type)}</div>
                        <div>
                          <p className="font-medium">{event.status || event.description}</p>
                          <p className="text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {event.date || formatTimestamp(event.timestamp)}
                              {event.time && (
                                <>
                                  <Clock className="h-3 w-3 ml-2" /> {event.time}
                                </>
                              )}
                            </span>
                            {event.description && event.status !== event.description && (
                              <span className="block text-xs text-gray-500 dark:text-gray-400">
                                {event.description}
                              </span>
                            )}
                            {event.vessel && (
                              <span className="block text-xs text-gray-500 dark:text-gray-400">
                                Vessel: {event.vessel} {event.voyage && `(Voyage: ${event.voyage})`}
                              </span>
                            )}
                            {event.flightNumber && (
                              <span className="block text-xs text-gray-500 dark:text-gray-400">
                                Flight: {event.flightNumber}
                              </span>
                            )}
                            {event.mode && (
                              <span className="block text-xs text-gray-500 dark:text-gray-400">Mode: {event.mode}</span>
                            )}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No detailed timeline available.</p>
          )}
        </div>

        {data.documents && data.documents.length > 0 && (
          <>
            <Separator className="my-6 bg-gray-200 dark:bg-gray-700" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Documents</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {data.documents.map((doc, index) => (
                  <Card key={index} className="bg-gray-50 dark:bg-gray-700 p-4 flex flex-col items-center text-center">
                    <FileText className="h-8 w-8 text-blue-500 mb-2" />
                    <p className="font-medium text-gray-800 dark:text-gray-200">{doc.type || "Document"}</p>
                    {doc.description && <p className="text-sm text-gray-600 dark:text-gray-400">{doc.description}</p>}
                    <Button asChild variant="outline" className="mt-3 bg-transparent">
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" /> Download
                      </a>
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
