import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ordersApi } from "@/lib/api/ordersApi"
import type { Order, PaginatedResponse } from "@/types/models"

interface UseOrdersQueryParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  customerId?: string
  enabled?: boolean // To control when the query runs
}

export function useOrdersQuery(params: UseOrdersQueryParams = {}) {
  const { page = 1, pageSize = 10, search = "", status = "", customerId = "", enabled = true } = params

  return useQuery<PaginatedResponse<Order[]>, Error>({
    queryKey: ["orders", { page, pageSize, search, status, customerId }],
    queryFn: () => ordersApi.getOrders({ page, pageSize, search, status, customerId }),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new
    enabled: enabled,
  })
}

export function useOrderQuery(orderId: string | null) {
  return useQuery<Order, Error>({
    queryKey: ["order", orderId],
    queryFn: () =>
      ordersApi.getOrder(orderId!).then((res) => {
        if (!res.success || !res.data) throw new Error(res.message || "Failed to fetch order")
        return res.data
      }),
    enabled: !!orderId, // Only run if orderId is provided
  })
}

export function useCreateOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation<Order, Error, Partial<Order>>({
    mutationFn: (newOrder) =>
      ordersApi.createOrder(newOrder).then((res) => {
        if (!res.success || !res.data) throw new Error(res.message || "Failed to create order")
        return res.data
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] }) // Invalidate all orders queries
    },
  })
}

export function useUpdateOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation<Order, Error, { id: string; data: Partial<Order> }>({
    mutationFn: ({ id, data }) =>
      ordersApi.updateOrder(id, data).then((res) => {
        if (!res.success || !res.data) throw new Error(res.message || "Failed to update order")
        return res.data
      }),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] }) // Invalidate all orders queries
      queryClient.invalidateQueries({ queryKey: ["order", updatedOrder.id] }) // Invalidate specific order query
    },
  })
}

export function useDeleteOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: (orderId) =>
      ordersApi.deleteOrder(orderId).then((res) => {
        if (!res.success) throw new Error(res.message || "Failed to delete order")
        return
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] }) // Invalidate all orders queries
    },
  })
}
