"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertCircle, Wifi, WifiOff } from "lucide-react"

interface LiveTrackingStatus {
  carrierName: string
  isLiveSupported: boolean
  hasCredentials: boolean
  status: "active" | "inactive" | "no-credentials" | "unsupported"
}

export function LiveTrackingStatus() {
  const [trackingStatus, setTrackingStatus] = useState<LiveTrackingStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/tracking-status")
        if (response.ok) {
          const data = await response.json()
          setTrackingStatus(data.carriers || [])
        }
      } catch (error) {
        console.error("Failed to fetch tracking status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatus()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "no-credentials":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "unsupported":
        return <XCircle className="h-4 w-4 text-gray-400" />
      default:
        return <WifiOff className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Live</Badge>
      case "no-credentials":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-700">
            No API Key
          </Badge>
        )
      case "unsupported":
        return (
          <Badge variant="outline" className="border-gray-300 text-gray-600">
            Not Supported
          </Badge>
        )
      default:
        return <Badge variant="destructive">Offline</Badge>
    }
  }

  const activeCarriers = trackingStatus?.filter((c) => c.status === "active")?.length || 0
  const totalSupported = trackingStatus?.filter((c) => c.isLiveSupported)?.length || 0

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Checking live tracking status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Wifi className="h-4 w-4" />
          Live Tracking Status
        </CardTitle>
        <div className="text-xs text-gray-600">
          {activeCarriers} of {totalSupported} carriers active
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-2">
          {trackingStatus.map((carrier) => (
            <div key={carrier.carrierName} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(carrier.status)}
                <span className="text-sm">{carrier.carrierName}</span>
              </div>
              {getStatusBadge(carrier.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
