"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ShipmentTrackingResults from "@/components/ShipmentTrackingResults"
import { Loader2, Search } from "lucide-react"
import type { ShipmentType } from "@/types/tracking"

export default function ShipmentTrackerPage() {
  const [trackingNumberInput, setTrackingNumberInput] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [bookingType, setBookingType] = useState<ShipmentType>("unknown")
  const [carrierHint, setCarrierHint] = useState<string | undefined>(undefined)
  const [gocometToken, setGocometToken] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const authenticateGocomet = async () => {
      setAuthLoading(true)
      setAuthError(null)
      try {
        const response = await fetch("/api/gocomet-auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: process.env.NEXT_PUBLIC_GOCOMET_EMAIL,
            password: process.env.NEXT_PUBLIC_GOCOMET_PASSWORD,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to authenticate with GoComet")
        }

        const data = await response.json()
        setGocometToken(data.token)
      } catch (err: any) {
        console.error("GoComet authentication error:", err)
        setAuthError(`Authentication error: ${err.message}`)
      } finally {
        setAuthLoading(false)
      }
    }

    authenticateGocomet()
  }, [])

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    setTrackingNumber(trackingNumberInput)
    // In a real app, you might detect bookingType and carrierHint here
    // For now, we'll let the backend handle initial detection or use defaults
    setBookingType("unknown")
    setCarrierHint(undefined)
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-gray-800">Shipment Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrack} className="flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Enter tracking number (e.g., MEDU9445622)"
              value={trackingNumberInput}
              onChange={(e) => setTrackingNumberInput(e.target.value)}
              className="p-3 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button type="submit" className="w-full p-3 text-lg" disabled={authLoading || !gocometToken}>
              {authLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" /> Track Shipment
                </>
              )}
            </Button>
          </form>

          {authError && (
            <div className="mt-4 text-red-600 text-center">
              <p>{authError}</p>
              <p className="text-sm text-gray-500">Please check your GoComet API credentials.</p>
            </div>
          )}

          {trackingNumber && gocometToken && (
            <div className="mt-8">
              <ShipmentTrackingResults
                trackingNumber={trackingNumber}
                bookingType={bookingType}
                carrierHint={carrierHint}
                gocometToken={gocometToken}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
