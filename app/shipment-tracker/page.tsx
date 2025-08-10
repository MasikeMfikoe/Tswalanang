"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, ArrowLeft } from "lucide-react"
import { ShipmentTrackingResults } from "@/components/ShipmentTrackingResults"
import { useAuth } from "@/contexts/AuthContext"

export default function ShipmentTrackerPage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [trackingData, setTrackingData] = useState(null)
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number")
      return
    }

    setIsLoading(true)
    setError(null)
    setShowResults(false)

    try {
      const response = await fetch("/api/tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trackingNumber: trackingNumber.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to track shipment")
      }

      setTrackingData(data)
      setShowResults(true)
    } catch (err: any) {
      console.error("Tracking error:", err)
      setError(err.message || "Failed to track shipment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTrack()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Shipment</h1>
            <p className="text-lg text-gray-600">
              Enter your tracking number to get real-time updates on your shipment status
            </p>
          </div>

          {/* Back to Landing Page Button - Only show if tracking completed and no user logged in */}
          {showResults && !user && (
            <div className="flex justify-center mb-6">
              <Button
                onClick={() => router.push("/")}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Landing Page
              </Button>
            </div>
          )}

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center">Enter Tracking Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 max-w-md mx-auto">
                <Input
                  type="text"
                  placeholder="Enter tracking number (e.g., MSKU1234567)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button onClick={handleTrack} disabled={isLoading || !trackingNumber.trim()} className="px-6">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-center">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {showResults && trackingData && <ShipmentTrackingResults data={trackingData} />}

          {!showResults && !isLoading && (
            <div className="text-center text-gray-500 mt-8">
              <p>Enter a tracking number above to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
