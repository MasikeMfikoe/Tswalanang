"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { type Order, updateOrder } from "@/features/orders/api/ordersApi"
import { isFeatureEnabled } from "@/lib/featureFlags"

export default function OrderDetails({ orderId }: { orderId: string }) {
  const { toast } = useToast()
  const router = useRouter()

  const [order, setOrder] = useState<Order | null>(null)
  const [tempOrder, setTempOrder] = useState<Order | null>(null)
  const [customers, setCustomers] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("documents")
  const [cargoStatusHistory, setCargoStatusHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch order data
  useEffect(() => {
    async function fetchOrderData() {
      setIsLoading(true)
      try {
        // Replace with your actual API call
        const response = await fetch(`/api/orders/${orderId}`)
        const data = await response.json()
        setOrder(data)
        setTempOrder(data)
      } catch (error) {
        console.error("Error fetching order:", error)
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderData()
  }, [orderId, toast])

  // Use feature flags to conditionally render new UI
  const useNewUI = isFeatureEnabled("NEW_ORDER_DETAILS_UI")

  // Rest of your component logic...

  // Example of a handler that's isolated to this feature
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tempOrder) return

    try {
      const updatedOrder = await updateOrder(tempOrder)
      setOrder(updatedOrder)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Order updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      })
    }
  }

  // Render loading state
  if (isLoading) {
    return <div>Loading order details...</div>
  }

  // Render error state if order not found
  if (!order) {
    return <div>Order not found</div>
  }

  return (
    <div className="h-full overflow-y-auto">
      {useNewUI ? (
        // New UI implementation
        <div>{/* New UI components */}</div>
      ) : (
        // Current UI implementation
        <div>{/* Current UI components */}</div>
      )}
    </div>
  )
}
