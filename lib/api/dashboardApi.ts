import { apiClient } from "./apiClient"
import type { ApiResponse, DashboardMetrics } from "@/types/models"

// Dashboard API service
export const dashboardApi = {
  // Get dashboard metrics
  async getDashboardMetrics(params?: {
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<DashboardMetrics>> {
    try {
      return await apiClient.get<ApiResponse<DashboardMetrics>>("/dashboard/metrics", params)
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error)
      throw error
    }
  },
  // Get summary
  getSummary: async () => ({ data: {}, error: null }),
  // Get orders by status
  getOrdersByStatus: async () => ({ data: [], error: null }),
}
