"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, Download, Clock } from "lucide-react"
import { format } from "date-fns"
import type { TrackingData, TrackingEvent } from "@/types/tracking"
import { getMultiProviderTrackingData } from "@/lib/services/multi-provider-tracking-service"

export default function ShipmentDetailsPage() {
  const params = useParams()
  const trackingNumber = params.id as string

  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTracking = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await getMultiProviderTrackingData(trackingNumber)
        if (result.success) {
          setTrackingData(result.data)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError("Failed to fetch tracking data.")
        console.error("Error fetching tracking data:", err)
      } finally {
        setLoading(false)
      }
    }

    if (trackingNumber) {
      fetchTracking()
    }
  }, [trackingNumber])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-gray-600">Loading tracking details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Tracking Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!trackingData) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>No Tracking Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">No tracking information found for {trackingNumber}.</p>
            <Button onClick={() => window.history.back()} className="mt-4">
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDisplayDate = (dateString?: string) => {
    if (!dateString || dateString === "N/A") return "N/A"
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm")
    } catch {
      return dateString // Return as is if invalid date format
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold">Shipment Details: {trackingData.shipmentNumber}</h1>
      <p className="text-lg text-muted-foreground">Current Status: {trackingData.status}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipment Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Shipment Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <p>
                <strong>Container No:</strong> {trackingData.containerNumber || "N/A"}
              </p>
              <p>
                <strong>Container Type:</strong> {trackingData.containerType || "N/A"}
              </p>
              <p>
                <strong>Origin:</strong> {trackingData.origin}
              </p>
              <p>
                <strong>Destination:</strong> {trackingData.destination}
              </p>
              <p>
                <strong>POL:</strong> {trackingData.pol || "N/A"}
              </p>
              <p>
                <strong>POD:</strong> {trackingData.pod || "N/A"}
              </p>
              <p>
                <strong>Estimated Departure:</strong> {formatDisplayDate(trackingData.estimatedDeparture)}
              </p>
              <p>
                <strong>Estimated Arrival:</strong> {formatDisplayDate(trackingData.estimatedArrival)}
              </p>
              <p>
                <strong>Last Location:</strong> {trackingData.lastLocation || "N/A"}
              </p>
              <p>
                <strong>Weight:</strong> {trackingData.weight || "N/A"}
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Details:</h3>
              <p>
                <strong>Shipment Type:</strong> {trackingData.details?.shipmentType || "N/A"}
              </p>
              <p>
                <strong>Packages:</strong> {trackingData.details?.packages || "N/A"}
              </p>
              <p>
                <strong>Volume:</strong> {trackingData.details?.volume || "N/A"}
              </p>
              <p>
                <strong>Pieces:</strong> {trackingData.details?.pieces || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {trackingData.documents && trackingData.documents.length > 0 ? (
              trackingData.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span>{doc.type}</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-1" /> View
                    </a>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No documents available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Shipment Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {trackingData.timeline && trackingData.timeline.length > 0 ? (
            <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-4">
              {trackingData.timeline.map((locationBlock, locIndex) => (
                <li key={locIndex} className="mb-10 ml-6">
                  <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                    <Clock className="w-3 h-3 text-blue-800 dark:text-blue-300" />
                  </span>
                  <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                    {locationBlock.location}
                    {locationBlock.terminal && (
                      <Badge variant="secondary" className="ml-2">
                        {locationBlock.terminal}
                      </Badge>
                    )}
                  </h3>
                  {locationBlock.events.map((event: TrackingEvent, eventIndex: number) => (
                    <div key={eventIndex} className="mb-4">
                      <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                        {event.date} at {event.time}
                      </time>
                      <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                        <strong>{event.status}:</strong> {event.description || event.status}
                        {event.vessel && ` (Vessel: ${event.vessel}, Voyage: ${event.voyage || "N/A"})`}
                      </p>
                    </div>
                  ))}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-muted-foreground text-sm">No detailed timeline available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
