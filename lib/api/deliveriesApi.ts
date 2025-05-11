import { apiClient } from "./apiClient"
import type { Delivery, ApiResponse, PaginatedResponse } from "@/types/models"

// Deliveries API service
export const deliveriesApi = {
  // Get all deliveries with optional filtering
  async getDeliveries(params?: {
    page?: number
    pageSize?: number
    status?: string
    search?: string
  }): Promise<PaginatedResponse<Delivery[]>> {
    try {
      return await apiClient.get<PaginatedResponse<Delivery[]>>("/deliveries", params)
    } catch (error) {
      console.error("Error fetching deliveries:", error)
      throw error
    }
  },

  // Get a single delivery by ID
  async getDelivery(id: string): Promise<ApiResponse<Delivery>> {
    try {
      return await apiClient.get<ApiResponse<Delivery>>(`/deliveries/${id}`)
    } catch (error) {
      console.error(`Error fetching delivery ${id}:`, error)
      throw error
    }
  },

  // Create a new delivery
  async createDelivery(deliveryData: Partial<Delivery>): Promise<ApiResponse<Delivery>> {
    try {
      return await apiClient.post<ApiResponse<Delivery>>("/deliveries", deliveryData)
    } catch (error) {
      console.error("Error creating delivery:", error)
      throw error
    }
  },

  // Update an existing delivery
  async updateDelivery(id: string, deliveryData: Partial<Delivery>): Promise<ApiResponse<Delivery>> {
    try {
      return await apiClient.put<ApiResponse<Delivery>>(`/deliveries/${id}`, deliveryData)
    } catch (error) {
      console.error(`Error updating delivery ${id}:`, error)
      throw error
    }
  },

  // Delete a delivery
  async deleteDelivery(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`/deliveries/${id}`)
    } catch (error) {
      console.error(`Error deleting delivery ${id}:`, error)
      throw error
    }
  },

  // Mark delivery as completed
  async markDeliveryAsCompleted(
    id: string,
    details?: {
      actualDeliveryDate: string
      notes?: string
    },
  ): Promise<ApiResponse<Delivery>> {
    try {
      return await apiClient.post<ApiResponse<Delivery>>(`/deliveries/${id}/complete`, details)
    } catch (error) {
      console.error(`Error marking delivery ${id} as completed:`, error)
      throw error
    }
  },
}
