"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Eye, RefreshCw, Search, MapPin, ExternalLink } from "lucide-react"
import { detectShipmentTrackingInfo } from "@/lib/services/container-detection-service"

// Define the Order type to match Supabase data
type Order = {
  id: string
  order_number?: string
  po_number?: string
  supplier?: string
  importer?: string
  status?: string
  cargo_status?: string
  freight_type?: string
  total_value?: number
  customer_name?: string
  origin?: string
  destination?: string
  created_at: string
  updated_at?: string
  tracking_number?: string
  etd?: string
  eta?: string
  shipping_line?: string
  carrier?: string
}

export function OrdersContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const detectAndUpdateCarriers = async (orders: Order[]) => {
    if (!Array.isArray(orders)) return

    const ordersToUpdate = orders.filter(
      (order) => order.tracking_number && !order.shipping_line && order.tracking_number.trim() !== "",
    )

    const ordersToUpdateCount = Array.isArray(ordersToUpdate) ? ordersToUpdate.length : 0
    if (ordersToUpdateCount === 0) return

    console.log(`[v0] Detecting carriers for ${ordersToUpdateCount} existing orders...`)

    for (const order of ordersToUpdate) {
      try {
        const detectionResult = detectShipmentTrackingInfo(order.tracking_number!)

        if (detectionResult.carrierDetails && detectionResult.isValidFormat) {
          const response = await fetch(`/api/orders/${order.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...order,
              shipping_line: detectionResult.carrierDetails.name,
            }),
          })

          if (response.ok) {
            console.log(`[v0] Updated carrier for order ${order.id}: ${detectionResult.carrierDetails.name}`)
          }
        }
      } catch (error) {
        console.error(`[v0] Error updating carrier for order ${order.id}:`, error)
      }
    }
  }

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("[v0] Fetching orders from API route...")
      const response = await fetch("/api/orders")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Orders API response:", data)

      if (data.error) {
        throw new Error(data.error)
      }

      const fetchedOrders = data.data || []
      setOrders(fetchedOrders)

      const fetchedOrdersCount = Array.isArray(fetchedOrders) ? fetchedOrders.length : 0
      if (fetchedOrdersCount > 0) {
        detectAndUpdateCarriers(fetchedOrders)
      }

      if (fetchedOrdersCount === 0) {
        toast({
          title: "No Orders Found",
          description: "No orders have been created yet. Create your first order!",
        })
      }
    } catch (error: any) {
      console.error("[v0] Error fetching orders:", error)
      setError(error.message || "Failed to fetch orders")
      toast({
        title: "Error",
        description: "Failed to load orders from database",
        variant: "destructive",
      })
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, statusFilter, orders])

  const filterOrders = () => {
    if (!Array.isArray(orders)) {
      setFilteredOrders([])
      return
    }

    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.importer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status?.toLowerCase() === statusFilter.toLowerCase())
    }

    setFilteredOrders(filtered)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-ZA", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date)
  }

  const getCargoStatusBadge = (status: string | null) => {
    if (!status) {
      return {
        label: "Unknown",
        className: "bg-gray-100 text-gray-800 border-gray-300",
      }
    }

    const normalizeStatus = (str: string) => {
      return str.toLowerCase().trim()
    }

    const normalizedStatus = normalizeStatus(status)

    const statusMap = {
      "instruction-sent": {
        label: "Instruction Sent to Agent",
        className: "border",
        style: { backgroundColor: "#FEE2E2", color: "#991B1B", borderColor: "#FCA5A5" },
      },
      "agent-response": {
        label: "Agent Response",
        className: "border",
        style: { backgroundColor: "#EF4444", color: "#7F1D1D", borderColor: "#F87171" },
      },
      "at-origin": {
        label: "At Origin",
        className: "border",
        style: { backgroundColor: "#DBEAFE", color: "#1E3A8A", borderColor: "#93C5FD" },
      },
      "cargo-departed": {
        label: "Cargo Departed",
        className: "border",
        style: { backgroundColor: "#3B82F6", color: "#1E40AF", borderColor: "#60A5FA" },
      },
      "in-transit": {
        label: "In Transit",
        className: "border",
        style: { backgroundColor: "#F59E0B", color: "#7C2D12", borderColor: "#FDBA74" },
      },
      "at-destination": {
        label: "At Destination",
        className: "border",
        style: { backgroundColor: "#D1FAE5", color: "#065F46", borderColor: "#86EFAC" },
      },
      delivered: {
        label: "Delivered",
        className: "border",
        style: { backgroundColor: "#10B981", color: "#064E3B", borderColor: "#34D399" },
      },
    }

    return (
      statusMap[normalizedStatus] || {
        label: status,
        className: "bg-gray-100 text-gray-800 border-gray-300",
      }
    )
  }

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const handleRefresh = () => {
    fetchOrders()
    toast({
      title: "Success",
      description: "Orders refreshed successfully",
    })
  }

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  const handleTrackShipment = (trackingNumber?: string | null) => {
    if (trackingNumber) {
      router.push(`/shipment-tracker/results/${trackingNumber}`)
    } else {
      toast({
        title: "No Tracking Number",
        description: "This order does not have a tracking number available.",
        variant: "default",
      })
    }
  }

  const handleShippingLineTrack = (trackingNumber?: string | null) => {
    if (trackingNumber) {
      const detectionResult = detectShipmentTrackingInfo(trackingNumber)

      if (detectionResult.carrierDetails?.trackingUrl) {
        let trackingUrl = detectionResult.carrierDetails.trackingUrl

        // For carriers that need the tracking number appended to the URL
        if (detectionResult.carrierDetails.code === "MAERSK") {
          trackingUrl = `${trackingUrl}${trackingNumber}`
        } else if (detectionResult.carrierDetails.code === "MSC") {
          trackingUrl = `${trackingUrl}?searchNumber=${trackingNumber}`
        } else if (
          detectionResult.carrierDetails.code === "QATAR_AIRWAYS" ||
          detectionResult.carrierDetails.code === "QATAR_AIRWAYS_157"
        ) {
          trackingUrl = `${trackingUrl}?awb=${trackingNumber}`
        } else if (detectionResult.carrierDetails.code === "ETHIOPIAN_AIRLINES") {
          trackingUrl = `${trackingUrl}?awb=${trackingNumber}`
        } else if (detectionResult.type === "awb") {
          // For other air freight carriers, append AWB parameter
          trackingUrl = `${trackingUrl}${trackingNumber}`
        } else {
          // For other ocean carriers, append tracking number
          trackingUrl = `${trackingUrl}${trackingNumber}`
        }

        window.open(trackingUrl, "_blank")
      } else {
        toast({
          title: "No Tracking URL",
          description: "This carrier does not have a tracking URL available.",
          variant: "default",
        })
      }
    } else {
      toast({
        title: "No Tracking Number",
        description: "This order does not have a tracking number available.",
        variant: "default",
      })
    }
  }

  const handleReturnFromOrder = () => {
    fetchOrders()
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchOrders()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Shipment Orders</h1>
            <p className="text-muted-foreground">View and manage all shipment orders</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading shipment orders...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Shipment Orders</h1>
          <p className="text-muted-foreground">View and manage all shipment orders</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/create-order")} className="bg-black text-white hover:bg-gray-800">
            Create Order
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-md">
              <p className="font-semibold">Error loading orders</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="mt-6 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Origin → Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-[160px]">ETD / ETA</TableHead>
                  <TableHead>Freight Type</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!Array.isArray(filteredOrders) || filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <p className="text-lg font-medium">No shipment orders found</p>
                        <p className="text-sm">
                          {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : "Create your first shipment order to get started"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>{order.po_number || order.order_number || "N/A"}</TableCell>
                      <TableCell>{order.customer_name || order.importer || "N/A"}</TableCell>
                      <TableCell>
                        {order.origin && order.destination
                          ? `${order.origin} → ${order.destination}`
                          : order.origin || order.destination || "N/A"}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const badgeInfo = getCargoStatusBadge(order.cargo_status)
                          return badgeInfo.style ? (
                            <div
                              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              style={badgeInfo.style}
                            >
                              {badgeInfo.label}
                            </div>
                          ) : (
                            <Badge variant="secondary" className={badgeInfo.className}>
                              {badgeInfo.label}
                            </Badge>
                          )
                        })()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <div className="text-muted-foreground text-xs font-medium">ETD</div>
                            <div>{order.etd ? formatDate(order.etd) : "N/A"}</div>
                          </div>
                          <div className="text-sm">
                            <div className="text-muted-foreground text-xs font-medium">ETA</div>
                            <div>{order.eta ? formatDate(order.eta) : "N/A"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {order.freight_type || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewOrder(order.id)}
                            className="hover:bg-muted"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTrackShipment(order.tracking_number)}
                            disabled={!order.tracking_number}
                            className="hover:bg-muted"
                          >
                            <MapPin className="h-4 w-4 mr-1" />
                            Track
                          </Button>
                          {order.tracking_number && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShippingLineTrack(order.tracking_number)}
                              className="hover:bg-muted text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              {(() => {
                                const detectionResult = detectShipmentTrackingInfo(order.tracking_number!)
                                return detectionResult.carrierDetails?.name || "Line"
                              })()}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {Array.isArray(filteredOrders) && filteredOrders.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredOrders.length} of {Array.isArray(orders) ? orders.length : 0} shipment orders
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
