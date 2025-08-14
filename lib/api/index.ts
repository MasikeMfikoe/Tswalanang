import { apiClient } from "./apiClient"
import { ordersApi } from "./ordersApi"
import { customersApi } from "./customersApi"
import { documentsApi } from "./documentsApi"
import { deliveriesApi } from "./deliveriesApi"
import { courierOrdersApi } from "./courierOrdersApi"
import { dashboardApi } from "./dashboardApi"
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

// Export individual APIs
export { apiClient, ordersApi, customersApi, documentsApi, deliveriesApi, courierOrdersApi, dashboardApi }
export type { ApiConfig }

// Export all API services as a single object
export const api = {
  client: apiClient,
  orders: ordersApi,
  customers: customersApi,
  documents: documentsApi,
  deliveries: deliveriesApi,
  courierOrders: courierOrdersApi,
  dashboard: dashboardApi,
}
