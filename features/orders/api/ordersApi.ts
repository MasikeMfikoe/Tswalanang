// Define types for the Orders feature
export interface Order {
  id: string
  poNumber: string
  supplier: string
  importer: string
  status: string
  cargoStatus: string
  freightType: string
  cargoStatusComment?: string
  // Add other fields as needed
}

// API functions for Orders
export async function fetchOrder(orderId: string): Promise<Order> {
  const response = await fetch(`/api/orders/${orderId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch order")
  }
  return response.json()
}

export async function updateOrder(order: Order): Promise<Order> {
  const response = await fetch(`/api/orders/${order.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  })

  if (!response.ok) {
    throw new Error("Failed to update order")
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
