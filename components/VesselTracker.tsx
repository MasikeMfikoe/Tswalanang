"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Ship, MapPin, Anchor, Navigation, Info, ExternalLink } from "lucide-react"
import type { VesselTrackingData } from "@/lib/services/marinetraffic-service"

interface VesselTrackerProps {
  onVesselFound?: (vessel: VesselTrackingData) => void
}

export function VesselTracker({ onVesselFound }: VesselTrackerProps) {
  const [searchType, setSearchType] = useState<"imo" | "name">("name")
  const [searchValue, setSearchValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [vesselData, setVesselData] = useState<VesselTrackingData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchValue.trim()) return

    setIsLoading(true)
    setError(null)
    setVesselData(null)

    try {
      const params = new URLSearchParams({
        [searchType]: searchValue.trim(),
        includePorts: "true",
      })

      const response = await fetch(`/api/marinetraffic/vessel?${params}`)
      const result = await response.json()

      if (result.success && result.data) {
        setVesselData(result.data)
        onVesselFound?.(result.data)
      } else {
        setError(result.error || "Vessel not found")
      }
    } catch (err) {
      setError("Failed to search for vessel. Please try again.")
      console.error("Vessel search error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCoordinate = (coord: number, type: "lat" | "lon") => {
    const abs = Math.abs(coord)
    const degrees = Math.floor(abs)
    const minutes = ((abs - degrees) * 60).toFixed(4)
    const direction = type === "lat" ? (coord >= 0 ? "N" : "S") : coord >= 0 ? "E" : "W"
    return `${degrees}°${minutes}'${direction}`
  }

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      "Under way using engine": "bg-green-100 text-green-800",
      "At anchor": "bg-yellow-100 text-yellow-800",
      Moored: "bg-blue-100 text-blue-800",
      Aground: "bg-red-100 text-red-800",
      "Not under command": "bg-gray-100 text-gray-800",
      "Restricted manoeuvrability": "bg-orange-100 text-orange-800",
    }
    return statusColors[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            Vessel Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="searchValue">{searchType === "imo" ? "IMO Number" : "Vessel Name"}</Label>
                <Input
                  id="searchValue"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={
                    searchType === "imo" ? "Enter IMO number (e.g., 9074729)" : "Enter vessel name (e.g., MAERSK ESSEX)"
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Search By</Label>
                <div className="flex mt-1">
                  <Button
                    type="button"
                    variant={searchType === "name" ? "default" : "outline"}
                    onClick={() => setSearchType("name")}
                    className="rounded-r-none"
                  >
                    Name
                  </Button>
                  <Button
                    type="button"
                    variant={searchType === "imo" ? "default" : "outline"}
                    onClick={() => setSearchType("imo")}
                    className="rounded-l-none"
                  >
                    IMO
                  </Button>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isLoading || !searchValue.trim()} className="w-full">
              {isLoading ? "Searching..." : "Track Vessel"}
            </Button>
          </form>

          {error && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Vessel Data */}
      {vesselData && (
        <div className="space-y-6">
          {/* Vessel Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{vesselData.vessel.name}</span>
                <Badge className={getStatusColor(vesselData.position.status)}>{vesselData.position.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">IMO Number</p>
                  <p className="font-medium">{vesselData.vessel.imo || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">MMSI</p>
                  <p className="font-medium">{vesselData.vessel.mmsi || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Call Sign</p>
                  <p className="font-medium">{vesselData.vessel.callsign || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vessel Type</p>
                  <p className="font-medium">{vesselData.vessel.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Flag</p>
                  <p className="font-medium">{vesselData.vessel.flag || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Built</p>
                  <p className="font-medium">{vesselData.vessel.built || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="position" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="position">Position</TabsTrigger>
              <TabsTrigger value="voyage">Voyage</TabsTrigger>
              <TabsTrigger value="specifications">Specs</TabsTrigger>
              <TabsTrigger value="ports">Port Calls</TabsTrigger>
            </TabsList>

            {/* Position Tab */}
            <TabsContent value="position">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Current Position
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Latitude</p>
                      <p className="font-medium">{formatCoordinate(vesselData.position.latitude, "lat")}</p>
                      <p className="text-xs text-gray-500">{vesselData.position.latitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Longitude</p>
                      <p className="font-medium">{formatCoordinate(vesselData.position.longitude, "lon")}</p>
                      <p className="text-xs text-gray-500">{vesselData.position.longitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Speed</p>
                      <p className="font-medium">{vesselData.position.speed.toFixed(1)} knots</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Course</p>
                      <p className="font-medium">{vesselData.position.course}°</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Heading</p>
                      <p className="font-medium">{vesselData.position.heading}°</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Update</p>
                      <p className="font-medium">{new Date(vesselData.position.timestamp).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open(
                          `https://www.marinetraffic.com/en/ais/details/ships/mmsi:${vesselData.vessel.mmsi}`,
                          "_blank",
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on MarineTraffic
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Voyage Tab */}
            <TabsContent value="voyage">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Voyage Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Destination</p>
                      <p className="font-medium">{vesselData.voyage.destination || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ETA</p>
                      <p className="font-medium">{vesselData.voyage.eta || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Current Draught</p>
                      <p className="font-medium">
                        {vesselData.voyage.draught ? `${vesselData.voyage.draught} m` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Maximum Draught</p>
                      <p className="font-medium">
                        {vesselData.voyage.max_draught ? `${vesselData.voyage.max_draught} m` : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5" />
                    Vessel Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Length</p>
                      <p className="font-medium">
                        {vesselData.vessel.length ? `${vesselData.vessel.length} m` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Width</p>
                      <p className="font-medium">{vesselData.vessel.width ? `${vesselData.vessel.width} m` : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Deadweight Tonnage</p>
                      <p className="font-medium">
                        {vesselData.vessel.dwt ? `${vesselData.vessel.dwt.toLocaleString()} t` : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gross Tonnage</p>
                      <p className="font-medium">
                        {vesselData.vessel.gt ? `${vesselData.vessel.gt.toLocaleString()} t` : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Port Calls Tab */}
            <TabsContent value="ports">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Anchor className="h-5 w-5" />
                    Recent Port Calls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vesselData.port_calls && vesselData.port_calls.length > 0 ? (
                    <div className="space-y-4">
                      {vesselData.port_calls.map((portCall, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{portCall.port_name}</h4>
                            <Badge variant="outline">{portCall.country_code}</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Arrival:</span>{" "}
                              {portCall.arrival_time ? new Date(portCall.arrival_time).toLocaleString() : "N/A"}
                            </div>
                            <div>
                              <span className="text-gray-600">Departure:</span>{" "}
                              {portCall.departure_time ? new Date(portCall.departure_time).toLocaleString() : "N/A"}
                            </div>
                            {portCall.berth && (
                              <div>
                                <span className="text-gray-600">Berth:</span> {portCall.berth}
                              </div>
                            )}
                            {portCall.terminal && (
                              <div>
                                <span className="text-gray-600">Terminal:</span> {portCall.terminal}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No recent port call data available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
