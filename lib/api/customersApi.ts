import { apiClient } from "./apiClient"
import type { Customer, ApiResponse, PaginatedResponse, Order, RateItem } from "@/types/models"

// Customers API service
export const customersApi = {
  // Get all customers with optional filtering
  async getCustomers(params?: {
    page?: number
    pageSize?: number
    search?: string
  }): Promise<PaginatedResponse<Customer[]>> {
    try {
      return await apiClient.get<PaginatedResponse<Customer[]>>("/customers", params)
    } catch (error) {
      console.error("Error fetching customers:", error)
      throw error
    }
  },

  // Get a single customer by ID
  async getCustomer(id: string): Promise<ApiResponse<Customer>> {
    try {
      return await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`)
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error)
      throw error
    }
  },

  // Create a new customer
  async createCustomer(customerData: Partial<Customer>): Promise<ApiResponse<Customer>> {
    try {
      return await apiClient.post<ApiResponse<Customer>>("/customers", customerData)
    } catch (error) {
      console.error("Error creating customer:", error)
      throw error
    }
  },

  // Update an existing customer
  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<ApiResponse<Customer>> {
    try {
      return await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, customerData)
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error)
      throw error
    }
  },

  // Delete a customer
  async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`/customers/${id}`)
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error)
      throw error
    }
  },

  // Get orders for a customer
  async getCustomerOrders(
    customerId: string,
    params?: {
      page?: number
      pageSize?: number
      status?: string
    },
  ): Promise<PaginatedResponse<Order[]>> {
    try {
      return await apiClient.get<PaginatedResponse<Order[]>>(`/customers/${customerId}/orders`, params)
    } catch (error) {
      console.error(`Error fetching orders for customer ${customerId}:`, error)
      throw error
    }
  },

  // Get rate card for a customer
  async getCustomerRateCard(customerId: string): Promise<ApiResponse<RateItem[]>> {
    try {
      return await apiClient.get<ApiResponse<RateItem[]>>(`/customers/${customerId}/rate-card`)
    } catch (error) {
      console.error(`Error fetching rate card for customer ${customerId}:`, error)
      throw error
    }
  },

  // Update rate card for a customer
  async updateCustomerRateCard(customerId: string, rateItems: RateItem[]): Promise<ApiResponse<RateItem[]>> {
    try {
      return await apiClient.put<ApiResponse<RateItem[]>>(`/customers/${customerId}/rate-card`, rateItems)
    } catch (error) {
      console.error(`Error updating rate card for customer ${customerId}:`, error)
      throw error
    }
  },
}
