"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"
import { ArrowRight, CalendarDays, Clock, MapPin, Package, Ship, Plane, CheckCircle } from "lucide-react"

export default function ShipmentDetailsPage() {
  const { id } = useParams()
  const trackingNumber = Array.isArray(id) ? id[0] : id

  // Mock data for a single shipment
  const shipment = {
    trackingNumber: trackingNumber || "TRK123456789",
    status: "In Transit",
    origin: "Shanghai, China",
    destination: "Rotterdam, Netherlands",
    carrier: "Maersk",
    eta: "2024-07-28",
    lastUpdate: "2024-07-21 14:30 UTC",
    type: "ocean",
    containerNumber: "MSKU1234567",
    weight: "15,000 kg",
    volume: "30 CBM",
    pieces: "50 cartons",
    timeline: [
      {
        location: "Shanghai Port",
        events: [
          {
            status: "Container Loaded",
            timestamp: "2024-07-15T10:00:00Z",
            description: "Container loaded onto vessel.",
            type: "load",
            date: "2024-07-15",
            time: "10:00",
            vessel: "Maersk Triple E",
            voyage: "V123",
            mode: "ocean",
            originalPlan: "2024-07-15",
            currentPlan: "2024-07-15",
          },
          {
            status: "Departed Origin Port",
            timestamp: "2024-07-16T08:00:00Z",
            description: "Vessel departed from Shanghai.",
            type: "vessel-departure",
            date: "2024-07-16",
            time: "08:00",
            vessel: "Maersk Triple E",
            voyage: "V123",
            mode: "ocean",
            originalPlan: "2024-07-16",
            currentPlan: "2024-07-16",
          },
        ],
      },
      {
        location: "Suez Canal",
        events: [
          {
            status: "Transiting Suez Canal",
            timestamp: "2024-07-22T05:00:00Z",
            description: "Vessel entered Suez Canal.",
            type: "event",
            date: "2024-07-22",
            time: "05:00",
            vessel: "Maersk Triple E",
            voyage: "V123",
            mode: "ocean",
            originalPlan: "2024-07-22",
            currentPlan: "2024-07-22",
          },
        ],
      },
      {
        location: "Rotterdam Port",
        events: [
          {
            status: "Estimated Arrival",
            timestamp: "2024-07-28T12:00:00Z",
            description: "Estimated time of arrival at destination port.",
            type: "vessel-arrival",
            date: "2024-07-28",
            time: "12:00",
            vessel: "Maersk Triple E",
            voyage: "V123",
            mode: "ocean",
            originalPlan: "2024-07-28",
            currentPlan: "2024-07-28",
          },
        ],
      },
    ],
  }

  const isMilestoneAchieved = (eventTimestamp: string, shipmentStatus: string) => {
    const eventDate = new Date(eventTimestamp)
    const now = new Date()

    // If the shipment is already delivered/completed, all milestones are considered achieved.
    if (shipmentStatus.toLowerCase() === "delivered" || shipmentStatus.toLowerCase() === "completed") {
      return true
    }

    // Otherwise, check if the event date is in the past
    return eventDate.getTime() <= now.getTime()
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950 p-6">
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-between mb-6 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Shipment Details: {shipment.trackingNumber}
        </h1>
        <Button>View All Shipments</Button>
      </header>
      <main className="flex-1 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Shipment Overview</CardTitle>
            <CardDescription>Key details and current status of the shipment.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  shipment.status === "Delivered"
                    ? "success"
                    : shipment.status === "In Transit"
                      ? "secondary"
                      : "outline"
                }
              >
                {shipment.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <span>
                {shipment.origin} <ArrowRight className="inline-block h-4 w-4" /> {shipment.destination}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {shipment.type === "ocean" ? (
                <Ship className="h-5 w-5 text-gray-500" />
              ) : (
                <Plane className="h-5 w-5 text-gray-500" />
              )}
              <span>Carrier: {shipment.carrier}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-gray-500" />
              <span>ETA: {shipment.eta}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span>Last Update: {shipment.lastUpdate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-500" />
              <span>Container: {shipment.containerNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Weight: {shipment.weight}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Volume: {shipment.volume}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Pieces: {shipment.pieces}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Associated documents for this shipment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Bill of Lading</span>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span>Commercial Invoice</span>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span>Packing List</span>
              <Button variant="outline" size="sm">
                View
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Shipment Timeline</CardTitle>
            <CardDescription>Detailed history of all tracking events.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pl-8">
              {shipment.timeline.map((locationEntry, locIndex) => (
                <div key={locIndex} className="mb-8 last:mb-0">
                  <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-white dark:bg-gray-950 z-10 py-1">
                    <MapPin className="inline-block h-5 w-5 mr-2 text-gray-500" />
                    {locationEntry.location}
                  </h3>
                  {locationEntry.events.map((event, eventIndex) => (
                    <div key={eventIndex} className="flex items-start gap-4 py-2 relative">
                      <div className="absolute left-0 top-0 h-full w-px bg-gray-300 dark:bg-gray-700" />
                      <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-gray-950 ring-8 ring-gray-100 dark:ring-gray-950">
                        {isMilestoneAchieved(event.timestamp, shipment.status) ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                        <div className="font-medium col-span-full">{event.status}</div>
                        <div className="text-sm text-gray-500">
                          <CalendarDays className="inline-block h-4 w-4 mr-1" />
                          {event.date} <Clock className="inline-block h-4 w-4 mr-1" />
                          {event.time}
                        </div>
                        {event.description && (
                          <div className="text-sm text-gray-600 col-span-full">{event.description}</div>
                        )}
                        {event.vessel && <div className="text-sm text-gray-500">Vessel: {event.vessel}</div>}
                        {event.voyage && <div className="text-sm text-gray-500">Voyage: {event.voyage}</div>}
                        {event.mode && <div className="text-sm text-gray-500">Mode: {event.mode}</div>}
                        {event.originalPlan && (
                          <div className="text-sm text-gray-500">Original Plan: {event.originalPlan}</div>
                        )}
                        {event.currentPlan && (
                          <div className="text-sm text-gray-500">Current Plan: {event.currentPlan}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
