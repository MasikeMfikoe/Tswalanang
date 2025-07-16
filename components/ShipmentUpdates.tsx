"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Ship, Package, MapPin, Calendar } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import type { ShipmentUpdate } from "@/types/shipping"

const useMarineTraffic = true // Enable/disable MarineTraffic integration

interface ShipmentUpdatesProps {
  orderId: string
}

export default function ShipmentUpdates({ orderId }: ShipmentUpdatesProps) {
  const [shipment, setShipment] = useState<any>(null)
  const [vesselPosition, setVesselPosition] = useState<any>(null)
  const [updates, setUpdates] = useState<ShipmentUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchShipmentData()
  }, [orderId])

  const fetchShipmentData = async () => {
    console.log("Fetching shipment data")
    try {
      setLoading(true)

      // Fetch shipment
      const { data: shipments, error: shipmentError } = await supabase
        .from("shipments")
        .select("*")
        .eq("order_id", orderId)
        .single()

      if (shipmentError) {
        console.error("Error fetching shipment:", shipmentError)
        setLoading(false)
        return
      }
      if (!shipments) {
        console.warn("No shipment found for order ID:", orderId)
        return
      }

      setShipment(shipments)

      // Fetch updates
      const { data: updateData, error: updateError } = await supabase
        .from("shipment_updates")
        .select("*")
        .eq("shipment_id", shipments.id)
        .order("created_at", { ascending: false })

      if (updateError) {
        console.error("Error fetching shipment updates:", updateError)
      } else {
        setUpdates(updateData || [])
      }

      if (useMarineTraffic && shipments.imo_number) {
        console.log("Fetching vessel position from MarineTraffic for IMO:", shipments.imo_number)
        await fetchVesselPosition(shipments.imo_number)
      }
    } catch (error) {
      console.error("Error in fetchShipmentData:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVesselPosition = useCallback(async (imo: string) => {
    try {
      const res = await fetch(`/api/vessel-position?imo=${imo}`)
      const json = await res.json()
      if (json.success) {
        setVesselPosition(json.data)
      } else {
        console.error("Error fetching vessel position:", json.error)
      }
    } catch (err) {
      console.error("Error fetching vessel position:", err)
    }
  }, [])

  useEffect(() => {
    if (shipment?.imo_number && useMarineTraffic) {
      fetchVesselPosition(shipment.imo_number)
    }
  }, [shipment, fetchVesselPosition])

  const handleRefresh = async () => {
    try {
      setRefreshing(true)

      // Call API to trigger an immediate update
      const response = await fetch(`/api/shipping-updates/manual?shipmentId=${shipment.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to refresh shipment data")
      }

      // Refetch the data
      await fetchShipmentData()
    } catch (error) {
      console.error("Error refreshing shipment data:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, { bg: string; text: string; border: string }> = {
      "instruction-sent": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
      "agent-response": { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
      "at-origin": { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-300" },
      "cargo-departed": { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
      "in-transit": { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
      "at-destination": { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
      delivered: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
    }

    const colors = statusColors[status] || { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" }

    return (
      <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border}`}>
        {status.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shipment Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!shipment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shipment Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No shipment information available for this order.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Shipment Tracking</CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Shipment Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Container Number</h3>
              <p className="font-medium">{shipment.container_number || "Not assigned yet"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Booking Reference</h3>
              <p className="font-medium">{shipment.booking_reference || "Not assigned yet"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Shipping Line</h3>
              <p className="font-medium">{shipment.shipping_line.toUpperCase()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
              <div className="mt-1">{getStatusBadge(shipment.status)}</div>
            </div>
            {shipment.vessel && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Vessel</h3>
                <div className="flex items-center mt-1">
                  <Ship className="h-4 w-4 mr-1 text-blue-500" />
                  <p>
                    {shipment.vessel} {shipment.voyage ? `/ ${shipment.voyage}` : ""}
                  </p>
                </div>
              </div>
            )}
            {shipment.location && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Current Location</h3>
                <div className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1 text-red-500" />
                  <p>{shipment.location}</p>
                </div>
              </div>
            )}
            {shipment.eta && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Estimated Arrival</h3>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-1 text-green-500" />
                  <p>
                    {new Date(shipment.eta).toLocaleDateString()}{" "}
                    {new Date(shipment.eta).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            )}
            {vesselPosition && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Realtime Position</h3>
                <p className="font-medium">
                  Lat: {vesselPosition.latitude}, Lon: {vesselPosition.longitude}
                  <br /> Speed: {vesselPosition.speed / 10} knots
                </p>
              </div>
            )}
          </div>

          {/* Status Updates */}
          <div>
            <h3 className="text-lg font-medium mb-3">Status Updates</h3>
            {updates.length === 0 ? (
              <p className="text-gray-500">No status updates available yet.</p>
            ) : (
              <div className="space-y-4">
                {updates.map((update, index) => (
                  <div key={update.id} className="border-l-2 border-blue-500 pl-4 pb-4">
                    <div className="flex items-center mb-1">
                      <Package className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="font-medium">
                        {update.status.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mb-1">
                      {new Date(update.timestamp).toLocaleDateString()}{" "}
                      {new Date(update.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {update.location && (
                      <div className="flex items-center text-sm text-gray-700 mb-1">
                        <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                        {update.location}
                      </div>
                    )}
                    {update.details && <p className="text-sm text-gray-700 mt-1">{update.details}</p>}
                    <div className="text-xs text-gray-400 mt-1">
                      Source:{" "}
                      {update.source === "api"
                        ? "Automatic update"
                        : update.source === "webhook"
                          ? "Shipping line notification"
                          : "Manual update"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
