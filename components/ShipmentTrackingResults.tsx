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
  Clock,
  Info,
  FileText,
  ArrowRight,
  Loader2,
  XCircle,
  CheckCircle,
  Truck,
  Warehouse,
  Container,
  Sailboat,
  Anchor,
  ClipboardList,
  CircleDot,
  PlaneTakeoffIcon as PlaneDeparture,
  PlaneLandingIcon as PlaneArrival,
  BadgeCheck,
} from "lucide-react"
import type { TrackingData, TrackingEvent, ShipmentType } from "@/types/tracking"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

interface ShipmentTrackingResultsProps {
  trackingNumber: string
  bookingType?: ShipmentType
  carrierHint?: string
  preferScraping?: boolean
}

const getIconForEventType = (type: TrackingEvent["type"]) => {
  switch (type) {
    case "vessel-departure":
      return <Sailboat className="h-5 w-5 text-blue-600" />
    case "vessel-arrival":
      return <Anchor className="h-5 w-5 text-blue-600" />
    case "plane-takeoff":
      return <PlaneDeparture className="h-5 w-5 text-green-600" />
    case "plane-landing":
      return <PlaneArrival className="h-5 w-5 text-green-600" />
    case "gate":
      return <Truck className="h-5 w-5 text-gray-600" />
    case "load":
      return <Container className="h-5 w-5 text-yellow-600" />
    case "cargo-received":
      return <Warehouse className="h-5 w-5 text-purple-600" />
    case "customs-cleared":
      return <BadgeCheck className="h-5 w-5 text-teal-600" />
    case "event":
    default:
      return <CircleDot className="h-5 w-5 text-gray-500" />
  }
}

const getStatusColorClass = (status: string) => {
  const lowerStatus = status.toLowerCase()
  if (lowerStatus.includes("delivered") || lowerStatus.includes("completed")) {
    return "text-green-600"
  }
  if (lowerStatus.includes("in transit") || lowerStatus.includes("shipped") || lowerStatus.includes("departed")) {
    return "text-blue-600"
  }
  if (lowerStatus.includes("pending") || lowerStatus.includes("hold") || lowerStatus.includes("exception")) {
    return "text-orange-600"
  }
  if (lowerStatus.includes("cancelled") || lowerStatus.includes("failed")) {
    return "text-red-600"
  }
  return "text-gray-700"
}

// Helper function to safely format dates - more lenient approach
const formatDate = (dateValue: string | undefined | null): string => {
  // Return "Not Available" for clearly invalid values
  if (
    !dateValue ||
    dateValue === "N/A" ||
    dateValue === "Unknown" ||
    dateValue === "" ||
    dateValue === "null" ||
    dateValue === "undefined"
  ) {
    return "Not Available"
  }

  try {
    // First, try direct parsing
    let date = new Date(dateValue)

    // If that fails, try different parsing strategies
    if (isNaN(date.getTime())) {
      // Try common date formats
      const formats = [
        dateValue.replace(/\//g, "-"), // Replace slashes with dashes
        dateValue.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$1-$2"), // MM/DD/YYYY to YYYY-MM-DD
        dateValue.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1"), // DD/MM/YYYY to YYYY-MM-DD
        dateValue.replace(/(\d{4})-(\d{2})-(\d{2}).*/, "$1-$2-$3"), // Remove time part from ISO string
      ]

      for (const format of formats) {
        date = new Date(format)
        if (!isNaN(date.getTime())) {
          break
        }
      }
    }

    // If we still have an invalid date, return the original value
    if (isNaN(date.getTime())) {
      console.warn("Could not parse date:", dateValue)
      return dateValue // Return original value instead of hiding it
    }

    // Format the valid date
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch (error) {
    console.warn("Error formatting date:", dateValue, error)
    return dateValue // Return original value on error
  }
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
        const response = await fetch("/api/tracking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            trackingNumber,
            bookingType,
            carrierHint,
            preferScraping,
          }),
        })

        const result = await response.json()

        if (result.success) {
          setTrackingResult(result.data)
          setSource(result.source)
          setIsLiveData(result.isLiveData)
          setScrapedAt(result.scrapedAt)
        } else {
          setError(result.error || "Failed to retrieve tracking information.")
          setSource(result.source)
        }
      } catch (err: any) {
        console.error("Error fetching tracking data:", err)
        setError(err.message || "An unexpected error occurred while fetching tracking data.")
        setSource("Client-side Fetch")
      } finally {
        setIsLoading(false)
      }
    }

    if (trackingNumber) {
      fetchTrackingData()
    }
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
    containerType,
    weight,
    origin,
    destination,
    pol,
    pod,
    estimatedArrival,
    estimatedDeparture,
    lastLocation,
    timeline,
    documents,
    details,
  } = trackingResult

  const displayShipmentType = details?.shipmentType || bookingType || "unknown"

  // Format the dates - now always shows something
  const formattedEstimatedDeparture = formatDate(estimatedDeparture)
  const formattedEstimatedArrival = formatDate(estimatedArrival)

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
          {source && <span className="ml-2">| Source: {source}</span>}
          {isLiveData && (
            <span className="ml-2 text-green-600 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" /> Live Data
            </span>
          )}
          {scrapedAt && (
            <span className="ml-2 text-gray-500 text-xs">(Scraped: {new Date(scrapedAt).toLocaleString()})</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            <strong>Origin:</strong> {origin} {pol && pol !== "N/A" && `(${pol})`}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            <strong>Destination:</strong> {destination} {pod && pod !== "N/A" && `(${pod})`}
          </div>

          {/* Always show estimated dates section if we have either departure or arrival */}
          {(estimatedDeparture || estimatedArrival) && (
            <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              {estimatedDeparture && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <strong>Est. Departure:</strong>
                  <span className={formattedEstimatedDeparture === "Not Available" ? "text-gray-400 italic" : ""}>
                    {formattedEstimatedDeparture}
                  </span>
                </div>
              )}
              {estimatedArrival && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <strong>Est. Arrival:</strong>
                  <span className={formattedEstimatedArrival === "Not Available" ? "text-gray-400 italic" : ""}>
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
              <Container className="h-5 w-5 text-gray-500" />
              <strong>Container No:</strong> {containerNumber}
            </div>
          )}
          {containerType && containerType !== "N/A" && (
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-gray-500" />
              <strong>Container Type:</strong> {containerType}
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
        {timeline.length > 0 ? (
          <Accordion type="multiple" className="w-full">
            {timeline.map((locationEntry, locIndex) => (
              <AccordionItem key={locIndex} value={`item-${locIndex}`}>
                <AccordionTrigger className="text-lg font-medium text-gray-700 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    {locationEntry.location}
                    {locationEntry.terminal && (
                      <span className="text-sm text-gray-500">({locationEntry.terminal})</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-8 border-l-2 border-gray-200 ml-3">
                  {locationEntry.events.map((event, eventIndex) => (
                    <div key={eventIndex} className="relative pb-8 last:pb-0">
                      <div className="absolute -left-4 top-0 h-full w-px bg-gray-300" />
                      <div className="absolute -left-5 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-white z-10">
                        {getIconForEventType(event.type)}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" /> {event.date}
                          <Clock className="h-4 w-4 ml-2" /> {event.time}
                        </div>
                        <h4 className="font-semibold text-gray-800 mt-1">{event.status}</h4>
                        {event.description && <p className="text-gray-600 text-sm mt-1">{event.description}</p>}
                        {event.vessel && <p className="text-gray-600 text-xs mt-1">Vessel: {event.vessel}</p>}
                        {event.flightNumber && (
                          <p className="text-gray-600 text-xs mt-1">Flight: {event.flightNumber}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-gray-600">No detailed timeline available.</p>
        )}

        {documents && documents.length > 0 && (
          <>
            <Separator className="my-6" />
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map((doc, index) => (
                <a
                  key={index}
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
                  <Info className="h-5 w-5 text-gray-500" />
                  <strong>Dimensions:</strong> {details.dimensions}
                </div>
              )}
              {details.specialInstructions && details.specialInstructions !== "N/A" && (
                <div className="flex items-center gap-2 col-span-full">
                  <ClipboardList className="h-5 w-5 text-gray-500" />
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
