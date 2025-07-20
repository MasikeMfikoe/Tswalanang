import type { Order } from "@/types/models" // Assuming you have a types/models.ts file

interface FetchOrdersResponse {
  data: Order[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function fetchOrders(
  page = 1,
  limit = 10,
  status?: string,
  customerId?: string,
  query?: string,
): Promise<FetchOrdersResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })
  if (status) params.append("status", status)
  if (customerId) params.append("customerId", customerId)
  if (query) params.append("query", query)

  const response = await fetch(`/api/orders?${params.toString()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch orders")
  }
  return response.json()
}

export async function fetchOrderById(id: string): Promise<Order> {
  const response = await fetch(`/api/orders/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch order with ID ${id}`)
  }
  return response.json()
}

export async function createOrder(orderData: Omit<Order, "id">): Promise<Order> {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
  if (!response.ok) {
    throw new Error("Failed to create order")
  }
  return response.json()
}

export async function updateOrder(id: string, orderData: Partial<Order>): Promise<Order> {
  const response = await fetch(`/api/orders/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
  if (!response.ok) {
    throw new Error(`Failed to update order with ID ${id}`)
  }
  return response.json()
}

export async function deleteOrder(id: string): Promise<{ message: string }> {
  const response = await fetch(`/api/orders/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error(`Failed to delete order with ID ${id}`)
  }
  return response.json()
}
