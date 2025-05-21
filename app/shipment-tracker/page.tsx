"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { AlertCircle, ExternalLink } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Shipping line information with their tracking URLs and container number formats
const shippingLines = [
  {
    name: "Maersk",
    url: "https://www.maersk.com/tracking/",
    containerPrefix: ["MAEU", "MRKU", "MSKU"],
    blPrefix: ["MAEU"],
    color: "#0091da",
  },
  {
    name: "MSC",
    url: "https://www.msc.com/track-a-shipment",
    containerPrefix: ["MSCU", "MEDU"],
    blPrefix: ["MSCU", "MEDI"],
    color: "#1c3f94",
  },
  {
    name: "CMA CGM",
    url: "https://www.cma-cgm.com/ebusiness/tracking",
    containerPrefix: ["CMAU", "CXDU"],
    blPrefix: ["CMDU"],
    color: "#0c1c5b",
  },
  {
    name: "Hapag-Lloyd",
    url: "https://www.hapag-lloyd.com/en/online-business/tracing/tracing-by-booking.html",
    containerPrefix: ["HLXU", "HLCU"],
    blPrefix: ["HLCU"],
    color: "#d1001f",
  },
  {
    name: "ONE",
    url: "https://ecomm.one-line.com/ecom/CUP_HOM_3301.do",
    containerPrefix: ["ONEY", "ONEU"],
    blPrefix: ["ONEE"],
    color: "#ff0099",
  },
  {
    name: "Evergreen",
    url: "https://www.evergreen-line.com/static/jsp/cargo_tracking.jsp",
    containerPrefix: ["EVRU", "EGHU"],
    blPrefix: ["EGLV"],
    color: "#00a84f",
  },
  {
    name: "COSCO",
    url: "https://elines.coscoshipping.com/ebusiness/cargoTracking",
    containerPrefix: ["COSU", "CBHU"],
    blPrefix: ["COSU"],
    color: "#dd1e25",
  },
]

export default function ShipmentTracker() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [bookingType, setBookingType] = useState("ocean")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedLines, setSuggestedLines] = useState<Array<(typeof shippingLines)[0]>>([])
  const router = useRouter()

  // Detect shipping line based on container or B/L number
  useEffect(() => {
    if (trackingNumber.length >= 4) {
      const prefix = trackingNumber.substring(0, 4).toUpperCase()
      const matchedLines = shippingLines.filter((line) => {
        return line.containerPrefix.includes(prefix) || line.blPrefix.includes(prefix)
      })
      setSuggestedLines(matchedLines)
    } else {
      setSuggestedLines([])
    }
  }, [trackingNumber])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!trackingNumber) {
      setError("Please enter a tracking number")
      return
    }

    setIsLoading(true)

    try {
      // For demo purposes, we'll just check if the tracking number starts with TSW
      // In a real app, you would validate against your database
      if (trackingNumber.toUpperCase().startsWith("TSW")) {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        router.push(`/shipment-tracker/details/${trackingNumber}?type=${bookingType}`)
      } else {
        setError("Invalid tracking number. Please check and try again.")
      }
    } catch (err) {
      setError("An error occurred while tracking your shipment. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute requiredPermission={{ module: "shipmentTracker", action: "view" }}>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex flex-col items-center justify-center mb-8">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo_Final_TswalanangLogistics-hxMkywQ9EbNzC0e28VrJzQXLgshfJq.png"
              alt="Tswalanang Logistics Logo"
              width={120}
              height={120}
              className="mb-4"
            />
            <h1 className="text-3xl font-bold mb-4 text-center">Shipment & Container Tracking</h1>

            <p className="mb-6 text-center max-w-2xl">
              Select your booking type from <span className="font-semibold">Ocean Cargo, Air Cargo, LCL Cargo</span> and
              enter your tracking number to view full tracking details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mb-4">
            <div className="flex flex-col md:flex-row gap-4 mb-2">
              <div className="w-full md:w-1/3">
                <Select value={bookingType} onValueChange={setBookingType}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Select booking type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ocean">Ocean Cargo</SelectItem>
                    <SelectItem value="air">Air Cargo</SelectItem>
                    <SelectItem value="lcl">LCL Cargo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full md:w-1/2">
                <Input
                  placeholder="B/L or container number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="w-full md:w-auto">
                <Button type="submit" className="w-full md:w-auto bg-[#0a192f] hover:bg-[#172a46]" disabled={isLoading}>
                  {isLoading ? "Tracking..." : "Track"}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>

          {/* Shipping Line Suggestions */}
          {suggestedLines.length > 0 && (
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Suggested Shipping Lines</CardTitle>
                <CardDescription>
                  Based on your container/B/L number, you can also track directly with these shipping lines:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {suggestedLines.map((line) => (
                    <a
                      key={line.name}
                      href={line.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border rounded-md hover:bg-gray-50 transition-colors"
                      style={{ borderLeftColor: line.color, borderLeftWidth: "4px" }}
                    >
                      <div className="flex-1">
                        <div className="font-medium">{line.name}</div>
                        <div className="text-xs text-gray-500">Track on shipping line website</div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-sm text-gray-600 mb-6">
            <p>Container number is made of 4 letters and 7 digits.</p>
            <p>Bill of Lading number consists of 9 characters.</p>
          </div>

          <Accordion type="single" collapsible className="border-t">
            <AccordionItem value="item-1">
              <AccordionTrigger className="py-4">What is a shipment or container number?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  A container number is a unique identifier assigned to shipping containers. It typically consists of 4
                  letters (prefix) followed by 7 digits. The prefix usually represents the owner of the container.
                </p>
                <p className="text-gray-700 mt-2">
                  A Bill of Lading (B/L) number is a document issued by a carrier to acknowledge receipt of cargo for
                  shipment. It serves as a receipt of goods, evidence of the contract of carriage, and a document of
                  title. B/L numbers typically consist of 9 characters.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="py-4">
                What information will you get from shipment and container tracking?
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">
                  Tracking your shipment or container provides you with real-time information about:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                  <li>Current location of your cargo</li>
                  <li>Estimated time of arrival (ETA)</li>
                  <li>Status updates (e.g., in transit, customs clearance, delivered)</li>
                  <li>Departure and arrival dates</li>
                  <li>Any delays or exceptions</li>
                  <li>Documentation status</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="py-4">How to track with different shipping lines?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 mb-2">
                  Each shipping line has its own tracking system. You can identify the shipping line from the first 4
                  letters of your container number:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {shippingLines.map((line) => (
                    <div key={line.name} className="border rounded p-2">
                      <div className="font-medium">{line.name}</div>
                      <div className="text-sm text-gray-600">Prefixes: {line.containerPrefix.join(", ")}</div>
                      <a
                        href={line.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center mt-1"
                      >
                        Visit tracking page <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </ProtectedRoute>
  )
}
