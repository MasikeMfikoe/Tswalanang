"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2, Ship, Plane, Package, MapPin, Calendar, Clock, Info } from "lucide-react"
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { detectShipmentTrackingInfo } from "@/lib/services/container-detection-service"
import { fetchSeaRatesTracking, fetchMarineTrafficVesselPosition } from "@/lib/services/multi-provider-tracking-service"
import type { ShipmentTrackingResult, VesselPosition } from "@/types/tracking"

interface ShipmentUpdatesProps {
  trackingNumber: string
}

export default function ShipmentUpdates({ trackingNumber }: ShipmentUpdatesProps) {
  const [trackingResult, setTrackingResult] = useState<ShipmentTrackingResult | null>(null)
  const [vesselPosition, setVesselPosition] = useState<VesselPosition | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTrackingData = async () => {
      setIsLoading(true)
      setError(null)
      setTrackingResult(null)
      setVesselPosition(null)

      try {
        const detectedInfo = detectShipmentTrackingInfo(trackingNumber)

        if (detectedInfo.type === "unknown") {
          setError("Could not detect shipment type (container, AWB, or B/L). Please check the number format.")
          setIsLoading(false)
          return
        }

        // Fetch tracking from SeaRates
        const seaRatesData = await fetchSeaRatesTracking(trackingNumber)
        setTrackingResult(seaRatesData)

        // If it's an ocean shipment and we have an IMO, fetch vessel position
        if (detectedInfo.type === "ocean" && seaRatesData?.imo) {
          const vesselPos = await fetchMarineTrafficVesselPosition(seaRatesData.imo)
          setVesselPosition(vesselPos)
        }
      } catch (err: any) {
        console.error("Error fetching shipment updates:", err)
        setError(err.message || "Failed to fetch tracking information. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (trackingNumber) {
      fetchTrackingData()
    }
  }, [trackingNumber])

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center p-6 min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Fetching shipment updates...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Tracking Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!trackingResult || !trackingResult.status) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Tracking Data</AlertTitle>
            <AlertDescription>
              No tracking information found for this shipment number. Please double-check the number or try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const detectedInfo = detectShipmentTrackingInfo(trackingNumber)
  const carrierName = trackingResult.carrier || detectedInfo.carrier
  const transportModeIcon = detectedInfo.type === "ocean" ? <Ship className="h-5 w-5" /> : <Plane className="h-5 w-5" />

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          {transportModeIcon}
          Shipment Status: {trackingResult.status}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Tracking Number</p>
              <p className="font-medium">{trackingNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Carrier</p>
              <p className="font-medium">{carrierName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Transport Mode</p>
              <p className="font-medium">{detectedInfo.type === "ocean" ? "Sea Freight" : "Air Freight"}</p>
            </div>
          </div>
          {trackingResult.origin && (
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Origin</p>
                <p className="font-medium">{trackingResult.origin}</p>
              </div>
            </div>
          )}
          {trackingResult.destination && (
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-medium">{trackingResult.destination}</p>
              </div>
            </div>
          )}
          {trackingResult.eta && (
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Estimated Arrival</p>
                <p className="font-medium">{format(new Date(trackingResult.eta), "PPP p")}</p>
              </div>
            </div>
          )}
        </div>

        {vesselPosition && (
          <>
            <Separator />
            <h3 className="text-lg font-semibold">Current Vessel Position</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Ship className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Vessel Name</p>
                  <p className="font-medium">{vesselPosition.vesselName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Known Position</p>
                  <p className="font-medium">
                    {vesselPosition.latitude}, {vesselPosition.longitude}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{format(new Date(vesselPosition.lastUpdated), "PPP p")}</p>
                </div>
              </div>
              {vesselPosition.speedKnots && (
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Speed</p>
                    <p className="font-medium">{vesselPosition.speedKnots} knots</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {trackingResult.events && trackingResult.events.length > 0 && (
          <>
            <Separator />
            <h3 className="text-lg font-semibold">Tracking History</h3>
            <div className="space-y-4">
              {trackingResult.events.map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    {index < trackingResult.events.length - 1 && (
                      <div className="w-px h-full bg-gray-300 dark:bg-gray-700" />
                    )}
                  </div>
                  <div className="grid gap-1">
                    <p className="font-medium">{event.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(event.date), "PPP")}</span>
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(event.date), "p")}</span>
                      {event.location && (
                        <>
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
