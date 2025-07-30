"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Ship, PlaneTakeoff, Package } from "lucide-react"
import type { ShipmentTrackingData } from "@/types/tracking"

interface ShipmentTrackingResultsProps {
  trackingData: ShipmentTrackingData | null
  isLoading: boolean
  error: string | null
}

const getStatusColorClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return "text-green-600"
    case "in transit":
      return "text-blue-600"
    case "pending":
      return "text-yellow-600"
    case "exception":
      return "text-red-600"
    default:
      return "text-gray-600"
  }
}

export default function ShipmentTrackingResults({ trackingData, isLoading, error }: ShipmentTrackingResultsProps) {
  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6 text-center">
          <p>Loading tracking information...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6 text-center text-red-500">
          <p>Error: {error}</p>
          <p>Please try again or check the tracking number.</p>
        </CardContent>
      </Card>
    )
  }

  if (!trackingData) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6 text-center">
          <p>Enter a tracking number to see shipment details.</p>
        </CardContent>
      </Card>
    )
  }

  const { shipmentNumber, status, vesselName, freightType, events } = trackingData

  const displayShipmentType = freightType?.toLowerCase()

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>Shipment: {shipmentNumber}</span>
          <span className={cn("text-xl font-semibold", getStatusColorClass(status))}>{status}</span>
        </CardTitle>
        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
          {displayShipmentType === "ocean" && <Ship className="h-4 w-4" />}
          {displayShipmentType === "air" && <PlaneTakeoff className="h-4 w-4" />}
          {displayShipmentType === "lcl" && <Package className="h-4 w-4" />}
          {freightType && <span>{freightType}</span>}
          {vesselName && <span>Vessel: {vesselName}</span>}
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold mb-4">Tracking Events</h3>
        {events && events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  {index < events.length - 1 && <div className="w-px h-10 bg-gray-300" />}
                </div>
                <div>
                  <p className="font-medium">{event.location}</p>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No tracking events available.</p>
        )}
      </CardContent>
    </Card>
  )
}
