"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Ship, Package, MapPin, Clock } from "lucide-react"

type TrackingEvent = {
  id?: string | number
  status?: string
  timestamp?: string
  location?: string
  notes?: string
}

type CargoSummary = {
  id?: string
  waybill_no?: string
  po_number?: string
  status?: string
  cargo_status?: string
  origin?: string
  origin_port?: string
  from_location?: string
  destination?: string
  destination_port?: string
  to_location?: string
  estimated_delivery?: string
  actual_delivery?: string
  created_at?: string
  updated_at?: string
}

export default function CargoStatusClient({ id }: { id: string }) {
  const router = useRouter()
  const [summary, setSummary] = useState<CargoSummary | null>(null)
  const [events, setEvents] = useState<TrackingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError(null)

        // Adjust this path if your API route differs
        const res = await fetch(`/api/customer-summary/cargo-status/${id}`)
        const json = await res.json()

        if (!res.ok) {
          throw new Error(json?.error || "Failed to fetch cargo status")
        }

        // Try to be resilient to different payload shapes
        const inferredSummary: CargoSummary =
          json?.data?.order ??
          json?.data?.cargoStatus ??
          json?.order ??
          json?.cargoStatus ??
          json?.data ??
          null

        const inferredEvents: TrackingEvent[] =
          json?.data?.trackingEvents ??
          json?.trackingEvents ??
          json?.events ??
          []

        setSummary(inferredSummary)
        setEvents(Array.isArray(inferredEvents) ? inferredEvents : [])
      } catch (e: any) {
        setError(e?.message || "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (id) run()
  }, [id])

  const twStatus = (s?: string) => {
    const k = (s || "").toLowerCase()
    if (k.includes("deliver")) return "bg-green-100 text-green-800"
    if (k.includes("in-transit") || k.includes("in transit")) return "bg-blue-100 text-blue-800"
    if (k.includes("pending")) return "bg-yellow-100 text-yellow-800"
    if (k.includes("cancel")) return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  const fmt = (d?: string) => {
    if (!d) return "N/A"
    const t = new Date(d)
    return isNaN(+t)
      ? d
      : t.toLocaleString("en-ZA", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
  }

  const pick = (...vals: (string | undefined)[]) => vals.find(Boolean) || "N/A"

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex items-center gap-3 text-gray-600">
            <Package className="h-5 w-5 animate-spin" />
            <span>Loading cargo status…</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Unable to load cargo status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error || "No data returned for this shipment."}</p>
            <div className="flex gap-3">
              <Button onClick={() => router.back()} variant="outline">
                Go Back
              </Button>
              <Button onClick={() => router.push("/dashboard")}>Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Ship className="h-6 w-6 text-blue-600" />
          Cargo Status: {pick(summary.waybill_no, summary.po_number, summary.id)}
        </h1>
        <div className="flex gap-2">
          <Badge className={twStatus(summary.cargo_status || summary.status)}>
            {summary.cargo_status || summary.status || "Unknown"}
          </Badge>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipment</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 text-gray-700">
                <div>
                  <p className="font-medium">Waybill / PO</p>
                  <p>{pick(summary.waybill_no, summary.po_number)}</p>
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <Badge className={twStatus(summary.cargo_status || summary.status)}>
                    {summary.cargo_status || summary.status || "Unknown"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <div className="grid">
                    <span className="font-medium">Origin</span>
                    <span className="text-gray-700">
                      {pick(summary.origin_port, summary.origin, summary.from_location)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <div className="grid">
                    <span className="font-medium">Destination</span>
                    <span className="text-gray-700">
                      {pick(summary.destination_port, summary.destination, summary.to_location)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dates</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 text-gray-700">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <div className="grid">
                    <span className="font-medium">Estimated Delivery</span>
                    <span>{fmt(summary.estimated_delivery)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <div className="grid">
                    <span className="font-medium">Actual Delivery</span>
                    <span>{fmt(summary.actual_delivery)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <div className="grid">
                    <span className="font-medium">Created</span>
                    <span>{fmt(summary.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <div className="grid">
                    <span className="font-medium">Last Updated</span>
                    <span>{fmt(summary.updated_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Tracking Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tracking events found for this shipment.</p>
              ) : (
                <div className="space-y-4">
                  {events.map((ev, idx) => (
                    <div
                      key={ev.id ?? idx}
                      className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div className="mt-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-gray-900">{ev.status || "Event"}</p>
                            {ev.location ? (
                              <p className="text-sm text-gray-600">{ev.location}</p>
                            ) : null}
                            {ev.notes ? <p className="text-sm text-gray-700 mt-1">{ev.notes}</p> : null}
                          </div>
                          <div className="text-right text-sm text-gray-500">{fmt(ev.timestamp)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
