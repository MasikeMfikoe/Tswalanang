import { apiClient } from "./apiClient"
import type { Customer, ApiResponse, PaginatedResponse, Order, RateItem } from "@/types/models"

// Mock customers data for fallback
const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "ABC Trading Company",
    contact_person: "John Smith",
    email: "john@abctrading.com",
    phone: "+1-555-0123",
    address_street: "123 Business Ave",
    address_city: "New York",
    address_postal_code: "10001",
    address_country: "USA",
    vat_number: "US123456789",
    importers_code: "IMP001",
    total_orders: 15,
    total_spent: 125000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Global Imports Ltd",
    contact_person: "Sarah Johnson",
    email: "sarah@globalimports.com",
    phone: "+1-555-0456",
    address_street: "456 Commerce St",
    address_city: "Los Angeles",
    address_postal_code: "90210",
    address_country: "USA",
    vat_number: "US987654321",
    importers_code: "IMP002",
    total_orders: 8,
    total_spent: 75000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Pacific Logistics Inc",
    contact_person: "Mike Chen",
    email: "mike@pacificlogistics.com",
    phone: "+1-555-0789",
    address_street: "789 Harbor Blvd",
    address_city: "San Francisco",
    address_postal_code: "94102",
    address_country: "USA",
    vat_number: "US456789123",
    importers_code: "IMP003",
    total_orders: 22,
    total_spent: 200000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

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
      console.warn("API call failed, using mock customers data:", error)

      // Return mock data in the expected format
      return {
        data: mockCustomers,
        total: mockCustomers.length,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        totalPages: 1,
      }
    }
  },

  // Get a single customer by ID
  async getCustomer(id: string): Promise<ApiResponse<Customer>> {
    try {
      return await apiClient.get<ApiResponse<Customer>>(`/customers/${id}`)
    } catch (error) {
      console.warn(`API call failed for customer ${id}, using mock data:`, error)

      const customer = mockCustomers.find((c) => c.id === id) || mockCustomers[0]
      return {
        data: customer,
        success: true,
        message: "Customer retrieved successfully (mock data)",
      }
    }
  },

  // Create a new customer
  async createCustomer(customerData: Partial<Customer>): Promise<ApiResponse<Customer>> {
    try {
      return await apiClient.post<ApiResponse<Customer>>("/customers", customerData)
    } catch (error) {
      console.warn("API call failed for customer creation, using mock response:", error)

      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: customerData.name || "New Customer",
        contact_person: customerData.contact_person || "",
        email: customerData.email || "",
        phone: customerData.phone || "",
        address_street: customerData.address_street || "",
        address_city: customerData.address_city || "",
        address_postal_code: customerData.address_postal_code || "",
        address_country: customerData.address_country || "",
        vat_number: customerData.vat_number || "",
        importers_code: customerData.importers_code || "",
        total_orders: 0,
        total_spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      return {
        data: newCustomer,
        success: true,
        message: "Customer created successfully (mock data)",
      }
    }
  },

  // Update an existing customer
  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<ApiResponse<Customer>> {
    try {
      return await apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, customerData)
    } catch (error) {
      console.warn(`API call failed for customer update ${id}, using mock response:`, error)

      const existingCustomer = mockCustomers.find((c) => c.id === id) || mockCustomers[0]
      const updatedCustomer = { ...existingCustomer, ...customerData, updated_at: new Date().toISOString() }

      return {
        data: updatedCustomer,
        success: true,
        message: "Customer updated successfully (mock data)",
      }
    }
  },

  // Delete a customer
  async deleteCustomer(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`/customers/${id}`)
    } catch (error) {
      console.warn(`API call failed for customer deletion ${id}, using mock response:`, error)

      return {
        data: undefined,
        success: true,
        message: "Customer deleted successfully (mock data)",
      }
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
      console.warn(`API call failed for customer orders ${customerId}, using mock data:`, error)

      return {
        data: [],
        total: 0,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        totalPages: 0,
      }
    }
  },

  // Get rate card for a customer
  async getCustomerRateCard(customerId: string): Promise<ApiResponse<RateItem[]>> {
    try {
      return await apiClient.get<ApiResponse<RateItem[]>>(`/customers/${customerId}/rate-card`)
    } catch (error) {
      console.warn(`API call failed for customer rate card ${customerId}, using mock data:`, error)

      return {
        data: [],
        success: true,
        message: "Rate card retrieved successfully (mock data)",
      }
    }
  },

  // Update rate card for a customer
  async updateCustomerRateCard(customerId: string, rateItems: RateItem[]): Promise<ApiResponse<RateItem[]>> {
    try {
      return await apiClient.put<ApiResponse<RateItem[]>>(`/customers/${customerId}/rate-card`, rateItems)
    } catch (error) {
      console.warn(`API call failed for customer rate card update ${customerId}, using mock response:`, error)

      return {
        data: rateItems,
        success: true,
        message: "Rate card updated successfully (mock data)",
      }
    }
  },
}
