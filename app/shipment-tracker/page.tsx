"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Ship, Plane } from "lucide-react"
import {
  detectShipmentInfo,
  getCarrierSuggestions,
  type ShipmentType,
  type CarrierSuggestion,
} from "@/lib/services/container-detection-service"
import ShipmentTrackingResults from "@/components/ShipmentTrackingResults"

const RECENT_KEY = "recentShipmentSearches"

export default function ShipmentTrackerPage() {
  // ----- state -------------------------------------------------------------
  const [trackingNumber, setTrackingNumber] = useState("")
  const [detectedType, setDetectedType] = useState<ShipmentType>("unknown")
  const [carrierHint, setCarrierHint] = useState<string>()
  const [manualOverride, setManualOverride] = useState<ShipmentType>()
  const [suggestions, setSuggestions] = useState<CarrierSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const [showResults, setShowResults] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionBoxRef = useRef<HTMLDivElement>(null)

  // ----- life-cycle --------------------------------------------------------
  useEffect(() => {
    inputRef.current?.focus()
    const stored = localStorage.getItem(RECENT_KEY)
    if (stored) setRecent(JSON.parse(stored))
  }, [])

  // close autocomplete when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // ----- helpers -----------------------------------------------------------
  const saveRecent = (value: string) => {
    setRecent((prev) => {
      const updated = [value, ...prev.filter((v) => v !== value)].slice(0, 5)
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const displayType: ShipmentType = manualOverride || detectedType

  // icon used in UI only
  const typeIcon =
    displayType === "air" ? (
      <Plane className="h-4 w-4 ml-1" />
    ) : displayType === "ocean" ? (
      <Ship className="h-4 w-4 ml-1" />
    ) : null

  // ----- event handlers ----------------------------------------------------
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTrackingNumber(value)
    setShowResults(false) // hide old results
    setManualOverride(undefined)

    if (value.trim().length >= 3) {
      const detect = detectShipmentInfo(value)
      setDetectedType(detect.type)
      setCarrierHint(detect.carrierHint)
      const sug = getCarrierSuggestions(value)
      setSuggestions(sug)
      setShowSuggestions(sug.length > 0)
    } else {
      setDetectedType("unknown")
      setCarrierHint(undefined)
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    const value = trackingNumber.trim()
    if (!value) return
    saveRecent(value)
    setShowResults(true)
    setShowSuggestions(false)
  }

  // clicking a suggestion fills carrier hint & maybe type
  const chooseSuggestion = (s: CarrierSuggestion) => {
    setCarrierHint(s.name)
    setManualOverride(s.type)
    setShowSuggestions(false)
  }

  const chooseRecent = (value: string) => {
    setTrackingNumber(value)
    const detect = detectShipmentInfo(value)
    setDetectedType(detect.type)
    setCarrierHint(detect.carrierHint)
    setManualOverride(undefined)
    setShowResults(true)
  }

  // ----- render ------------------------------------------------------------
  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/world-map.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50" />

      {/* header buttons */}
      {false && (
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Button variant="ghost" className="text-white hover:bg-white/20">
            {/* Bell icon and text */}
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/20">
            {/* CalendarDays icon and text */}
          </Button>
        </div>
      )}

      {/* search box */}
      <form onSubmit={submitSearch} className="relative z-20 w-full max-w-2xl flex flex-col items-center space-y-3">
        <div className="relative w-full">
          <Input
            ref={inputRef}
            value={trackingNumber}
            onChange={onChange}
            placeholder="Shipment number"
            className="w-full py-3 pl-4 pr-12 rounded-full bg-white/80 backdrop-blur text-lg"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full hover:bg-gray-200"
            aria-label="search"
          >
            <Search className="h-6 w-6 text-gray-700" />
          </Button>
        </div>

        {/* autocomplete */}
        {showSuggestions && (
          <div
            ref={suggestionBoxRef}
            className="absolute top-full mt-2 w-full max-w-2xl bg-white/90 backdrop-blur rounded-lg shadow-lg z-30"
          >
            {suggestions.map((s) => (
              <Button
                key={s.code}
                variant="ghost"
                className="w-full justify-start px-4 py-2 text-left text-gray-800 hover:bg-gray-100"
                onClick={() => chooseSuggestion(s)}
              >
                {s.name} ({s.code}) – {s.type.toUpperCase()}
              </Button>
            ))}
          </div>
        )}

        {/* detected display */}
        <div className="text-white text-sm">
          Detected: <span className="capitalize">{displayType}</span> {typeIcon}
          {carrierHint && <span className="ml-1 text-gray-300">({carrierHint})</span>}
        </div>
      </form>

      {/* recent chips */}
      {recent.length > 0 && (
        <div className="z-20 mt-6 flex flex-wrap gap-2 justify-center">
          {recent.map((v) => (
            <Button
              key={v}
              size="sm"
              variant="outline"
              className="bg-white/20 text-white hover:bg-white/30 border-white/30"
              onClick={() => chooseRecent(v)}
            >
              {v}
            </Button>
          ))}
        </div>
      )}

      {/* results */}
      {showResults && (
        <div className="z-20 mt-10 w-full max-w-4xl">
          <ShipmentTrackingResults
            trackingNumber={trackingNumber}
            bookingType={displayType}
            carrierHint={carrierHint}
          />
        </div>
      )}
    </div>
  )
}
