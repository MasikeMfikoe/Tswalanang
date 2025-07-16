"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import type { VesselPosition } from "@/types/tracking"

interface ShipmentUpdatesProps {
  imoNumber?: string
}

export function ShipmentUpdates({ imoNumber }: ShipmentUpdatesProps) {
  const [vesselPosition, setVesselPosition] = useState<VesselPosition | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (imoNumber) {
      const fetchVesselPosition = async () => {
        setLoading(true)
        setError(null)
        try {
          const response = await fetch(`/api/vessel-position?imo=${imoNumber}`)
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.details || "Failed to fetch vessel data")
          }
          const data: VesselPosition = await response.json()
          setVesselPosition(data)
        } catch (err: any) {
          setError(err.message)
          setVesselPosition(null)
        } finally {
          setLoading(false)
        }
      }
      fetchVesselPosition()
    }
  }, [imoNumber])

  if (!imoNumber) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Vessel Position Updates</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex justify-center items-center h-24">
            <Spinner />
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {vesselPosition && !loading && !error && (
          <div className="space-y-2">
            <p>
              <strong>Vessel Name:</strong> {vesselPosition.vesselName}
            </p>
            <p>
              <strong>Latitude:</strong> {vesselPosition.latitude}
            </p>
            <p>
              <strong>Longitude:</strong> {vesselPosition.longitude}
            </p>
            <p>
              <strong>Speed:</strong> {vesselPosition.speed} knots
            </p>
            <p>
              <strong>Status:</strong> {vesselPosition.status}
            </p>
            <p>
              <strong>Last Updated:</strong> {new Date(vesselPosition.lastUpdated).toLocaleString()}
            </p>
            {vesselPosition.destination && (
              <p>
                <strong>Destination:</strong> {vesselPosition.destination}
              </p>
            )}
            {vesselPosition.eta && (
              <p>
                <strong>ETA:</strong> {new Date(vesselPosition.eta).toLocaleString()}
              </p>
            )}
          </div>
        )}
        {!vesselPosition && !loading && !error && (
          <p className="text-center text-muted-foreground">No vessel position data available for this IMO number.</p>
        )}
      </CardContent>
    </Card>
  )
}
