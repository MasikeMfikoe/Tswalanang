"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/AuthContext"
import type { Order } from "@/types/models"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, CalendarDays, ArrowRight, MapPin } from 'lucide-react' // Import MapPin
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast" // Import useToast

export default function ClientPortalOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast() // Initialize useToast

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) {
        setError("User not authenticated. Please log in.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/client-portal/orders?clientId=${user.id}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || result.message || "Failed to fetch orders")
        }

        setOrders(result.data || [])
      } catch (err: any) {
        console.error("Error fetching client orders:", err)
        setError(err.message || "An unexpected error occurred while fetching orders.")
        setOrders([]) // Clear orders on error
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user?.id])

  const filteredOrders = useMemo(() => {
    if (!searchTerm) {
      return orders
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    return orders.filter(
      (order) =>
        order.po_number?.toLowerCase().includes(lowerCaseSearchTerm) ||
        order.supplier?.toLowerCase().includes(lowerCaseSearchTerm) ||
        order.status?.toLowerCase().includes(lowerCaseSearchTerm) ||
        order.tracking_number?.toLowerCase().includes(lowerCaseSearchTerm) ||
        order.container_number?.toLowerCase().includes(lowerCaseSearchTerm) ||
        order.customer_name?.toLowerCase().includes(lowerCaseSearchTerm),
    )
  }, [orders, searchTerm])

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch (e) {
      console.error("Error formatting date:", dateString, e)
      return "Invalid Date"
    }
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

  const isAdmin = user?.role === "admin"

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Your Orders</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search orders by PO, supplier, status, tracking number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 w-full"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <p className="text-center text-gray-500">No orders found matching your criteria.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    {isAdmin && <TableHead>Customer</TableHead>}
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead>Container Number</TableHead>
                    <TableHead>Est. Delivery</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.po_number || "N/A"}</TableCell>
                      {isAdmin && <TableCell>{order.customer_name || "N/A"}</TableCell>}
                      <TableCell>{order.supplier || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === "Delivered" ? "default" : "secondary"}>
                          {order.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.tracking_number || "N/A"}</TableCell>
                      <TableCell>{order.container_number || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4 text-gray-500" />
                          {formatDate(order.estimated_delivery)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/client-portal/orders/${order.id}`)}
                          >
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTrackShipment(order.tracking_number)}
                            disabled={!order.tracking_number}
                          >
                            <MapPin className="h-4 w-4 mr-1" />
                            Track
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
