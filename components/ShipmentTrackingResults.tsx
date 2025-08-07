"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PlaneTakeoff, Ship, Package, MapPin, Calendar, Clock, Info, FileText, ArrowRight, Loader2, XCircle, CheckCircle, Truck, Warehouse, Container, Sailboat, Anchor, ClipboardList, CircleDot, PlaneTakeoffIcon as PlaneDeparture, PlaneLandingIcon as PlaneArrival, BadgeCheck, Hourglass } from 'lucide-react'
import type { TrackingData, TrackingEvent, ShipmentType } from "@/types/tracking"
import { cn } from "@/lib/utils"

interface ShipmentTrackingResultsProps {
  trackingNumber: string
  bookingType?: ShipmentType
  carrierHint?: string
  preferScraping?: boolean
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

const formatDate = (dateValue: string | undefined | null): string => {
  if (
    !dateValue ||
    dateValue === "N/A" ||
    dateValue === "Unknown" ||
    dateValue === "" ||
    dateValue === "null" ||
    dateValue === "undefined"
  ) {
    return "--"
  }

  try {
    let date = new Date(dateValue)

    // If standard parsing fails, try custom formats
    if (isNaN(date.getTime())) {
      // Handle DD/MM/YYYY format
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateValue)) {
        const [day, month, year] = dateValue.split('/')
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      }
      // Handle YYYY-MM-DD format
      else if (/^\d{4}-\d{1,2}-\d{1,2}/.test(dateValue)) {
        date = new Date(dateValue.split('T')[0] + 'T00:00:00.000Z')
      }
      // Handle DD-MM-YYYY format
      else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateValue)) {
        const [day, month, year] = dateValue.split('-')
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      }
      // Handle "DD MMM YYYY" format (e.g., "15 Jan 2024")
      else if (/^\d{1,2}\s+[A-Za-z]{3}\s+\d{4}$/.test(dateValue)) {
        date = new Date(dateValue)
      }
      // Handle "MMM DD, YYYY" format (e.g., "Jan 15, 2024")
      else if (/^[A-Za-z]{3}\s+\d{1,2},\s+\d{4}$/.test(dateValue)) {
        date = new Date(dateValue)
      }
    }

    if (isNaN(date.getTime())) {
      console.warn("Could not parse date for display:", dateValue)
      return "Invalid Date" // Return "Invalid Date" if parsing truly failed
    }

    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch (error) {
    console.warn("Error formatting date for display:", dateValue, error)
    return "Invalid Date" // Return "Invalid Date" on error
  }
}

// Function to determine if an event is delayed
const isEventDelayed = (event: TrackingEvent): boolean => {
  if (!event.plannedDate || !event.actualDate || event.plannedDate === "--" || event.actualDate === "--" || event.plannedDate === "Invalid Date" || event.actualDate === "Invalid Date") {
    return false
  }
  
  try {
    const plannedDate = new Date(event.plannedDate)
    const actualDate = new Date(event.actualDate)
    
    if (isNaN(plannedDate.getTime()) || isNaN(actualDate.getTime())) {
      return false
    }
    
    return actualDate > plannedDate
  } catch (error) {
    return false
  }
}

// Function to determine if an event is completed (has actual date)
const isEventCompleted = (event: TrackingEvent): boolean => {
  return event.actualDate !== undefined && event.actualDate !== "--" && event.actualDate !== "N/A" && event.actualDate !== "Invalid Date"
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
    demurrageDetentionDays,
  } = trackingResult

  const displayShipmentType = details?.shipmentType || bookingType || "unknown"
  const formattedEstimatedDeparture = formatDate(estimatedDeparture)
  const formattedEstimatedArrival = formatDate(estimatedArrival)

  // Flatten all events from all locations for the vertical timeline
  const allEvents: (TrackingEvent & { locationName: string })[] = []
  timeline.forEach(locationEntry => {
    locationEntry.events.forEach(event => {
      allEvents.push({
        ...event,
        locationName: locationEntry.location
      })
    })
  })

  // Sort events chronologically in DESCENDING order (latest event first)
  allEvents.sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime()
    const dateB = new Date(b.timestamp).getTime()
    return dateB - dateA // This will put the latest event at the top
  })

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
              <Container className="h-5 w-5 text-gray-500" />
              <strong>Container No:</strong> {containerNumber}
            </div>
          )}
          {demurrageDetentionDays !== undefined && demurrageDetentionDays !== null && (
            <div className="flex items-center gap-2">
              <Hourglass className="h-5 w-5 text-orange-500" />
              <strong>Demurrage & Detention Days:</strong>
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
              const isCompleted = isEventCompleted(event)
              const isDelayed = isEventDelayed(event)
              const isLast = index === allEvents.length - 1
              
              // Determine the color of the vertical line
              const lineColor = isCompleted ? (isDelayed ? "bg-red-500" : "bg-green-500") : "bg-gray-300"
              
              // Determine the icon for the status circle
              const StatusIcon = isCompleted ? CheckCircle : CircleDot // Use CircleDot for incomplete events

              return (
                <div key={index} className="relative flex items-start mb-6">
                  {/* Vertical line */}
                  {!isLast && (
                    <div className={cn("absolute left-3 top-8 w-0.5 h-[calc(100%+1.5rem)]", lineColor)}></div>
                  )}
                  
                  {/* Status circle with checkmark */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center border-2",
                      isCompleted 
                        ? (isDelayed ? "bg-red-500 border-red-500" : "bg-green-500 border-green-500")
                        : "bg-white border-gray-300"
                    )}>
                      <StatusIcon className={cn(
                        "w-4 h-4",
                        isCompleted 
                          ? "text-white" 
                          : "text-gray-500"
                      )} />
                    </div>
                  </div>
                  
                  {/* Event content */}
                  <div className="ml-4 flex-1">
                    <div className="font-semibold text-gray-800 text-base">
                      {event.status}
                    </div>
                    <div className="text-sm text-blue-600 font-medium mb-2">
                      {event.locationName}
                    </div>
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
