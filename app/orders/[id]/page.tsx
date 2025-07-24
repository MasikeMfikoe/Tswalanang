"use client"

import { useParams, useRouter } from "next/navigation"
import { useOrderQuery, useUpdateOrderMutation, useDeleteOrderMutation } from "@/hooks/useOrdersQuery"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Edit, Trash2, ArrowLeft, CalendarIcon, MapPin, Package, DollarSign, FileText } from "lucide-react"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OrderStatus } from "@/types/models"
import { useState } from "react"
import DocumentManagement from "@/components/DocumentManagement"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function OrderDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const { toast } = useToast()

  const { data: order, isLoading, isError, error } = useOrderQuery(orderId)
  const updateOrderMutation = useUpdateOrderMutation()
  const deleteOrderMutation = useDeleteOrderMutation()

  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("")

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "Completed":
      case "Delivered":
        return "default"
      case "In Transit":
      case "Processing":
        return "secondary"
      case "Pending":
      case "On Hold":
        return "outline"
      case "Cancelled":
      case "Exception":
        return "destructive"
      case "Customs Clearance":
        return "info"
      default:
        return "outline"
    }
  }

  const handleUpdateStatus = async () => {
    if (!order || !newStatus) return

    try {
      await updateOrderMutation.mutateAsync({ id: order.id, data: { status: newStatus } })
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}.`,
      })
      setIsEditingStatus(false)
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to update status: ${(err as Error).message}`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteOrder = async () => {
    if (!order) return
    if (confirm(`Are you sure you want to delete order ${order.po_number}? This action cannot be undone.`)) {
      try {
        await deleteOrderMutation.mutateAsync(order.id)
        toast({
          title: "Success",
          description: `Order ${order.po_number} deleted successfully.`,
        })
        router.push("/orders") // Redirect to orders list after deletion
      } catch (err) {
        toast({
          title: "Error",
          description: `Failed to delete order: ${(err as Error).message}`,
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Order</CardTitle>
            <CardDescription>
              {error?.message || "The order you are looking for could not be found or an error occurred."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/orders")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const orderStatuses: OrderStatus[] = [
    "Pending",
    "Processing",
    "In Transit",
    "Customs Clearance",
    "Delivered",
    "Completed",
    "Cancelled",
    "On Hold",
    "Exception",
  ]

  return (
    <ProtectedRoute requiredPermission={{ module: "orders", action: "view" }}>
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Order Details: {order.po_number}</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => router.push("/orders")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
            {/* <Button variant="outline" onClick={() => toast({ title: "Edit Order", description: "Edit functionality to be implemented." })}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Order
            </Button> */}
            <Button variant="destructive" onClick={handleDeleteOrder}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Order
            </Button>
          </div>
        </div>
        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Key details about this order.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p className="text-muted-foreground">Customer</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">PO Number</p>
                <p className="font-medium">{order.po_number}</p>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">Order Date</p>
                <p className="font-medium flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {format(new Date(order.order_date), "PPP")}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">Freight Type</p>
                <p className="font-medium flex items-center gap-1">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  {order.freight_type}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">Total Value</p>
                <p className="font-medium flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  {order.currency} {order.total_value.toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">Expected Delivery</p>
                <p className="font-medium flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {order.expected_delivery_date ? format(new Date(order.expected_delivery_date), "PPP") : "N/A"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">Actual Delivery</p>
                <p className="font-medium flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {order.actual_delivery_date ? format(new Date(order.actual_delivery_date), "PPP") : "N/A"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground">Tracking Number</p>
                <p className="font-medium">{order.tracking_number || "N/A"}</p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <p className="text-muted-foreground">Notes</p>
                <p className="font-medium">{order.notes || "No notes."}</p>
              </div>
            </CardContent>
          </Card>

          {/* Status & Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Current status and quick actions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={getStatusBadgeVariant(order.status)} className="text-lg px-3 py-1">
                  {order.status}
                </Badge>
                {!isEditingStatus && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingStatus(true)
                      setNewStatus(order.status)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {isEditingStatus && (
                <div className="flex flex-col gap-2">
                  <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {orderStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateStatus} disabled={updateOrderMutation.isPending}>
                      {updateOrderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingStatus(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-700">Addresses</h3>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Origin:</p>
                    <p>{order.origin_address.street}</p>
                    <p>
                      {order.origin_address.city}, {order.origin_address.postalCode}
                    </p>
                    <p>{order.origin_address.country}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm mt-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Destination:</p>
                    <p>{order.destination_address.street}</p>
                    <p>
                      {order.destination_address.city}, {order.destination_address.postalCode}
                    </p>
                    <p>{order.destination_address.country}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents ({order.documents?.length || 0})
            </CardTitle>
            <CardDescription>Manage all documents associated with this order.</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentManagement orderId={order.id} initialDocuments={order.documents || []} />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
