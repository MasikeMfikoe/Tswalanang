"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FileText, Package, Truck, CheckCircle, AlertCircle, Clock, Download } from "lucide-react"
import Image from "next/image"
import ProtectedRoute from "@/components/ProtectedRoute"

// Mock data for the shipment details
const mockShipmentData = {
  id: "TSW12345678",
  status: "In Transit",
  origin: "FOS SUR MER, FRANCE",
  destination: "DURBAN, SOUTH AFRICA",
  estimatedDelivery: "2023-05-15",
  customer: {
    name: "ABC Corporation",
    email: "contact@abccorp.com",
    phone: "+27 11 123 4567",
  },
  timeline: [
    {
      date: "2023-03-28T13:12:00",
      status: "Gate out Empty",
      location: "Fos sur Mer",
      sublocation: "Star Container FOS SUR MER",
      completed: true,
    },
    {
      date: "2023-03-31T15:57:00",
      status: "Gate in",
      location: "FOS SUR MER",
      sublocation: "SEAYARD 2XL",
      completed: true,
    },
    {
      date: "2023-04-06T11:58:00",
      status: "Vessel departure (EXPRESS ARGENTINA / 514S)",
      location: "FOS SUR MER",
      completed: true,
    },
    {
      date: "2023-04-06T11:58:00",
      status: "Load",
      location: "FOS SUR MER",
      completed: true,
    },
    {
      date: "2023-04-11T20:00:00",
      status: "Vessel arrival (EXPRESS ARGENTINA / 514S)",
      location: "ALGECIRAS",
      sublocation: "ALGECIRAS - ML TERMINAL",
      completed: true,
    },
    {
      date: "2023-04-17T18:00:00",
      status: "Vessel departure (SANTA ISABEL / 251S)",
      location: "ALGECIRAS",
      completed: true,
    },
    {
      date: "2023-05-03T06:00:00",
      status: "Vessel arrival (SANTA ISABEL / 251S)",
      location: "DURBAN",
      sublocation: "Pier1",
      completed: false,
    },
  ],
  documents: [
    { name: "Commercial Invoice", type: "PDF", url: "#" },
    { name: "Packing List", type: "PDF", url: "#" },
    { name: "Bill of Lading", type: "PDF", url: "#" },
  ],
  details: {
    containerNumber: "MSCU1234567",
    containerType: "40ft High Cube",
    weight: "24,000 kg",
    dimensions: "12.192 x 2.438 x 2.896 m",
    packages: 3,
    shipmentType: "Ocean Freight",
    portOfLoad: "Fos sur Mer Port",
    portOfDischarge: "Durban Port",
    specialInstructions: "Handle with care. Fragile items inside.",
  },
}

export default function ShipmentDetails() {
  const params = useParams()
  const [shipment, setShipment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch the shipment data from your API
    // For this demo, we'll use the mock data
    const fetchShipment = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setShipment({
          ...mockShipmentData,
          id: params.id as string,
        })
      } catch (error) {
        console.error("Error fetching shipment:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchShipment()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-black text-white p-4 shadow-md">
          <div className="container mx-auto flex items-center space-x-3">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo_Final_TswalanangLogistics-hxMkywQ9EbNzC0e28VrJzQXLgshfJq.png"
              alt="TSW SmartLog Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <h1 className="text-xl md:text-2xl font-bold">TSW SmartLog Shipment webtracker</h1>
          </div>
        </header>
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse text-lg">Loading shipment details...</div>
        </main>
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-black text-white p-4 shadow-md">
          <div className="container mx-auto flex items-center space-x-3">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo_Final_TswalanangLogistics-hxMkywQ9EbNzC0e28VrJzQXLgshfJq.png"
              alt="TSW SmartLog Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <h1 className="text-xl md:text-2xl font-bold">TSW SmartLog Shipment webtracker</h1>
          </div>
        </header>
        <main className="flex-grow flex items-center justify-center">
          <div className="text-red-500 flex items-center">
            <AlertCircle className="mr-2" />
            Shipment not found. Please check your tracking ID.
          </div>
        </main>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Order Received":
        return <Package className="h-5 w-5 text-blue-500" />
      case "Picked Up":
        return <Truck className="h-5 w-5 text-blue-500" />
      case "In Transit":
        return <Truck className="h-5 w-5 text-blue-500" />
      case "Customs Clearance":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "Out for Delivery":
        return <Truck className="h-5 w-5 text-blue-500" />
      case "Delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Order Received":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Order Received
          </Badge>
        )
      case "Picked Up":
        return (
          <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-300">
            Picked Up
          </Badge>
        )
      case "In Transit":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            In Transit
          </Badge>
        )
      case "Customs Clearance":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
            Customs Clearance
          </Badge>
        )
      case "Out for Delivery":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
            Out for Delivery
          </Badge>
        )
      case "Delivered":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            Delivered
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
            {status}
          </Badge>
        )
    }
  }

  return (
    <ProtectedRoute requiredPermission={{ module: "shipmentTracker", action: "view" }}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-black text-white p-4 shadow-md">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo_Final_TswalanangLogistics-hxMkywQ9EbNzC0e28VrJzQXLgshfJq.png"
                alt="TSW SmartLog Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <h1 className="text-xl md:text-2xl font-bold">TSW SmartLog Shipment webtracker</h1>
            </div>
            <Button
              variant="outline"
              className="bg-white text-black hover:bg-gray-100"
              onClick={() => (window.location.href = "/shipment-tracker")}
            >
              Track Another Shipment
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow container mx-auto p-4 md:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Shipment {shipment.id}</h2>
            <div className="flex items-center">
              <span className="mr-2">Current Status:</span>
              {getStatusBadge(shipment.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Shipment Summary */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Shipment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Container Number</h3>
                    <p>{shipment.details?.containerNumber || "MSCU1234567"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Container Type</h3>
                    <p>{shipment.details?.containerType || "40ft High Cube"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Container Weight</h3>
                    <p>{shipment.details?.weight || "24,000 kg"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Shipped From</h3>
                    <p>{shipment.origin || "Johannesburg, South Africa"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Port of Load</h3>
                    <p>{shipment.details?.portOfLoad || "Durban Port"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Port of Discharge</h3>
                    <p>{shipment.details?.portOfDischarge || "Cape Town Port"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Shipped To</h3>
                    <p>{shipment.destination || "Cape Town, South Africa"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Tabs */}
            <div className="md:col-span-2">
              <Tabs defaultValue="tracking">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tracking">Tracking</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                {/* Tracking Timeline */}

                <TabsContent value="tracking">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tracking Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">Estimated arrival date</span>
                          <span className="font-semibold">
                            {shipment?.timeline && Array.isArray(shipment.timeline) && shipment.timeline.length > 0 ? (
                              <>
                                {new Date(shipment.timeline[shipment.timeline.length - 1].date).toLocaleDateString()}{" "}
                                {new Date(shipment.timeline[shipment.timeline.length - 1].date).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </>
                            ) : (
                              "Unknown"
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-500">Last location</span>
                          <span className="font-semibold">
                            {shipment.status} • {shipment.origin}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mb-6">
                        Note: All times are given in local time, unless otherwise stated.
                      </div>

                      <div className="relative">
                        {/* Timeline events */}
                        <div className="space-y-0">
                          {shipment?.timeline && Array.isArray(shipment.timeline) && shipment.timeline.length > 0 ? (
                            shipment.timeline.map((event, index) => {
                              const isLast = index === shipment.timeline.length - 1
                              const isFirst = index === 0
                              const showDottedLine = index < shipment.timeline.length - 2
                              const showSolidLine = index < shipment.timeline.length - 1 && !showDottedLine

                              return (
                                <div key={index} className="relative">
                                  {/* Location label on the left */}
                                  <div className="grid grid-cols-[1fr,auto,1fr] items-start gap-4">
                                    <div className="text-right font-medium">
                                      {index % 2 === 0 ? (
                                        <div className="mb-8">
                                          <div className="font-semibold">{event.location || shipment.origin}</div>
                                          {event.sublocation && <div className="text-sm">{event.sublocation}</div>}
                                        </div>
                                      ) : (
                                        <div></div>
                                      )}
                                    </div>

                                    {/* Timeline icon and line */}
                                    <div className="flex flex-col items-center">
                                      <div
                                        className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${event.completed ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}
                                      >
                                        {event.status.toLowerCase().includes("vessel") ? (
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          >
                                            <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                                            <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76" />
                                            <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6" />
                                          </svg>
                                        ) : (
                                          getStatusIcon(event.status)
                                        )}
                                      </div>

                                      {/* Vertical line - solid or dotted based on position */}
                                      {showSolidLine && <div className="h-16 w-0.5 bg-blue-200"></div>}
                                      {showDottedLine && (
                                        <div className="h-16 w-0.5 border-r-2 border-dashed border-blue-200"></div>
                                      )}
                                    </div>

                                    {/* Event details on the right */}
                                    <div>
                                      {index % 2 !== 0 ? (
                                        <div className="mb-8">
                                          <div className="font-semibold">{event.location || shipment.destination}</div>
                                          {event.sublocation && <div className="text-sm">{event.sublocation}</div>}
                                        </div>
                                      ) : (
                                        <div></div>
                                      )}

                                      <div className="mb-8">
                                        <div className="font-medium">{event.status}</div>
                                        <div className="text-sm text-gray-500">
                                          {new Date(event.date).toLocaleDateString()}{" "}
                                          {new Date(event.date).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <div className="text-center text-gray-500 py-8">No timeline data available</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Documents */}
                <TabsContent value="documents">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipping Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {shipment.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-blue-500 mr-3" />
                              <span>{doc.name}</span>
                              <Badge variant="outline" className="ml-3">
                                {doc.type}
                              </Badge>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Details */}
                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipment Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium text-gray-500">Weight</h3>
                          <p>{shipment.details.weight}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-500">Dimensions</h3>
                          <p>{shipment.details.dimensions}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-500">Packages</h3>
                          <p>{shipment.details.packages}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-500">Shipment Type</h3>
                          <p>{shipment.details.shipmentType}</p>
                        </div>
                        <div className="md:col-span-2">
                          <h3 className="font-medium text-gray-500">Special Instructions</h3>
                          <p>{shipment.details.specialInstructions}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-500">Port of Load</h3>
                          <p>{shipment.details.portOfLoad}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-500">Port of Discharge</h3>
                          <p>{shipment.details.portOfDischarge}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 p-4 text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} TSW SmartLog. All rights reserved.</p>
        </footer>
      </div>
    </ProtectedRoute>
  )
}
