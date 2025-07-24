export * from "./apiClient"
export * from "./ordersApi"
export * from "./customersApi"
export * from "./documentsApi"
export * from "./deliveriesApi"
export * from "./courierOrdersApi"
export * from "./dashboardApi"
export * from "./estimatesApi"

// Re-export all API services as a single object
import { apiClient } from "./apiClient"
import { ordersApi } from "./ordersApi"
import { customersApi } from "./customersApi"
import { documentsApi } from "./documentsApi"
import { deliveriesApi } from "./deliveriesApi"
import { courierOrdersApi } from "./courierOrdersApi"
import { dashboardApi } from "./dashboardApi"
import { estimatesApi } from "./estimatesApi"
import type { ApiConfig } from "./apiClient"

// Update the default configuration to handle missing API URL
const defaultConfig: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 30000, // 30 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  headers: {
    "Content-Type": "application/json",
  },
}

export const api = {
  client: apiClient,
  orders: ordersApi,
  customers: customersApi,
  documents: documentsApi,
  deliveries: deliveriesApi,
  courierOrders: courierOrdersApi,
  dashboard: dashboardApi,
  estimates: estimatesApi,
}
