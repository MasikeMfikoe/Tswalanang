import { apiClient } from "./apiClient"
import type { CourierOrder, ApiResponse, PaginatedResponse, TrackingEvent } from "@/types/models"

// Courier Orders API service
export const courierOrdersApi = {
  // Get all courier orders with optional filtering
  async getCourierOrders(params?: {
    page?: number
    pageSize?: number
    status?: string
    search?: string
  }): Promise<PaginatedResponse<CourierOrder[]>> {
    try {
      return await apiClient.get<PaginatedResponse<CourierOrder[]>>("/courier-orders", params)
    } catch (error) {
      console.error("Error fetching courier orders:", error)
      throw error
    }
  },

  // Get a single courier order by ID
  async getCourierOrder(id: string): Promise<ApiResponse<CourierOrder>> {
    try {
      return await apiClient.get<ApiResponse<CourierOrder>>(`/courier-orders/${id}`)
    } catch (error) {
      console.error(`Error fetching courier order ${id}:`, error)
      throw error
    }
  },

  // Create a new courier order
  async createCourierOrder(orderData: Partial<CourierOrder>): Promise<ApiResponse<CourierOrder>> {
    try {
      return await apiClient.post<ApiResponse<CourierOrder>>("/courier-orders", orderData)
    } catch (error) {
      console.error("Error creating courier order:", error)
      throw error
    }
  },

  // Update an existing courier order
  async updateCourierOrder(id: string, orderData: Partial<CourierOrder>): Promise<ApiResponse<CourierOrder>> {
    try {
      return await apiClient.put<ApiResponse<CourierOrder>>(`/courier-orders/${id}`, orderData)
    } catch (error) {
      console.error(`Error updating courier order ${id}:`, error)
      throw error
    }
  },

  // Delete a courier order
  async deleteCourierOrder(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`/courier-orders/${id}`)
    } catch (error) {
      console.error(`Error deleting courier order ${id}:`, error)
      throw error
    }
  },

  // Get tracking events for a courier order
  async getTrackingEvents(orderId: string): Promise<ApiResponse<TrackingEvent[]>> {
    try {
      return await apiClient.get<ApiResponse<TrackingEvent[]>>(`/courier-orders/${orderId}/tracking`)
    } catch (error) {
      console.error(`Error fetching tracking events for courier order ${orderId}:`, error)
      throw error
    }
  },

  // Add a tracking event to a courier order
  async addTrackingEvent(orderId: string, event: Omit<TrackingEvent, "id">): Promise<ApiResponse<TrackingEvent>> {
    try {
      return await apiClient.post<ApiResponse<TrackingEvent>>(`/courier-orders/${orderId}/tracking`, event)
    } catch (error) {
      console.error(`Error adding tracking event to courier order ${orderId}:`, error)
      throw error
    }
  },
}
