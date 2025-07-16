"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Bell, CalendarDays, Ship, PlaneTakeoff, Package } from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import ShipmentTrackingResults from "@/components/ShipmentTrackingResults" // Import the new component
import {
  detectShipmentTrackingInfo,
  getAllCarrierNames,
  getCarrierInfoByName,
} from "@/lib/services/container-detection-service" // New detection utility

// Define a type for recent searches
interface RecentSearch {
  trackingNumber: string
  bookingType: "ocean" | "air" | "lcl" | "unknown"
  carrierHint?: string
}

export default function ShipmentTrackerPage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [currentBookingType, setCurrentBookingType] = useState<"ocean" | "air" | "lcl" | "unknown">("unknown")
  const [manualOverrideType, setManualOverrideType] = useState<"ocean" | "air" | "lcl" | null>(null)
  const [carrierHint, setCarrierHint] = useState<string | undefined>(undefined)
  const [preferScraping, setPreferScraping] = useState(false) // Default to false
  const [isLoading, setIsLoading] = useState(false)
  const [trackingError, setTrackingError] = useState<{ title: string; message: string } | null>(null)
  const [displayedTrackingResult, setDisplayedTrackingResult] = useState<{
    trackingNumber: string
    bookingType: "ocean" | "air" | "lcl" | "unknown"
    preferScraping: boolean
    carrierHint?: string
  } | null>(null) // State to trigger rendering of results component

  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [carrierSuggestions, setCarrierSuggestions] = useState<string[]>([])

  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input on page load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const storedSearches = localStorage.getItem("recentShipmentSearches")
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches))
      }
    } catch (error) {
      console.error("Failed to load recent searches from localStorage:", error)
    }
  }, [])

  // Update recent searches in localStorage whenever the state changes
  const addRecentSearch = useCallback((search: RecentSearch) => {
    setRecentSearches((prevSearches) => {
      // Remove if already exists to move to top
      const filtered = prevSearches.filter(
        (s) => s.trackingNumber !== search.trackingNumber || s.bookingType !== search.bookingType,
      )
      const newSearches = [search, ...filtered].slice(0, 5) // Keep only the last 5
      try {
        localStorage.setItem("recentShipmentSearches", JSON.stringify(newSearches))
      } catch (error) {
        console.error("Failed to save recent searches to localStorage:", error)
      }
      return newSearches
    })
  }, [])

  // Handle tracking number input change and auto-detection
  const handleTrackingNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTrackingNumber(value)
    setTrackingError(null) // Clear errors on input change
    setDisplayedTrackingResult(null) // Hide results when typing new number

    if (value.trim().length > 3) {
      // Start detection after a few characters
      const detectedInfo = detectShipmentTrackingInfo(value)
      setCurrentBookingType(detectedInfo.carrierDetails?.type || detectedInfo.type)
      setCarrierHint(detectedInfo.carrierDetails?.name)

      // Filter carrier suggestions
      const allCarrierNames = getAllCarrierNames()
      const filteredSuggestions = allCarrierNames.filter(
        (name) =>
          name.toLowerCase().includes(value.toLowerCase()) ||
          name.toLowerCase().includes(detectedInfo.carrierDetails?.name.toLowerCase() || ""),
      )
      setCarrierSuggestions(filteredSuggestions.slice(0, 5)) // Limit suggestions
    } else {
      setCurrentBookingType("unknown")
      setCarrierHint(undefined)
      setCarrierSuggestions([])
    }
  }

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) {
      setTrackingError({ title: "Input Required", message: "Please enter a shipment number." })
      return
    }

    setIsLoading(true)
    setTrackingError(null)
    setDisplayedTrackingResult(null) // Clear previous results

    // Determine final booking type (manual override takes precedence)
    const finalBookingType = manualOverrideType || currentBookingType
    const finalCarrierHint = carrierHint || getCarrierInfoByName(trackingNumber)?.name // Use current carrierHint or try to derive from input

    // Save to recent searches
    addRecentSearch({
      trackingNumber,
      bookingType: finalBookingType,
      carrierHint: finalCarrierHint,
    })

    setDisplayedTrackingResult({
      trackingNumber,
      bookingType: finalBookingType,
      preferScraping,
      carrierHint: finalCarrierHint,
    })
    setIsLoading(false) // Loading for the results component will be handled internally
  }

  const handleRecentSearchClick = (search: RecentSearch) => {
    setTrackingNumber(search.trackingNumber)
    setCurrentBookingType(search.bookingType)
    setManualOverrideType(search.bookingType === "unknown" ? null : search.bookingType)
    setCarrierHint(search.carrierHint)
    setDisplayedTrackingResult({
      trackingNumber: search.trackingNumber,
      bookingType: search.bookingType,
      preferScraping: false, // Default to false for recent searches
      carrierHint: search.carrierHint,
    })
    inputRef.current?.focus() // Focus input after populating
  }

  // Determine the display type icon
  const getDisplayIcon = (type: "ocean" | "air" | "lcl" | "unknown") => {
    switch (type) {
      case "ocean":
      case "lcl":
        return <Ship className="h-4 w-4 mr-2 text-blue-600" />
      case "air":
        return <PlaneTakeoff className="h-4 w-4 mr-2 text-purple-600" />
      default:
        return <Package className="h-4 w-4 mr-2 text-gray-600" />
    }
  }

  return (
    <ProtectedRoute requiredPermission={{ module: "shipmentTracker", action: "view" }}>
      <div
        className="relative min-h-screen w-full bg-cover bg-center flex flex-col items-center justify-start p-4"
        style={{ backgroundImage: "url('/images/world-map.jpg')" }}
      >
        {/* Top Right Buttons */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <Button variant="ghost" className="text-white hover:bg-white/20 flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/20 flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> Calendar
          </Button>
        </div>

        {/* Centered Search Card */}
        <Card className="mt-24 w-full max-w-md rounded-lg shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-extrabold text-gray-800">Track Your Shipment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrackSubmit} className="space-y-6">
              <div className="relative">
                <Label htmlFor="trackingNumber" className="sr-only">
                  Shipment number
                </Label>
                <Input
                  ref={inputRef}
                  id="trackingNumber"
                  type="text"
                  placeholder="Enter shipment number (container, B/L, AWB, or booking ref)"
                  value={trackingNumber}
                  onChange={handleTrackingNumberChange}
                  required
                  className="w-full pl-4 pr-12 py-3 text-lg rounded-full border-2 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>

              {trackingError && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{trackingError.message}</AlertDescription>
                </Alert>
              )}

              {/* Autocomplete Suggestions (simple text display) */}
              {carrierSuggestions.length > 0 && (
                <div className="mt-2 text-sm text-gray-600 px-2">
                  <p className="font-semibold">Suggested Carriers:</p>
                  <ul className="list-disc list-inside">
                    {carrierSuggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detected Type and Manual Override */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <Label htmlFor="detectedType" className="text-sm font-medium text-gray-700">
                    Detected Type:
                  </Label>
                  <div className="flex items-center mt-1 text-gray-800 font-medium">
                    {getDisplayIcon(currentBookingType)}
                    {currentBookingType === "unknown"
                      ? "Auto-detecting..."
                      : currentBookingType.charAt(0).toUpperCase() + currentBookingType.slice(1)}
                  </div>
                  {carrierHint && <p className="text-xs text-gray-500 ml-6">Carrier: {carrierHint}</p>}
                </div>
                <div className="flex-1">
                  <Label htmlFor="manualOverride" className="text-sm font-medium text-gray-700">
                    Manual Override:
                  </Label>
                  <Select
                    value={manualOverrideType || ""}
                    onValueChange={(value: "ocean" | "air" | "lcl") => setManualOverrideType(value)}
                  >
                    <SelectTrigger id="manualOverride" className="w-full mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ocean" className="flex items-center gap-2">
                        <Ship className="h-4 w-4" /> Ocean Cargo
                      </SelectItem>
                      <SelectItem value="air" className="flex items-center gap-2">
                        <PlaneTakeoff className="h-4 w-4" /> Air Cargo
                      </SelectItem>
                      <SelectItem value="lcl" className="flex items-center gap-2">
                        <Package className="h-4 w-4" /> LCL Cargo
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Prefer Web Scraping Checkbox (if needed) */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="preferScraping"
                  checked={preferScraping}
                  onChange={(e) => setPreferScraping(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="preferScraping">Prefer Web Scraping (if API fails)</Label>
              </div>
            </form>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleRecentSearchClick(search)}
                      className="flex items-center gap-1 text-gray-700 hover:bg-gray-50 border-gray-300"
                    >
                      {getDisplayIcon(search.bookingType)}
                      <span className="font-medium">{search.trackingNumber}</span>
                      {search.carrierHint && <span className="text-xs text-gray-500">({search.carrierHint})</span>}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Display Tracking Results */}
        {displayedTrackingResult && (
          <ShipmentTrackingResults
            trackingNumber={displayedTrackingResult.trackingNumber}
            bookingType={displayedTrackingResult.bookingType}
            preferScraping={displayedTrackingResult.preferScraping}
            carrierHint={displayedTrackingResult.carrierHint}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
