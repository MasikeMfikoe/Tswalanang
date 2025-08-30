"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  PlaneTakeoff,
  Ship,
  Package,
  MapPin,
  Calendar,
  FileText,
  ArrowRight,
  Loader2,
  XCircle,
  CheckCircle,
  Container as ContainerIcon,
  Hourglass,
  CircleDot,
} from "lucide-react"
import type { TrackingData, TrackingEvent, ShipmentType } from "@/types/tracking"
import { cn } from "@/lib/utils"

interface ShipmentTrackingResultsProps {
  trackingNumber: string
  bookingType?: ShipmentType
  carrierHint?: string
  preferScraping?: boolean
}

const getStatusColorClass = (status: string) => {
  const lower = (status || "").toLowerCase()
  if (lower.includes("delivered") || lower.includes("completed")) return "text-green-600"
  if (lower.includes("in transit") || lower.includes("shipped") || lower.includes("departed")) return "text-blue-600"
  if (lower.includes("pending") || lower.includes("hold") || lower.includes("exception")) return "text-orange-600"
  if (lower.includes("cancelled") || lower.includes("failed")) return "text-red-600"
  return "text-gray-700"
}

const formatDate = (dateValue: string | undefined | null): string => {
  if (!dateValue || ["n/a", "unknown", "null", "undefined", ""].includes(dateValue.toLowerCase?.() ?? "")) return "--"
  try {
    let d = new Date(dateValue)
    if (isNaN(d.getTime())) {
      // DD/MM/YYYY
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateValue)) {
        const [day, month, year] = dateValue.split("/")
        d = new Date(Number(year), Number(month) - 1, Number(day))
      }
      // YYYY-MM-DD
      else if (/^\d{4}-\d{1,2}-\d{1,2}/.test(dateValue)) {
        d = new Date(dateValue.split("T")[0] + "T00:00:00.000Z")
      }
      // DD-MM-YYYY
      else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateValue)) {
        const [day, month, year] = dateValue.split("-")
        d = new Date(Number(year), Number(month) - 1, Number(day))
      }
    }
    if (isNaN(d.getTime())) return "Invalid Date"
    return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
  } catch {
    return "Invalid Date"
  }
}

const isEventDelayed = (event: TrackingEvent): boolean => {
  if (!event.plannedDate || !event.actualDate) return false
  const planned = new Date(event.plannedDate)
  const actual = new Date(event.actualDate)
  if (isNaN(planned.getTime()) || isNaN(actual.getTime())) return false
  return actual > planned
}

const isEventCompleted = (event: TrackingEvent): boolean => {
  const v = event.actualDate
  return !!v && !["--", "n/a", "invalid date"].includes(v.toLowerCase?.() ?? "")
}

const normalizeType = (val?: string): ShipmentType => {
  const t = (val || "").toLowerCase()
  return t === "ocean" || t === "air" || t === "lcl" ? t : "unknown"
}

export default function ShipmentTrackingResults({
  trackingNumber,
  bookingType,
  carrierHint,
  preferScraping,
}: ShipmentTrackingResultsProps) {
  const [trackingResult, setTrackingResult] = useState<TrackingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<string | null>(null)
  const [isLiveData, setIsLiveData] = useState<boolean>(false)
  const [scrapedAt, setScrapedAt] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrackingData = async () => {
      setIsLoading(true)
      setError(null)
      setTrackingResult(null)
      setSource(null)
      setIsLiveData(false)
      setScrapedAt(null)

      try {
        const res = await fetch("/api/tracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackingNumber, bookingType, carrierHint, preferScraping }),
        })
        const result = await res.json()

        if (result.success) {
          setTrackingResult(result.data as TrackingData)
          setSource(result.source as string)
          setIsLiveData(!!result.isLiveData)
          setScrapedAt(result.scrapedAt ?? null)
        } else {
          setError(result.error || "Failed to retrieve tracking information.")
          setSource(result.source ?? null)
        }
      } catch (err: any) {
        console.error("Error fetching tracking data:", err)
        setError(err.message || "An unexpected error occurred while fetching tracking data.")
        setSource("Client-side Fetch")
      } finally {
        setIsLoading(false)
      }
    }

    if (trackingNumber) fetchTrackingData()
  }, [trackingNumber, bookingType, carrierHint, preferScraping])

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="mt-4 text-lg text-gray-700">Tracking your shipment...</p>
          <p className="text-sm text-gray-500">This may take a few moments.</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <XCircle className="h-6 w-6" /> Tracking Error
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-700 mb-2">{error}</p>
          {source && <p className="text-sm text-gray-500">Source: {source}</p>}
          <p className="text-sm text-gray-500 mt-2">Please double-check your tracking number and try again.</p>
        </CardContent>
      </Card>
    )
  }

  if (!trackingResult) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6 text-center text-gray-600">
          No tracking information available for "{trackingNumber}".
        </CardContent>
      </Card>
    )
  }

  const {
    shipmentNumber,
    status,
    containerNumber,
    weight,
    origin,
    destination,
    estimatedArrival,
    estimatedDeparture,
    lastLocation,
    timeline,
    documents,
    details,
    demurrageDetentionDays,
  } = trackingResult

  const displayShipmentType: ShipmentType = normalizeType(details?.shipmentType) || bookingType || "unknown"
  const formattedEstimatedDeparture = formatDate(estimatedDeparture)
  const formattedEstimatedArrival = formatDate(estimatedArrival)

  // Flatten events and prefer event.location over group location
  const allEvents: (TrackingEvent & { locationName: string })[] = []
  timeline.forEach((group) => {
    group.events.forEach((event) => {
      allEvents.push({
        ...event,
        locationName: event.location || group.location,
      })
    })
  })

  // Sort DESC by timestamp (latest first)
  allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-between">
          <span>Shipment: {shipmentNumber}</span>
          <span className={cn("text-xl font-semibold", getStatusColorClass(status))}>{status}</span>
        </CardTitle>
        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
          {displayShipmentType === "ocean" && <Ship className="h-4 w-4" />}
          {displayShipmentType === "air" && <PlaneTakeoff className="h-4 w-4" />}
          {displayShipmentType === "lcl" && <Package className="h-4 w-4" />}
          <span className="capitalize">{displayShipmentType} Freight</span>
          {isLiveData && (
            <span className="ml-2 text-green-600 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" /> Live Data
            </span>
          )}
          {scrapedAt && <span className="ml-2 text-gray-400">(Updated: {formatDate(scrapedAt)})</span>}
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            <strong>Origin:</strong> {origin}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            <strong>Destination:</strong> {destination}
          </div>

        {(estimatedDeparture || estimatedArrival) && (
          <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            {estimatedDeparture && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <strong>Est. Departure:</strong>
                <span className={formattedEstimatedDeparture === "--" ? "text-gray-400 italic" : ""}>
                  {formattedEstimatedDeparture}
                </span>
              </div>
            )}
            {estimatedArrival && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <strong>Est. Arrival:</strong>
                <span className={formattedEstimatedArrival === "--" ? "text-gray-400 italic" : ""}>
                  {formattedEstimatedArrival}
                </span>
              </div>
            )}
          </div>
        )}

          {lastLocation && lastLocation !== "N/A" && (
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <strong>Last Location:</strong> {lastLocation}
            </div>
          )}

          {containerNumber && containerNumber !== "N/A" && (
            <div className="flex items-center gap-2">
              <ContainerIcon className="h-5 w-5 text-gray-500" />
              <strong>Container No:</strong> {containerNumber}
            </div>
          )}

          {demurrageDetentionDays !== undefined && demurrageDetentionDays !== null && (
            <div className="flex items-center gap-2">
              <Hourglass className="h-5 w-5 text-orange-500" />
              <strong>Demurrage &amp; Detention Days:</strong>
              <span className={demurrageDetentionDays > 0 ? "text-orange-600 font-semibold" : "text-green-600"}>
                {demurrageDetentionDays}
              </span>
            </div>
          )}

          {weight && weight !== "N/A" && (
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-500" />
              <strong>Weight:</strong> {weight}
            </div>
          )}
        </div>

        <Separator className="my-6" />

        <h3 className="text-xl font-semibold text-gray-800 mb-4">Shipment Timeline</h3>
        {allEvents.length > 0 ? (
          <div className="relative">
            {allEvents.map((event, index) => {
              const completed = isEventCompleted(event)
              const delayed = isEventDelayed(event)
              const isLast = index === allEvents.length - 1
              const lineColor = completed ? (delayed ? "bg-red-500" : "bg-green-500") : "bg-gray-300"
              const StatusIcon = completed ? CheckCircle : CircleDot

              return (
                <div key={`${event.timestamp}-${index}`} className="relative flex items-start mb-6">
                  {!isLast && <div className={cn("absolute left-3 top-8 w-0.5 h-[calc(100%+1.5rem)]", lineColor)} />}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center border-2",
                        completed ? (delayed ? "bg-red-500 border-red-500" : "bg-green-500 border-green-500") : "bg-white border-gray-300",
                      )}
                    >
                      <StatusIcon className={cn("w-4 h-4", completed ? "text-white" : "text-gray-500")} />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="font-semibold text-gray-800 text-base">{event.status}</div>
                    <div className="text-sm text-blue-600 font-medium mb-2">{event.locationName}</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        <span className="font-medium">Planned:</span> {formatDate(event.plannedDate)}
                        {event.actualDate && event.actualDate !== "--" && event.actualDate !== "Invalid Date" && (
                          <>
                            <span className="ml-4 font-medium">Actual:</span> {formatDate(event.actualDate)}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-600">No detailed timeline available.</p>
        )}

        {documents && documents.length > 0 && (
          <>
            <Separator className="my-6" />
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc, i) => (
                <a
                  key={`${doc.url}-${i}`}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-800">{doc.type || "Document"}</p>
                    {doc.description && <p className="text-sm text-gray-600">{doc.description}</p>}
                  </div>
                  <ArrowRight className="ml-auto h-5 w-5 text-gray-500" />
                </a>
              ))}
            </div>
          </>
        )}

        {details && (
          <>
            <Separator className="my-6" />
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Shipment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
              {details.packages && details.packages !== "N/A" && (
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-gray-500" />
                  <strong>Packages:</strong> {details.packages}
                </div>
              )}
              {details.dimensions && details.dimensions !== "N/A" && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">ℹ️</span>
                  <strong>Dimensions:</strong> {details.dimensions}
                </div>
              )}
              {details.specialInstructions && details.specialInstructions !== "N/A" && (
                <div className="flex items-center gap-2 col-span-full">
                  <span className="text-gray-500">📝</span>
                  <strong>Instructions:</strong> {details.specialInstructions}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
