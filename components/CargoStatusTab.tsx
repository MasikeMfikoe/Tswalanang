"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Ship, AlertCircle } from "lucide-react"
import { format, parseISO } from "date-fns"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/lib/toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface CargoStatusTabProps {
  customerId: string
  startDate: string
  endDate: string
}

export default function CargoStatusTab({ customerId, startDate, endDate }: CargoStatusTabProps) {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClientComponentClient()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [customerId, startDate, endDate])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      // Build the query
      let query = supabase.from("orders").select("*")

      // Apply customer filter if selected
      if (customerId && customerId !== "all") {
        query = query.eq("importer", customerId)
      }

      // Apply date filters
      if (startDate) {
        query = query.gte("created_at", startDate)
      }

      if (endDate) {
        // Add one day to include the end date fully
        const nextDay = new Date(endDate)
        nextDay.setDate(nextDay.getDate() + 1)
        query = query.lt("created_at", nextDay.toISOString().split("T")[0])
      }

      // Execute the query
      const { data, error } = await query

      if (error) {
        throw error
      }

      const ordersWithShipping =
        data?.map((order) => ({
          ...order,
          shippingLine: order.shipping_line || "Not assigned",
          trackingNumber: order.tracking_number || "",
          trackingUrl: order.tracking_number ? `https://tracking.example.com/` : "",
          lastUpdated: order.last_event_date || order.updated_at || order.created_at,
          hasTracking: !!order.tracking_number,
          cargoStatus: order.cargo_status || "not-shipped",
        })) || []

      setOrders(ordersWithShipping)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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

  const handleViewDetails = (orderId: string) => {
    router.push(`/customer-summary/cargo-status/${orderId}`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Orders Found</h3>
          <p className="text-muted-foreground mt-2">
            There are no orders with cargo status information for the selected criteria.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargo Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>PO Number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Shipping Line</TableHead>
              <TableHead>Cargo Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.importer}</TableCell>
                <TableCell>{order.po_number || "N/A"}</TableCell>
                <TableCell>{format(parseISO(order.created_at), "MMM dd, yyyy")}</TableCell>
                <TableCell>
                  {order.shippingLine && order.shippingLine !== "Not assigned" ? (
                    <div className="flex items-center">
                      <Ship className="h-4 w-4 mr-1 text-blue-500" />
                      {order.shippingLine}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not assigned</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(order.cargoStatus)}</TableCell>
                <TableCell>
                  {order.lastUpdated ? (
                    format(parseISO(order.lastUpdated), "MMM dd, yyyy HH:mm")
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(order.id)}>
                      View Details
                    </Button>
                    {order.hasTracking && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(order.trackingUrl + order.trackingNumber, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
