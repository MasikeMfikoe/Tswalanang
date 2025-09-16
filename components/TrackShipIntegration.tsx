"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Ship, Package, MapPin, Calendar } from "lucide-react"

export default function TrackShipIntegration() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTrack = async () => {
    if (!trackingNumber.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/trackship", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackingNumber: trackingNumber.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        setError(data.error || "Tracking failed")
      }
    } catch (err) {
      setError("Failed to connect to tracking service")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5" />
            TrackShip Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleTrack()}
            />
            <Button onClick={handleTrack} disabled={loading || !trackingNumber.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track"}
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tracking Number</p>
                  <p className="font-mono">{result.tracking_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Carrier</p>
                  <p>{result.carrier}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <Badge variant="outline">{result.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <p className="text-sm">{result.location}</p>
                  </div>
                </div>
              </div>

              {result.estimated_delivery && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Estimated Delivery</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <p className="text-sm">{new Date(result.estimated_delivery).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {result.events && Array.isArray(result.events) && result.events.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Tracking Events</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {result.events.map((event: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                        <Package className="h-4 w-4 mt-0.5 text-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event.status}</p>
                          <p className="text-xs text-gray-600">{event.location}</p>
                          <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
