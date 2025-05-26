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

interface CargoStatusTabProps {
  customerId: string
  startDate: string
  endDate: string
}

export default function CargoStatusTab({ customerId, startDate, endDate }: CargoStatusTabProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [customerId, startDate, endDate])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      // In a real implementation, this would fetch from your API
      // For now, we'll simulate with a timeout and mock data
      setTimeout(() => {
        // Mock data for demonstration
        const mockOrders = [
          {
            id: "PO-2024-001",
            poNumber: "PO001",
            createdAt: "2024-01-15T10:30:00Z",
            shippingLine: "Maersk",
            cargoStatus: "in-transit",
            trackingNumber: "MAEU1234567",
            trackingUrl: "https://www.maersk.com/tracking/MAEU1234567",
            lastUpdated: "2024-05-20T14:30:00Z",
            hasTracking: true,
          },
          {
            id: "PO-2024-002",
            poNumber: "PO002",
            createdAt: "2024-02-10T09:15:00Z",
            shippingLine: "MSC",
            cargoStatus: "at-destination",
            trackingNumber: "MSCU7654321",
            trackingUrl: "https://www.msc.com/track-a-shipment?link=MSCU7654321",
            lastUpdated: "2024-05-21T10:45:00Z",
            hasTracking: true,
          },
          {
            id: "PO-2024-003",
            poNumber: "PO003",
            createdAt: "2024-03-05T11:45:00Z",
            shippingLine: "CMA CGM",
            cargoStatus: "customs-hold",
            trackingNumber: "CMAU5555555",
            trackingUrl: "https://www.cma-cgm.com/ebusiness/tracking/search?SearchBy=Container&Reference=CMAU5555555",
            lastUpdated: "2024-05-19T08:15:00Z",
            hasTracking: true,
          },
          {
            id: "PO-2024-004",
            poNumber: "PO004",
            createdAt: "2024-04-20T15:00:00Z",
            shippingLine: "",
            cargoStatus: "not-shipped",
            trackingNumber: "",
            trackingUrl: "",
            lastUpdated: "",
            hasTracking: false,
          },
        ]
        setOrders(mockOrders)
        setIsLoading(false)
      }, 800)

      // In a real implementation with Supabase:
      /*
      let query = supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        
      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Error fetching orders:', error)
        toast({
          title: 'Error',
          description: 'Failed to load orders. Please try again.',
          variant: 'destructive',
        })
        return
      }
      
      setOrders(data || [])
      */
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
              <TableHead>Order ID</TableHead>
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
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.poNumber}</TableCell>
                <TableCell>{format(parseISO(order.createdAt), "MMM dd, yyyy")}</TableCell>
                <TableCell>
                  {order.shippingLine ? (
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
                        onClick={() => window.open(order.trackingUrl, "_blank")}
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
