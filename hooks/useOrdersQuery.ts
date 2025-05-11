"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ordersApi } from "@/lib/api/ordersApi"
import type { Order } from "@/types/models"
import { useToast } from "@/components/ui/use-toast"

// Query keys
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: any) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  cargoHistory: (orderId: string) => [...orderKeys.detail(orderId), "cargo-history"] as const,
}

// Get all orders
export function useOrders(params?: {
  page?: number
  pageSize?: number
  status?: string
  customerId?: string
  search?: string
  startDate?: string
  endDate?: string
}) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersApi.getOrders(params),
  })
}

// Get a single order
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.getOrder(id),
    enabled: !!id,
  })
}

// Get cargo status history
export function useCargoStatusHistory(orderId: string) {
  return useQuery({
    queryKey: orderKeys.cargoHistory(orderId),
    queryFn: () => ordersApi.getCargoStatusHistory(orderId),
    enabled: !!orderId,
  })
}

// Create order mutation
export function useCreateOrder() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (orderData: Partial<Order>) => ordersApi.createOrder(orderData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      toast({
        title: "Success",
        description: `Order ${data.data.poNumber} created successfully`,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create order",
        variant: "destructive",
      })
    },
  })
}

// Update order mutation
export function useUpdateOrder() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, orderData }: { id: string; orderData: Partial<Order> }) => ordersApi.updateOrder(id, orderData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      toast({
        title: "Success",
        description: `Order ${data.data.poNumber} updated successfully`,
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order",
        variant: "destructive",
      })
    },
  })
}

// Delete order mutation
export function useDeleteOrder() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => ordersApi.deleteOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      toast({
        title: "Success",
        description: "Order deleted successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete order",
        variant: "destructive",
      })
    },
  })
}

// Update cargo status mutation
export function useUpdateCargoStatus() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ orderId, status, comment }: { orderId: string; status: string; comment?: string }) =>
      ordersApi.updateCargoStatus(orderId, status, comment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.orderId) })
      queryClient.invalidateQueries({ queryKey: orderKeys.cargoHistory(variables.orderId) })
      toast({
        title: "Success",
        description: "Cargo status updated successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update cargo status",
        variant: "destructive",
      })
    },
  })
}

// Mark order as completed mutation
export function useMarkOrderAsCompleted() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (orderId: string) => ordersApi.markOrderAsCompleted(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
      toast({
        title: "Success",
        description: "Order marked as completed successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark order as completed",
        variant: "destructive",
      })
    },
  })
}
