"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"

export default function CourierOrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [trackingEvents, setTrackingEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolved = await params
        setResolvedParams(resolved)
      } catch (error) {
        console.error("Error resolving params:", error)
        setError("Failed to load page parameters")
      }
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchCourierOrderDetails()
    }
  }, [resolvedParams?.id])

  const fetchCourierOrderDetails = async () => {
    if (!resolvedParams?.id) return

    try {
      setLoading(true)
      setError(null)

      console.log("Fetching courier order with ID:", resolvedParams.id)

      // Fetch the main courier order
      const { data: orderData, error: orderError } = await supabase
        .from("courier_orders")
        .select("*")
        .eq("id", resolvedParams.id)
        .single()

      if (orderError) {
        console.error("Error fetching courier order:", orderError)
        if (orderError.code === "PGRST116") {
          setError("Courier order not found")
        } else {
          setError(`Error fetching order: ${orderError.message}`)
        }
        return
      }

      console.log("Fetched order data:", orderData)
      setOrder(orderData)

      // Fetch courier order items
      const { data: itemsData, error: itemsError } = await supabase
        .from("courier_order_items")
        .select("*")
        .eq("courier_order_id", resolvedParams.id)
        .order("created_at", { ascending: true })

      if (itemsError) {
        console.error("Error fetching courier order items:", itemsError)
      } else {
        console.log("Fetched items data:", itemsData)
        setItems(itemsData || [])
      }

      // Fetch tracking events
      const { data: trackingData, error: trackingError } = await supabase
        .from("tracking_events")
        .select("*")
        .eq("courier_order_id", resolvedParams.id)
        .order("timestamp", { ascending: false })

      if (trackingError) {
        console.error("Error fetching tracking events:", trackingError)
      } else {
        console.log("Fetched tracking data:", trackingData)
        setTrackingEvents(trackingData || [])
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "in-transit":
      case "in transit":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-ZA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  const formatContactDetails = (contactDetails: any) => {
    if (!contactDetails) return {}

    try {
      return typeof contactDetails === "string" ? JSON.parse(contactDetails) : contactDetails
    } catch {
      return {}
    }
  }

  if (!resolvedParams) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courier order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{error || "Courier Order Not Found"}</h2>
            <p className="text-gray-600 mb-6">
              The courier order you're looking for doesn't exist or has been removed.
            </p>
            <div className="space-x-4">
              <Button onClick={() => router.push("/courier-orders")}>Back to Courier Orders</Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const contactDetails = formatContactDetails(order.contact_details)

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Courier Order Details: {order.waybill_no || "N/A"}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push("/courier-orders")}>
            Back to Orders
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Dashboard
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Order Details</TabsTrigger>
          <TabsTrigger value="items">Package Items</TabsTrigger>
          <TabsTrigger value="tracking">Tracking History</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold text-gray-700">Waybill Number:</p>
                    <p className="text-gray-900">{order.waybill_no || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">PO Number:</p>
                    <p className="text-gray-900">{order.po_number || "N/A"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Status:</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
                    >
                      {order.status || "Unknown"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Service Type:</p>
                    <p className="text-gray-900">{order.service_type || "Standard"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Order Date:</p>
                    <p className="text-gray-900">
                      {order.order_date ? formatDate(order.order_date) : formatDate(order.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Created:</p>
                    <p className="text-gray-900">{formatDate(order.created_at)}</p>
                  </div>
                </div>

                {order.special_instructions && (
                  <div>
                    <p className="font-semibold text-gray-700">Special Instructions:</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{order.special_instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sender & Receiver</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-700">From:</p>
                  <p className="text-gray-900">{order.sender || "N/A"}</p>
                  <p className="text-sm text-gray-600">{order.from_location || "N/A"}</p>
                  {contactDetails.sender?.email && (
                    <p className="text-sm text-blue-600">{contactDetails.sender.email}</p>
                  )}
                </div>

                <div>
                  <p className="font-semibold text-gray-700">To:</p>
                  <p className="text-gray-900">{order.receiver || "N/A"}</p>
                  <p className="text-sm text-gray-600">{order.to_location || "N/A"}</p>
                  {order.recipient_email && <p className="text-sm text-blue-600">{order.recipient_email}</p>}
                </div>

                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-700 mb-2">Notification Settings:</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${order.enable_electronic_delivery_receipt ? "bg-green-500" : "bg-gray-300"}`}
                      ></span>
                      Electronic Delivery Receipt: {order.enable_electronic_delivery_receipt ? "Enabled" : "Disabled"}
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${order.notify_recipient ? "bg-green-500" : "bg-gray-300"}`}
                      ></span>
                      Notify Recipient: {order.notify_recipient ? "Yes" : "No"}
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${order.send_confirmation_to_admin ? "bg-green-500" : "bg-gray-300"}`}
                      ></span>
                      Admin Confirmation: {order.send_confirmation_to_admin ? "Yes" : "No"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Package Items ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No package items found for this order</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-3 text-left">Description</th>
                        <th className="border p-3 text-left">Dimensions</th>
                        <th className="border p-3 text-left">Volume (kg)</th>
                        <th className="border p-3 text-left">Mass (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={item.id || index} className="hover:bg-gray-50">
                          <td className="border p-3">{item.description || "N/A"}</td>
                          <td className="border p-3">{item.dimensions || "N/A"}</td>
                          <td className="border p-3">{item.vol_kgs || "0"}</td>
                          <td className="border p-3">{item.mass_kgs || "0"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking">
          <Card>
            <CardHeader>
              <CardTitle>Tracking History</CardTitle>
            </CardHeader>
            <CardContent>
              {trackingEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tracking events found for this order</p>
              ) : (
                <div className="space-y-4">
                  {trackingEvents.map((event, index) => (
                    <div key={event.id || index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{event.status}</h4>
                            {event.location && <p className="text-sm text-gray-600">{event.location}</p>}
                            {event.notes && <p className="text-sm text-gray-700 mt-1">{event.notes}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{formatDate(event.timestamp)}</p>
                          </div>
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
