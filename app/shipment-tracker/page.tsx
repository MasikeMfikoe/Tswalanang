"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import ShipmentTrackingResults from "@/components/ShipmentTrackingResults"
import { detectShipmentTrackingInfo } from "@/lib/services/container-detection-service"
import type { ShipmentType } from "@/types/tracking"
import Image from "next/image"

export default function ShipmentTrackerPage() {
  const [trackingNumberInput, setTrackingNumberInput] = useState("")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [detectedShipmentType, setDetectedShipmentType] = useState<ShipmentType>("unknown")
  const [detectedCarrierName, setDetectedCarrierName] = useState<string | undefined>(undefined)
  const [gocometToken, setGocometToken] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Automatic GoComet Authentication on component mount
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
          // No body needed, credentials are read from env vars on the server
        })

        if (!response.ok) {
          const errorText = await response.text() // Read as text first
          let errorMessage = `Failed to authenticate with GoComet: ${response.status} ${response.statusText}`
          try {
            const errorData = JSON.parse(errorText) // Attempt to parse as JSON
            errorMessage = errorData.error || errorMessage
          } catch (parseError) {
            // If parsing fails, use the raw text
            errorMessage = `Failed to authenticate with GoComet: ${errorText}`
          }
          throw new Error(errorMessage)
        }

        const data = await response.json()
        if (data.success && data.token) {
          setGocometToken(data.token)
          console.log("GoComet authentication successful.")
        } else {
          throw new Error(data.error || "GoComet authentication failed: No token received.")
        }
      } catch (error: any) {
        console.error("Authentication error:", error)
        setAuthError(`Authentication error: ${error.message}`)
      } finally {
        setAuthLoading(false)
      }
    }

    authenticateGocomet()
  }, []) // Run only once on mount

  const handleSearch = () => {
    if (trackingNumberInput.trim()) {
      setTrackingNumber(trackingNumberInput) // Set the tracking number to trigger results display
      const detectedInfo = detectShipmentTrackingInfo(trackingNumberInput) // Use the more detailed detection
      setDetectedShipmentType(detectedInfo.type)
      setDetectedCarrierName(detectedInfo.carrierDetails?.name) // Set the detected carrier name
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTrackingNumberInput(value)
    if (!value.trim()) {
      setTrackingNumber("") // Clear tracking number to hide results
      setDetectedShipmentType("unknown")
      setDetectedCarrierName(undefined) // Clear detected carrier
    } else {
      const detectedInfo = detectShipmentTrackingInfo(value) // Use the more detailed detection
      setDetectedShipmentType(detectedInfo.type)
      setDetectedCarrierName(detectedInfo.carrierDetails?.name) // Set the detected carrier name
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Image
        src="/images/world-map.jpg"
        alt="World Map Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        className="absolute inset-0 z-0 opacity-20 dark:opacity-10"
      />
      <div className="relative z-10 w-full max-w-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">Track Your Shipment</h1>

        {authLoading && (
          <div className="text-center text-gray-600 dark:text-gray-400 mb-4">Authenticating GoComet...</div>
        )}
        {authError && (
          <div className="text-center text-red-600 dark:text-red-400 mb-4 p-2 border border-red-500 rounded">
            {authError}
          </div>
        )}
        {!authLoading && !gocometToken && !authError && (
          <div className="text-center text-yellow-600 dark:text-yellow-400 mb-4 p-2 border border-yellow-500 rounded">
            GoComet authentication failed or token not available. Tracking might be limited.
          </div>
        )}

        <div className="flex space-x-2 mb-4">
          <Input
            type="text"
            placeholder="Enter tracking number (e.g., MEDU9445622)"
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            value={trackingNumberInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <Button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-md flex items-center gap-2"
            disabled={authLoading || !trackingNumberInput.trim()}
          >
            <Search className="h-5 w-5" />
            Track
          </Button>
        </div>

        {trackingNumberInput.trim() && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Detected:{" "}
            <span className="font-semibold">
              {detectedShipmentType !== "unknown" ? detectedShipmentType.toUpperCase() : "Unknown Type"}
            </span>
            {detectedCarrierName && <span className="ml-1">({detectedCarrierName})</span>}
            {!detectedCarrierName && detectedShipmentType !== "unknown" && (
              <span className="ml-1">(Carrier Unknown)</span>
            )}
          </p>
        )}

        {trackingNumber && (
          <div className="mt-8">
            <ShipmentTrackingResults
              trackingNumber={trackingNumber}
              bookingType={detectedShipmentType}
              carrierHint={detectedCarrierName} // Pass the detected carrier name as hint
              gocometToken={gocometToken} // Pass the obtained token
            />
          </div>
        )}
      </div>
    </div>
  )
}
