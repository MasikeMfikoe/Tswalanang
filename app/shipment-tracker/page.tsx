"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, FileText, Download, Ship, Package } from "lucide-react"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LiveTrackingStatus } from "@/components/LiveTrackingStatus"

interface TrackingResult {
  shipmentNumber: string
  status: string
  containerNumber: string
  containerType: string
  weight: string
  origin: string
  destination: string
  pol: string
  pod: string
  estimatedArrival: string
  lastLocation: string
  timeline: Array<{
    location: string
    terminal?: string
    events: Array<{
      type: "event" | "vessel-departure" | "vessel-arrival" | "gate" | "load"
      status: string
      vessel?: string
      timestamp: string
      time: string
      date: string
    }>
  }>
  documents: Array<{
    name: string
    type: string
    url: string
    date: string
  }>
  details: {
    packages: string
    specialInstructions: string
    dimensions: string
    shipmentType: string
  }
}

export default function ShipmentTracker() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [bookingType, setBookingType] = useState("ocean")
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("tracking")
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null)
  const [trackingError, setTrackingError] = useState<{
    title: string
    message: string
    suggestion?: string
    carrierInfo?: {
      name: string
      trackingUrl: string
    }
  } | null>(null)

  // Mock tracking data
  const mockTrackingResult: TrackingResult = {
    shipmentNumber: "TSW1234566",
    status: "In Transit",
    containerNumber: "MSCU1234567",
    containerType: "40ft High Cube",
    weight: "24,000 kg",
    origin: "FOS SUR MER, FRANCE",
    destination: "DURBAN, SOUTH AFRICA",
    pol: "Fos sur Mer Port",
    pod: "Durban Port",
    estimatedArrival: "03/05/2023 06:00",
    lastLocation: "In Transit • FOS SUR MER, FRANCE",
    timeline: [
      {
        location: "Fos sur Mer",
        events: [
          {
            type: "gate",
            status: "Gate out Empty",
            timestamp: "28/03/2023 13:12",
            date: "28/03/2023",
            time: "13:12",
          },
        ],
      },
      {
        location: "FOS SUR MER",
        events: [
          {
            type: "event",
            status: "SEAYARD 2XL",
            timestamp: "31/03/2023 15:57",
            date: "31/03/2023",
            time: "15:57",
          },
          {
            type: "gate",
            status: "Gate in",
            timestamp: "31/03/2023 15:57",
            date: "31/03/2023",
            time: "15:57",
          },
        ],
      },
      {
        location: "FOS SUR MER",
        events: [
          {
            type: "load",
            status: "Load",
            timestamp: "06/04/2023 11:58",
            date: "06/04/2023",
            time: "11:58",
          },
          {
            type: "vessel-departure",
            status: "Vessel departure (EXPRESS ARGENTINA / 514S)",
            vessel: "EXPRESS ARGENTINA / 514S",
            timestamp: "06/04/2023 11:58",
            date: "06/04/2023",
            time: "11:58",
          },
        ],
      },
      {
        location: "ALGECIRAS",
        terminal: "ML TERMINAL",
        events: [
          {
            type: "vessel-arrival",
            status: "Vessel arrival (EXPRESS ARGENTINA / 514S)",
            vessel: "EXPRESS ARGENTINA / 514S",
            timestamp: "11/04/2023 20:00",
            date: "11/04/2023",
            time: "20:00",
          },
        ],
      },
      {
        location: "ALGECIRAS",
        events: [
          {
            type: "vessel-departure",
            status: "Vessel departure (SANTA ISABEL / 251S)",
            vessel: "SANTA ISABEL / 251S",
            timestamp: "17/04/2023 18:00",
            date: "17/04/2023",
            time: "18:00",
          },
        ],
      },
      {
        location: "DURBAN",
        terminal: "Pier1",
        events: [
          {
            type: "vessel-arrival",
            status: "Vessel arrival (SANTA ISABEL / 251S)",
            vessel: "SANTA ISABEL / 251S",
            timestamp: "03/05/2023 06:00",
            date: "03/05/2023",
            time: "06:00",
          },
        ],
      },
    ],
    documents: [
      { name: "Commercial Invoice", type: "PDF", url: "#", date: "28/03/2023" },
      { name: "Packing List", type: "PDF", url: "#", date: "28/03/2023" },
      { name: "Bill of Lading", type: "PDF", url: "#", date: "30/03/2023" },
      { name: "Certificate of Origin", type: "PDF", url: "#", date: "30/03/2023" },
    ],
    details: {
      packages: "3",
      specialInstructions: "Handle with care. Fragile items inside.",
      dimensions: "12.192 × 2.438 × 2.896 m",
      shipmentType: "Ocean Freight",
    },
  }

  // Add this function before the handleTrackSubmit function:
  const generateMockData = (cargoType: string, trackingNum: string): TrackingResult => {
    const baseShipment = trackingNum || "TSW1234566"

    if (cargoType === "air") {
      return {
        shipmentNumber: baseShipment,
        status: "In Transit",
        containerNumber: trackingNum,
        containerType: "Air Cargo",
        weight: "2,500 kg",
        origin: "JOHANNESBURG, SOUTH AFRICA",
        destination: "LONDON, UNITED KINGDOM",
        pol: "OR Tambo International Airport",
        pod: "Heathrow Airport",
        estimatedArrival: "05/05/2023 14:30",
        lastLocation: "In Transit • JOHANNESBURG, SOUTH AFRICA",
        timeline: [
          {
            location: "Johannesburg",
            events: [
              {
                type: "event",
                status: "Cargo accepted",
                timestamp: "03/05/2023 08:00",
                date: "03/05/2023",
                time: "08:00",
              },
              {
                type: "event",
                status: "Loaded on aircraft",
                vessel: "BA Flight 056",
                timestamp: "03/05/2023 22:15",
                date: "03/05/2023",
                time: "22:15",
              },
            ],
          },
          {
            location: "London Heathrow",
            events: [
              {
                type: "event",
                status: "Aircraft arrived",
                vessel: "BA Flight 056",
                timestamp: "04/05/2023 06:45",
                date: "04/05/2023",
                time: "06:45",
              },
              {
                type: "event",
                status: "Customs clearance",
                timestamp: "04/05/2023 10:30",
                date: "04/05/2023",
                time: "10:30",
              },
            ],
          },
        ],
        documents: [
          { name: "Air Waybill", type: "PDF", url: "#", date: "03/05/2023" },
          { name: "Commercial Invoice", type: "PDF", url: "#", date: "03/05/2023" },
          { name: "Packing List", type: "PDF", url: "#", date: "03/05/2023" },
        ],
        details: {
          packages: "5",
          specialInstructions: "Temperature controlled cargo. Keep refrigerated.",
          dimensions: "120 × 80 × 100 cm",
          shipmentType: "Air Freight Express",
        },
      }
    }

    if (cargoType === "lcl") {
      return {
        shipmentNumber: baseShipment,
        status: "In Transit",
        containerNumber: trackingNum,
        containerType: "LCL Consolidation",
        weight: "8,500 kg",
        origin: "CAPE TOWN, SOUTH AFRICA",
        destination: "HAMBURG, GERMANY",
        pol: "Cape Town Port",
        pod: "Hamburg Port",
        estimatedArrival: "15/05/2023 09:00",
        lastLocation: "In Transit • CAPE TOWN, SOUTH AFRICA",
        timeline: [
          {
            location: "Cape Town",
            events: [
              {
                type: "event",
                status: "LCL cargo received",
                timestamp: "28/04/2023 14:00",
                date: "28/04/2023",
                time: "14:00",
              },
              {
                type: "event",
                status: "Consolidated in container",
                timestamp: "30/04/2023 10:30",
                date: "30/04/2023",
                time: "10:30",
              },
              {
                type: "load",
                status: "Container loaded",
                vessel: "MSC SINFONIA",
                timestamp: "02/05/2023 16:45",
                date: "02/05/2023",
                time: "16:45",
              },
            ],
          },
          {
            location: "Hamburg",
            events: [
              {
                type: "vessel-arrival",
                status: "Vessel arrival expected",
                vessel: "MSC SINFONIA",
                timestamp: "15/05/2023 09:00",
                date: "15/05/2023",
                time: "09:00",
              },
            ],
          },
        ],
        documents: [
          { name: "House Bill of Lading", type: "PDF", url: "#", date: "30/04/2023" },
          { name: "Master Bill of Lading", type: "PDF", url: "#", date: "02/05/2023" },
          { name: "Commercial Invoice", type: "PDF", url: "#", date: "28/04/2023" },
          { name: "Packing List", type: "PDF", url: "#", date: "28/04/2023" },
        ],
        details: {
          packages: "12",
          specialInstructions: "LCL shipment. Handle with care during deconsolidation.",
          dimensions: "Various sizes - consolidated cargo",
          shipmentType: "LCL Ocean Freight",
        },
      }
    }

    // Default ocean cargo (existing data)
    return {
      shipmentNumber: baseShipment,
      status: "In Transit",
      containerNumber: "MSCU1234567",
      containerType: "40ft High Cube",
      weight: "24,000 kg",
      origin: "FOS SUR MER, FRANCE",
      destination: "DURBAN, SOUTH AFRICA",
      pol: "Fos sur Mer Port",
      pod: "Durban Port",
      estimatedArrival: "03/05/2023 06:00",
      lastLocation: "In Transit • FOS SUR MER, FRANCE",
      timeline: [
        {
          location: "Fos sur Mer",
          events: [
            {
              type: "gate",
              status: "Gate out Empty",
              timestamp: "28/03/2023 13:12",
              date: "28/03/2023",
              time: "13:12",
            },
          ],
        },
        {
          location: "FOS SUR MER",
          events: [
            {
              type: "event",
              status: "SEAYARD 2XL",
              timestamp: "31/03/2023 15:57",
              date: "31/03/2023",
              time: "15:57",
            },
            {
              type: "gate",
              status: "Gate in",
              timestamp: "31/03/2023 15:57",
              date: "31/03/2023",
              time: "15:57",
            },
          ],
        },
        {
          location: "FOS SUR MER",
          events: [
            {
              type: "load",
              status: "Load",
              timestamp: "06/04/2023 11:58",
              date: "06/04/2023",
              time: "11:58",
            },
            {
              type: "vessel-departure",
              status: "Vessel departure (EXPRESS ARGENTINA / 514S)",
              vessel: "EXPRESS ARGENTINA / 514S",
              timestamp: "06/04/2023 11:58",
              date: "06/04/2023",
              time: "11:58",
            },
          ],
        },
        {
          location: "ALGECIRAS",
          terminal: "ML TERMINAL",
          events: [
            {
              type: "vessel-arrival",
              status: "Vessel arrival (EXPRESS ARGENTINA / 514S)",
              vessel: "EXPRESS ARGENTINA / 514S",
              timestamp: "11/04/2023 20:00",
              date: "11/04/2023",
              time: "20:00",
            },
          ],
        },
        {
          location: "ALGECIRAS",
          events: [
            {
              type: "vessel-departure",
              status: "Vessel departure (SANTA ISABEL / 251S)",
              vessel: "SANTA ISABEL / 251S",
              timestamp: "17/04/2023 18:00",
              date: "17/04/2023",
              time: "18:00",
            },
          ],
        },
        {
          location: "DURBAN",
          terminal: "Pier1",
          events: [
            {
              type: "vessel-arrival",
              status: "Vessel arrival (SANTA ISABEL / 251S)",
              vessel: "SANTA ISABEL / 251S",
              timestamp: "03/05/2023 06:00",
              date: "03/05/2023",
              time: "06:00",
            },
          ],
        },
      ],
      documents: [
        { name: "Commercial Invoice", type: "PDF", url: "#", date: "28/03/2023" },
        { name: "Packing List", type: "PDF", url: "#", date: "28/03/2023" },
        { name: "Bill of Lading", type: "PDF", url: "#", date: "30/03/2023" },
        { name: "Certificate of Origin", type: "PDF", url: "#", date: "30/03/2023" },
      ],
      details: {
        packages: "3",
        specialInstructions: "Handle with care. Fragile items inside.",
        dimensions: "12.192 × 2.438 × 2.896 m",
        shipmentType: "Ocean Freight",
      },
    }
  }

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingNumber.trim()) return

    setIsLoading(true)

    try {
      // Call the live tracking API
      const response = await fetch("/api/tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trackingNumber: trackingNumber.trim(),
          bookingType,
        }),
      })

      if (response.ok) {
        const result = await response.json()

        if (result.success && result.data && result.isLiveData) {
          // Use live data from API
          console.log("Using live tracking data from:", result.source)
          setTrackingResult(result.data)
          setShowResults(true)
        } else if (result.carrierInfo) {
          // Automatically redirect to carrier website
          console.log(`Redirecting to ${result.carrierInfo.name} website`)
          window.open(result.carrierInfo.trackingUrl, "_blank")

          // Show a user-friendly message instead of alert
          setTrackingError({
            title: `${result.carrierInfo.name} Tracking`,
            message: `We've opened ${result.carrierInfo.name}'s official tracking page in a new tab. You can track container ${trackingNumber.trim()} directly on their website.`,
            carrierInfo: result.carrierInfo,
          })
        } else {
          // Show error in UI instead of alert
          setTrackingError({
            title: "Tracking Not Available",
            message: result.error || "Unable to get live tracking data for this container number.",
            suggestion: "Please verify the tracking number format or contact your shipping provider.",
          })
        }
      } else {
        // API error - show in UI
        setTrackingError({
          title: "Service Unavailable",
          message: "Tracking service is currently unavailable. Please try again later or contact support.",
          suggestion: "You can also try tracking directly on the shipping line's website.",
        })
      }
    } catch (error) {
      // Network error - show in UI
      console.error("Network error:", error)
      setTrackingError({
        title: "Connection Error",
        message: "Unable to connect to tracking service. Please check your internet connection and try again.",
        suggestion: "If the problem persists, try tracking directly on the shipping line's website.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToSearch = () => {
    setShowResults(false)
    setTrackingNumber("")
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "vessel-departure":
      case "vessel-arrival":
        return <Ship className="h-4 w-4 text-blue-500" />
      case "gate":
      case "load":
      case "event":
      default:
        return <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-white" />
    }
  }

  if (showResults) {
    return (
      <ProtectedRoute requiredPermission={{ module: "shipmentTracker", action: "view" }}>
        <div className="min-h-screen bg-gray-50 py-8">
          {/* Black Header Bar */}
          <div className="bg-black text-white py-3 px-4 mb-6">
            <div className="container mx-auto max-w-7xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                  <Package className="h-4 w-4 text-black" />
                </div>
                <span className="text-lg font-medium">TSW SmartLog Shipment webtracker</span>
              </div>
              <Button
                variant="secondary"
                onClick={handleBackToSearch}
                className="bg-white text-black hover:bg-gray-100"
              >
                Track Another Shipment
              </Button>
            </div>
          </div>

          {/* Shipment Header */}
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Shipment {trackingResult?.shipmentNumber}</h1>
              <div className="flex items-center mt-2">
                <div className="text-sm">Current Status:</div>
                <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                  {trackingResult?.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Summary Section - Left Side */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Shipment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Container Number</p>
                      <p>{trackingResult?.containerNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Container Type</p>
                      <p>{trackingResult?.containerType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Container Weight</p>
                      <p>{trackingResult?.weight}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Shipped From</p>
                      <p>{trackingResult?.origin}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Port of Load</p>
                      <p>{trackingResult?.pol}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Port of Discharge</p>
                      <p>{trackingResult?.pod}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Shipped To</p>
                      <p>{trackingResult?.destination}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content - Right Side */}
              <div className="lg:col-span-3">
                <Tabs defaultValue="tracking" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="tracking">Tracking</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>

                  {/* Tracking Tab */}
                  <TabsContent value="tracking" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-xl font-bold mb-4">Tracking Timeline</h3>

                        <div className="flex justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Estimated arrival date</p>
                            <p className="font-bold">{trackingResult?.estimatedArrival}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Last location</p>
                            <p className="font-bold">{trackingResult?.lastLocation}</p>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 mb-6">
                          Note: All times are given in local time, unless otherwise stated.
                        </p>

                        <div className="relative">
                          {/* Vertical timeline line */}
                          <div className="absolute left-[7.5px] top-0 bottom-0 w-0.5 bg-blue-100"></div>

                          {/* Timeline events */}
                          <div className="space-y-12">
                            {trackingResult?.timeline.map((locationGroup, groupIndex) => (
                              <div key={groupIndex} className="relative">
                                {/* Location header on the right side */}
                                <div className="flex justify-end mb-2">
                                  <div className="font-bold">
                                    {locationGroup.location}
                                    {locationGroup.terminal && (
                                      <div className="text-sm font-normal text-gray-600">{locationGroup.terminal}</div>
                                    )}
                                  </div>
                                </div>

                                {/* Events for this location */}
                                <div className="space-y-6">
                                  {locationGroup.events.map((event, eventIndex) => (
                                    <div key={eventIndex} className="flex">
                                      {/* Icon */}
                                      <div className="mr-4 mt-1">{getEventIcon(event.type)}</div>

                                      {/* Event details */}
                                      <div className="flex-1">
                                        <div className="flex justify-between">
                                          <div className="font-medium">{event.status}</div>
                                          <div className="text-sm text-gray-600">
                                            {event.date} {event.time}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-xl font-bold mb-4">Shipping Documents</h3>
                        <div className="space-y-3">
                          {trackingResult?.documents.map((doc, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-red-500" />
                                <div>
                                  <p className="font-medium">{doc.name}</p>
                                  <p className="text-xs text-gray-500">Added on {doc.date}</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </a>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Details Tab */}
                  <TabsContent value="details" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-xl font-bold mb-4">Shipment Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Weight</p>
                            <p className="font-medium">{trackingResult?.weight}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Packages</p>
                            <p className="font-medium">{trackingResult?.details.packages}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">Special Instructions</p>
                            <p className="font-medium">{trackingResult?.details.specialInstructions}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Dimensions</p>
                            <p className="font-medium">{trackingResult?.details.dimensions}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Shipment Type</p>
                            <p className="font-medium">{trackingResult?.details.shipmentType}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Landing Page
  return (
    <ProtectedRoute requiredPermission={{ module: "shipmentTracker", action: "view" }}>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Shipment & Container Tracking</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Select your booking type from Ocean Cargo, Air Cargo, LCL Cargo and enter your tracking number to view
              full tracking details.
            </p>
          </div>

          {/* Booking Type Tabs */}
          <div className="mb-8">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  bookingType === "ocean"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setBookingType("ocean")}
              >
                Ocean Cargo
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  bookingType === "air"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setBookingType("air")}
              >
                Air Cargo
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  bookingType === "lcl"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setBookingType("lcl")}
              >
                LCL Cargo
              </button>
            </div>
          </div>

          {/* Ocean Cargo Section */}
          {bookingType === "ocean" && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <form onSubmit={handleTrackSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="trackingNumber" className="text-base font-medium">
                      B/L or container number
                    </Label>
                    <Input
                      id="trackingNumber"
                      type="text"
                      placeholder="Enter your B/L or container number"
                      value={trackingNumber}
                      onChange={(e) => {
                        setTrackingNumber(e.target.value)
                        if (trackingError) setTrackingError(null) // Clear error when user types
                      }}
                      className="mt-2 h-12 text-base"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || !trackingNumber.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Search className="mr-2 h-5 w-5 animate-spin" />
                        Tracking...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Track
                      </>
                    )}
                  </Button>

                  <div className="text-sm text-gray-600 space-y-1 mt-4">
                    <p>• Container number is made of 4 letters and 7 digits.</p>
                    <p>• Bill of Lading number consists of 9 characters.</p>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Air Cargo Section */}
          {bookingType === "air" && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <form onSubmit={handleTrackSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="trackingNumber" className="text-base font-medium">
                      Air Waybill Number
                    </Label>
                    <Input
                      id="trackingNumber"
                      type="text"
                      placeholder="Enter your Air Waybill number"
                      value={trackingNumber}
                      onChange={(e) => {
                        setTrackingNumber(e.target.value)
                        if (trackingError) setTrackingError(null) // Clear error when user types
                      }}
                      className="mt-2 h-12 text-base"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || !trackingNumber.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Search className="mr-2 h-5 w-5 animate-spin" />
                        Tracking...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Track
                      </>
                    )}
                  </Button>

                  <div className="text-sm text-gray-600 space-y-1 mt-4">
                    <p>• Air Waybill number is typically 11 digits (3-digit airline code + 8 digits).</p>
                    <p>• Example: 020-12345678 or 02012345678</p>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* LCL Cargo Section */}
          {bookingType === "lcl" && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <form onSubmit={handleTrackSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="trackingNumber" className="text-base font-medium">
                      Container Number or Bill of Lading
                    </Label>
                    <Input
                      id="trackingNumber"
                      type="text"
                      placeholder="Enter your container number or B/L number"
                      value={trackingNumber}
                      onChange={(e) => {
                        setTrackingNumber(e.target.value)
                        if (trackingError) setTrackingError(null) // Clear error when user types
                      }}
                      className="mt-2 h-12 text-base"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading || !trackingNumber.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Search className="mr-2 h-5 w-5 animate-spin" />
                        Tracking...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Track
                      </>
                    )}
                  </Button>

                  <div className="text-sm text-gray-600 space-y-1 mt-4">
                    <p>• Container number: 4 letters and 7 digits (e.g., MSCU1234567)</p>
                    <p>• Bill of Lading: Usually 9-12 characters</p>
                    <p>• LCL shipments share container space with other cargo</p>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Error Display */}
          {trackingError && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-600 text-sm font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">{trackingError.title}</h3>
                    <p className="text-red-800 mb-3">{trackingError.message}</p>
                    {trackingError.suggestion && (
                      <p className="text-red-700 text-sm mb-3">{trackingError.suggestion}</p>
                    )}
                    {trackingError.carrierInfo && (
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(trackingError.carrierInfo!.trackingUrl, "_blank")}
                          className="border-red-300 text-red-700 hover:bg-red-100"
                        >
                          Open {trackingError.carrierInfo.name} Website
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTrackingError(null)}
                          className="text-red-600 hover:bg-red-100"
                        >
                          Try Another Number
                        </Button>
                      </div>
                    )}
                    {!trackingError.carrierInfo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTrackingError(null)}
                        className="text-red-600 hover:bg-red-100"
                      >
                        Try Again
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Tracking Status */}
          <div className="mb-8">
            <LiveTrackingStatus />
          </div>

          {/* TrackShip Integration Status */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium">Enhanced with TrackShip</span>
              <span className="text-gray-600">• 1000+ carriers worldwide</span>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">What is a shipment or container number?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-gray-700">
                    <p>
                      A <strong>container number</strong> is a unique identifier assigned to shipping containers. It
                      consists of 4 letters (owner code) followed by 7 digits. For example: MSCU1234567.
                    </p>
                    <p>
                      A <strong>Bill of Lading (B/L) number</strong> is a document number that serves as a receipt for
                      cargo and a contract for transportation. It typically consists of 9-12 characters.
                    </p>
                    <p>Both numbers can be used to track your shipment's progress from origin to destination.</p>
                  </div>
                  <p className="mt-3 text-sm text-blue-600">
                    <strong>Enhanced Coverage:</strong> Our system now includes TrackShip integration, providing access
                    to 1000+ carriers worldwide for comprehensive tracking coverage.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  What information will you get from shipment and container tracking?
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-gray-700">
                    <p>Our tracking system provides comprehensive information including:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Real-time location and status of your shipment</li>
                      <li>Estimated arrival dates and times</li>
                      <li>Detailed timeline of movement events</li>
                      <li>Vessel information and voyage details</li>
                      <li>Port of loading and discharge information</li>
                      <li>Container specifications and cargo details</li>
                      <li>Shipping documents (when available)</li>
                      <li>Special handling instructions</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">How to track with different cargo types?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-gray-700">
                    <div>
                      <p>
                        <strong>Ocean Cargo:</strong>
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Use container numbers (e.g., MSCU1234567) or Bill of Lading numbers</li>
                        <li>Supports major shipping lines: Maersk, MSC, CMA CGM, Hapag-Lloyd, etc.</li>
                      </ul>
                    </div>
                    <div>
                      <p>
                        <strong>Air Cargo:</strong>
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Use Air Waybill numbers (11 digits: 3-digit airline code + 8 digits)</li>
                        <li>Example: 020-12345678 or 02012345678</li>
                        <li>Supports major airlines and air freight forwarders</li>
                      </ul>
                    </div>
                    <div>
                      <p>
                        <strong>LCL Cargo:</strong>
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Use container numbers or House Bill of Lading numbers</li>
                        <li>LCL (Less than Container Load) shipments share container space</li>
                        <li>Tracking shows both consolidation and ocean transport phases</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
