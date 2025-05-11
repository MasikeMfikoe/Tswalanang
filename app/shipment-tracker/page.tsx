"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function ShipmentTracker() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [bookingType, setBookingType] = useState("ocean")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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
          </Accordion>
        </div>
      </div>
    </ProtectedRoute>
  )
}
