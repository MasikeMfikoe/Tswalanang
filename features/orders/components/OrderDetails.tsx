"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Edit, Trash2, FileText, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { Order } from "@/types/models" // Assuming Order type is defined
import { fetchOrderById, deleteOrder } from "@/features/orders/api/ordersApi"
import { ConfirmationDialog } from "@/app/admin/user-groups/components/ConfirmationDialog" // Reusing this component

interface OrderDetailsProps {
  orderId: string
}

export function OrderDetails({ orderId }: OrderDetailsProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { toast } = useToast()

  const loadOrder = async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedOrder = await fetchOrderById(orderId)
      setOrder(fetchedOrder)
    } catch (err: any) {
      setError(err.message || "Failed to load order details.")
      console.error("Error fetching order:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const handleDelete = async () => {
    if (!order) return
    try {
      await deleteOrder(order.id)
      toast({
        title: "Order Deleted",
        description: `Order ${order.id} has been successfully deleted.`,
        variant: "success",
      })
      // Redirect to orders list or show a message
      // router.push('/orders'); // Example redirect
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete order.",
        variant: "destructive",
      })
    } finally {
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="ml-2 text-gray-600">Loading order details...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Order</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
          <Button onClick={loadOrder} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="text-center py-10">
          <p className="text-gray-500">Order not found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Order Details: {order.id}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(order.id)}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
          <p>
            <strong>Customer:</strong> {order.customerName}
          </p>
          <p>
            <strong>Status:</strong> <Badge>{order.status}</Badge>
          </p>
          <p>
            <strong>Origin:</strong> {order.origin}
          </p>
          <p>
            <strong>Destination:</strong> {order.destination}
          </p>
          <p>
            <strong>ETA:</strong> {order.eta}
          </p>
          <p>
            <strong>Value:</strong> {order.currency} {order.value.toLocaleString()}
          </p>
          {order.containerNumber && (
            <p>
              <strong>Container No:</strong> {order.containerNumber}
            </p>
          )}
          {order.trackingNumber && (
            <p>
              <strong>Tracking No:</strong> {order.trackingNumber}
            </p>
          )}
        </div>

        {order.description && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Description:</h3>
              <p className="text-muted-foreground">{order.description}</p>
            </div>
          </>
        )}

        {order.documents && order.documents.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Documents:</h3>
              <div className="grid gap-2">
                {order.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span>{doc.type}</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-1" /> View
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        title={`Delete Order ${order.id}?`}
        description="Are you sure you want to delete this order? This action cannot be undone."
      />
    </Card>
  )
}

// Placeholder for edit functionality
const handleEdit = (orderId: string) => {
  console.log(`Editing order ${orderId}`)
  // Implement navigation to an edit page or open an edit modal
}
