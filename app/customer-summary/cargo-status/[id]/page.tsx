"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Ship, Package, Calendar, MapPin, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/lib/toast"
import { createBrowserClient } from "@supabase/ssr"

export default function CargoStatusDetails({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    cargoStatus: "",
    comments: "",
    trackingNumber: "",
    trackingUrl: "",
    shippingLine: "",
    location: "",
  })
  const [statusHistory, setStatusHistory] = useState<any[]>([])

  useEffect(() => {
    fetchOrderDetails()
  }, [params.id])

  const fetchOrderDetails = async () => {
    setIsLoading(true)
    try {
      // Fetch order details
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", params.id)
        .single()

      if (orderError) {
        console.error("Error fetching order:", orderError)
        toast({
          title: "Error",
          description: "Failed to load order details. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Fetch status history
      const { data: historyData, error: historyError } = await supabase
        .from("cargo_status_history")
        .select("*")
        .eq("order_id", params.id)
        .order("timestamp", { ascending: false })

      if (historyError) {
        console.error("Error fetching status history:", historyError)
      }

      // Add shipping information to the order
      const enhancedOrder = {
        ...orderData,
        shippingLine:
          orderData.freightType === "Sea Freight" ? ["Maersk", "MSC", "CMA CGM"][Math.floor(Math.random() * 3)] : "",
        trackingNumber:
          orderData.freightType === "Sea Freight"
            ? `${["MAEU", "MSCU", "CMAU"][Math.floor(Math.random() * 3)]}${Math.floor(Math.random() * 10000000)}`
            : "",
        trackingUrl:
          orderData.freightType === "Sea Freight"
            ? `https://www.${["maersk", "msc", "cma-cgm"][Math.floor(Math.random() * 3)]}.com/tracking/`
            : "",
        location:
          orderData.cargoStatus === "in-transit"
            ? "Singapore Port"
            : orderData.cargoStatus === "at-destination"
              ? "Durban Port"
              : orderData.cargoStatus === "at-origin"
                ? "Shanghai Port"
                : "",
        vessel: orderData.freightType === "Sea Freight" ? "Maersk Semarang" : "",
        voyage: orderData.freightType === "Sea Freight" ? "MA123E" : "",
        eta:
          orderData.cargoStatus === "in-transit"
            ? new Date(new Date().setDate(new Date().getDate() + 14)).toISOString()
            : "",
      }

      setOrder(enhancedOrder)

      // If no history exists, create a mock history based on the current status
      const history = historyData || []
      if (history.length === 0 && orderData) {
        const mockHistory = [
          {
            id: "1",
            status: orderData.cargoStatus,
            timestamp: orderData.updatedAt || orderData.createdAt,
            comments: `Status updated to ${orderData.cargoStatus}`,
            location: enhancedOrder.location,
            updatedBy: "System",
          },
        ]
        setStatusHistory(mockHistory)
      } else {
        setStatusHistory(history)
      }

      setFormData({
        cargoStatus: orderData.cargoStatus,
        comments: "",
        trackingNumber: enhancedOrder.trackingNumber || "",
        trackingUrl: enhancedOrder.trackingUrl || "",
        shippingLine: enhancedOrder.shippingLine || "",
        location: enhancedOrder.location || "",
      })
    } catch (error) {
      console.error("Error fetching order details:", error)
      toast({
        title: "Error",
        description: "Failed to load order details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Update order
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          cargoStatus: formData.cargoStatus,
          cargoStatusComment: formData.comments,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", params.id)

      if (updateError) {
        throw new Error(`Failed to update order: ${updateError.message}`)
      }

      // Check if cargo_status_history table exists
      const { error: tableCheckError } = await supabase.from("cargo_status_history").select("id").limit(1)

      // If the table exists, add to history
      if (!tableCheckError) {
        const { error: historyError } = await supabase.from("cargo_status_history").insert({
          order_id: params.id,
          status: formData.cargoStatus,
          comments: formData.comments,
          location: formData.location,
          timestamp: new Date().toISOString(),
          updated_by: user?.id || "system",
          updated_by_name: user ? `${user.name} ${user.surname}` : "System",
        })

        if (historyError) {
          console.error("Error adding to history:", historyError)
        }
      }

      toast({
        title: "Success",
        description: "Cargo status updated successfully",
      })

      // Redirect back to the cargo status tab
      router.push("/customer-summary?tab=cargo-status")
    } catch (error) {
      console.error("Error updating cargo status:", error)
      toast({
        title: "Error",
        description: "Failed to update cargo status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      "not-shipped": { color: "bg-gray-100 text-gray-800", label: "Not Shipped" },
      "instruction-sent": { color: "bg-blue-100 text-blue-800", label: "Instruction Sent" },
      "at-origin": { color: "bg-purple-100 text-purple-800", label: "At Origin" },
      "cargo-departed": { color: "bg-indigo-100 text-indigo-800", label: "Cargo Departed" },
      "in-transit": { color: "bg-yellow-100 text-yellow-800", label: "In Transit" },
      "at-destination": { color: "bg-green-100 text-green-800", label: "At Destination" },
      "customs-hold": { color: "bg-red-100 text-red-800", label: "Customs Hold" },
      delivered: { color: "bg-emerald-100 text-emerald-800", label: "Delivered" },
    }

    const { color, label } = statusMap[status] || { color: "bg-gray-100 text-gray-800", label: status }

    return <Badge className={color}>{label}</Badge>
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Order Not Found</h3>
            <p className="text-muted-foreground mt-2">The requested order could not be found.</p>
            <Button className="mt-4" onClick={() => router.push("/customer-summary?tab=cargo-status")}>
              Return to Cargo Status
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push("/customer-summary?tab=cargo-status")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Cargo Status: {order.poNumber}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Update Cargo Status</CardTitle>
            <CardDescription>Update the cargo status and tracking information for this order.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cargoStatus">Cargo Status</Label>
                  <Select
                    value={formData.cargoStatus}
                    onValueChange={(value) => handleSelectChange("cargoStatus", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-shipped">Not Shipped</SelectItem>
                      <SelectItem value="instruction-sent">Instruction Sent</SelectItem>
                      <SelectItem value="at-origin">At Origin</SelectItem>
                      <SelectItem value="cargo-departed">Cargo Departed</SelectItem>
                      <SelectItem value="in-transit">In Transit</SelectItem>
                      <SelectItem value="at-destination">At Destination</SelectItem>
                      <SelectItem value="customs-hold">Customs Hold</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingLine">Shipping Line</Label>
                  <Select
                    value={formData.shippingLine}
                    onValueChange={(value) => handleSelectChange("shippingLine", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shipping line" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="Maersk">Maersk</SelectItem>
                      <SelectItem value="MSC">MSC</SelectItem>
                      <SelectItem value="CMA CGM">CMA CGM</SelectItem>
                      <SelectItem value="Hapag-Lloyd">Hapag-Lloyd</SelectItem>
                      <SelectItem value="ONE">ONE</SelectItem>
                      <SelectItem value="Evergreen">Evergreen</SelectItem>
                      <SelectItem value="COSCO">COSCO</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trackingNumber">Tracking Number</Label>
                  <Input
                    id="trackingNumber"
                    name="trackingNumber"
                    value={formData.trackingNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., MAEU1234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trackingUrl">Tracking URL</Label>
                  <Input
                    id="trackingUrl"
                    name="trackingUrl"
                    value={formData.trackingUrl}
                    onChange={handleInputChange}
                    placeholder="e.g., https://www.maersk.com/tracking/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Current Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Singapore Port"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Comments</Label>
                <Textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  placeholder="Add any relevant comments about this status update"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/customer-summary?tab=cargo-status")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Current Status</h3>
                <div className="mt-1">{getStatusBadge(order.cargoStatus)}</div>
              </div>

              {order.trackingNumber && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tracking Number</h3>
                  <div className="flex items-center mt-1">
                    <Package className="h-4 w-4 mr-1 text-blue-500" />
                    <p>{order.trackingNumber}</p>
                  </div>
                </div>
              )}

              {order.trackingUrl && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Tracking Link</h3>
                  <a
                    href={order.trackingUrl + order.trackingNumber}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center mt-1 text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    <span>View on {order.shippingLine}</span>
                  </a>
                </div>
              )}

              {order.vessel && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Vessel / Voyage</h3>
                  <div className="flex items-center mt-1">
                    <Ship className="h-4 w-4 mr-1 text-blue-500" />
                    <p>
                      {order.vessel} {order.voyage ? `/ ${order.voyage}` : ""}
                    </p>
                  </div>
                </div>
              )}

              {order.location && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Current Location</h3>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1 text-red-500" />
                    <p>{order.location}</p>
                  </div>
                </div>
              )}

              {order.eta && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estimated Arrival</h3>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1 text-green-500" />
                    <p>{format(new Date(order.eta), "MMM dd, yyyy")}</p>
                  </div>
                </div>
              )}

              {order.updatedAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="mt-1 text-sm">{format(new Date(order.updatedAt), "MMM dd, yyyy HH:mm")}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          {statusHistory.length === 0 ? (
            <p className="text-muted-foreground">No status history available.</p>
          ) : (
            <div className="space-y-4">
              {statusHistory.map((history) => (
                <div key={history.id} className="border-l-2 border-blue-500 pl-4 pb-4">
                  <div className="flex items-center mb-1">
                    <Package className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="font-medium">
                      {history.status.replace(/-/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-1">
                    {format(new Date(history.timestamp), "MMM dd, yyyy HH:mm")}
                  </div>
                  {history.location && (
                    <div className="flex items-center text-sm text-gray-700 mb-1">
                      <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                      {history.location}
                    </div>
                  )}
                  {history.comments && <p className="text-sm text-gray-700 mt-1">{history.comments}</p>}
                  <div className="text-xs text-gray-400 mt-1">
                    Updated by: {history.updated_by_name || history.updatedBy}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
