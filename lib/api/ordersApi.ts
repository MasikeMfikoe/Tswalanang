import { apiClient } from "./apiClient"
import type { Order, ApiResponse, PaginatedResponse, CargoStatusHistoryEntry, FreightType } from "@/types/models"

// Orders API service
export const ordersApi = {
  // Get all orders with optional filtering
  async getOrders(params?: {
    page?: number
    pageSize?: number
    status?: string
    customerId?: string
    search?: string
    startDate?: string
    endDate?: string
  }): Promise<PaginatedResponse<Order[]>> {
    try {
      return await apiClient.get<PaginatedResponse<Order[]>>("/orders", params)
    } catch (error) {
      console.error("Error fetching orders:", error)
      throw error
    }
  },

  // Get a single order by ID
  async getOrder(id: string): Promise<ApiResponse<Order>> {
    try {
      return await apiClient.get<ApiResponse<Order>>(`/orders/${id}`)
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error)
      throw error
    }
  },

  // Create a new order
  async createOrder(orderData: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      return await apiClient.post<ApiResponse<Order>>("/orders", orderData)
    } catch (error) {
      console.error("Error creating order:", error)
      throw error
    }
  },

  // Update an existing order
  async updateOrder(id: string, orderData: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      return await apiClient.put<ApiResponse<Order>>(`/orders/${id}`, orderData)
    } catch (error) {
      console.error(`Error updating order ${id}:`, error)
      throw error
    }
  },

  // Delete an order
  async deleteOrder(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`/orders/${id}`)
    } catch (error) {
      console.error(`Error deleting order ${id}:`, error)
      throw error
    }
  },

  // Get cargo status history for an order
  async getCargoStatusHistory(orderId: string): Promise<ApiResponse<CargoStatusHistoryEntry[]>> {
    try {
      return await apiClient.get<ApiResponse<CargoStatusHistoryEntry[]>>(`/orders/${orderId}/cargo-status-history`)
    } catch (error) {
      console.error(`Error fetching cargo status history for order ${orderId}:`, error)
      throw error
    }
  },

  // Update cargo status for an order
  async updateCargoStatus(
    orderId: string,
    status: string,
    comment?: string,
  ): Promise<ApiResponse<CargoStatusHistoryEntry>> {
    try {
      return await apiClient.post<ApiResponse<CargoStatusHistoryEntry>>(`/orders/${orderId}/cargo-status`, {
        status,
        comment,
      })
    } catch (error) {
      console.error(`Error updating cargo status for order ${orderId}:`, error)
      throw error
    }
  },

  // Mark order as completed (payment received)
  async markOrderAsCompleted(orderId: string): Promise<ApiResponse<Order>> {
    try {
      return await apiClient.post<ApiResponse<Order>>(`/orders/${orderId}/complete`)
    } catch (error) {
      console.error(`Error marking order ${orderId} as completed:`, error)
      throw error
    }
  },

  // Get all freight types
  async getFreightTypes(): Promise<ApiResponse<FreightType[]>> {
    try {
      return await apiClient.get<ApiResponse<FreightType[]>>("/freight-types")
    } catch (error) {
      console.error("Error fetching freight types:", error)

      // Optional harmless fallback for development so the form still works
      return {
        data: [
          { id: "sea", name: "Sea Freight" },
          { id: "air", name: "Air Freight" },
        ] as unknown as FreightType[],
        message: "Using local fallback freight types",
        success: true,
      }
    }
  },
}
