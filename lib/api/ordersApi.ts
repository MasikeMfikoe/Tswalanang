import { apiClient } from "./apiClient"
import type { Order, ApiResponse, PaginatedResponse } from "@/types/models"

const API_BASE_URL = "/api/orders"

// Mock orders data for fallback
let mockOrders: Order[] = [
  {
    id: "ord-1",
    customer_id: "1",
    customer_name: "ABC Trading Company",
    po_number: "PO-2023-001",
    order_date: "2023-01-15",
    status: "In Transit",
    freight_type: "Ocean",
    origin_address: {
      street: "100 Ocean Dr",
      city: "Shanghai",
      postalCode: "200000",
      country: "China",
    },
    destination_address: {
      street: "123 Business Ave",
      city: "New York",
      postalCode: "10001",
      country: "USA",
    },
    total_value: 50000,
    currency: "USD",
    expected_delivery_date: "2023-02-28",
    actual_delivery_date: null,
    tracking_number: "ABC123456789",
    notes: "Container XYZ987",
    created_at: "2023-01-10T10:00:00Z",
    updated_at: "2023-02-10T14:30:00Z",
    documents: [
      {
        id: "doc-1",
        order_id: "ord-1",
        file_name: "Bill_of_Lading_PO-2023-001.pdf",
        file_url: "/placeholder.svg?height=100&width=100&text=BOL",
        document_type: "Bill of Lading",
        uploaded_at: "2023-01-12T09:00:00Z",
        uploaded_by: "Admin User",
        status: "Approved",
      },
    ],
  },
  {
    id: "ord-2",
    customer_id: "2",
    customer_name: "Global Imports Ltd",
    po_number: "PO-2023-002",
    order_date: "2023-02-01",
    status: "Processing",
    freight_type: "Air",
    origin_address: {
      street: "200 Air Cargo Rd",
      city: "Frankfurt",
      postalCode: "60549",
      country: "Germany",
    },
    destination_address: {
      street: "456 Commerce St",
      city: "Los Angeles",
      postalCode: "90210",
      country: "USA",
    },
    total_value: 15000,
    currency: "EUR",
    expected_delivery_date: "2023-02-10",
    actual_delivery_date: null,
    tracking_number: "DEF987654321",
    notes: "Urgent shipment",
    created_at: "2023-01-28T11:00:00Z",
    updated_at: "2023-02-01T10:00:00Z",
    documents: [],
  },
  {
    id: "ord-3",
    customer_id: "1",
    customer_name: "ABC Trading Company",
    po_number: "PO-2023-003",
    order_date: "2023-03-05",
    status: "Completed",
    freight_type: "Road",
    origin_address: {
      street: "300 Warehouse Ln",
      city: "Chicago",
      postalCode: "60601",
      country: "USA",
    },
    destination_address: {
      street: "500 Retail Pkwy",
      city: "Miami",
      postalCode: "33101",
      country: "USA",
    },
    total_value: 5000,
    currency: "USD",
    expected_delivery_date: "2023-03-10",
    actual_delivery_date: "2023-03-09",
    tracking_number: "GHI112233445",
    notes: "Local delivery",
    created_at: "2023-03-01T08:00:00Z",
    updated_at: "2023-03-09T16:00:00Z",
    documents: [
      {
        id: "doc-2",
        order_id: "ord-3",
        file_name: "Proof_of_Delivery_PO-2023-003.pdf",
        file_url: "/placeholder.svg?height=100&width=100&text=POD",
        document_type: "Proof of Delivery",
        uploaded_at: "2023-03-09T16:05:00Z",
        uploaded_by: "Delivery Driver",
        status: "Approved",
      },
    ],
  },
]

// Orders API service
export const ordersApi = {
  // Get all orders with optional filtering and pagination
  async getOrders(params?: {
    page?: number
    pageSize?: number
    search?: string
    status?: string
    customerId?: string
  }): Promise<PaginatedResponse<Order[]>> {
    try {
      return await apiClient.get<PaginatedResponse<Order[]>>("/api/orders", params)
    } catch (error) {
      console.warn("API call failed, using mock orders data:", error)

      // Filter mock data based on params
      let filteredOrders = [...mockOrders]

      if (params?.search) {
        const searchTerm = params.search.toLowerCase()
        filteredOrders = filteredOrders.filter(
          (order) =>
            order.po_number.toLowerCase().includes(searchTerm) ||
            order.customer_name.toLowerCase().includes(searchTerm) ||
            order.origin_address.city.toLowerCase().includes(searchTerm) ||
            order.destination_address.city.toLowerCase().includes(searchTerm),
        )
      }

      if (params?.status) {
        filteredOrders = filteredOrders.filter((order) => order.status === params.status)
      }

      if (params?.customerId) {
        filteredOrders = filteredOrders.filter((order) => order.customer_id === params.customerId)
      }

      const total = filteredOrders.length
      const page = params?.page || 1
      const pageSize = params?.pageSize || 10
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = filteredOrders.slice(startIndex, endIndex)
      const totalPages = Math.ceil(total / pageSize)

      return {
        data: paginatedData,
        total: total,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
      }
    }
  },

  // Get a single order by ID
  async getOrder(id: string): Promise<ApiResponse<Order>> {
    try {
      return await apiClient.get<ApiResponse<Order>>(`/api/orders/${id}`)
    } catch (error) {
      console.warn(`API call failed for order ${id}, using mock data:`, error)

      const order = mockOrders.find((o) => o.id === id) || mockOrders[0]
      return {
        data: order,
        success: true,
        message: "Order retrieved successfully (mock data)",
      }
    }
  },

  // Create a new order
  async createOrder(orderData: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      return await apiClient.post<ApiResponse<Order>>("/api/orders", orderData)
    } catch (error) {
      console.warn("API call failed for order creation, using mock response:", error)

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        customer_id: orderData.customer_id || "mock-customer",
        customer_name: orderData.customer_name || "Mock Customer",
        po_number: orderData.po_number || `PO-${Date.now()}`,
        order_date: orderData.order_date || new Date().toISOString().split("T")[0],
        status: orderData.status || "Pending",
        freight_type: orderData.freight_type || "Ocean",
        origin_address: orderData.origin_address || {
          street: "Mock Origin St",
          city: "Mock City",
          postalCode: "00000",
          country: "Mockland",
        },
        destination_address: orderData.destination_address || {
          street: "Mock Dest St",
          city: "Mock City",
          postalCode: "00000",
          country: "Mockland",
        },
        total_value: orderData.total_value || 0,
        currency: orderData.currency || "USD",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        documents: [],
      }
      mockOrders.push(newOrder) // Add to mock data for subsequent calls
      return {
        data: newOrder,
        success: true,
        message: "Order created successfully (mock data)",
      }
    }
  },

  // Update an existing order
  async updateOrder(id: string, orderData: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      return await apiClient.put<ApiResponse<Order>>(`/api/orders/${id}`, orderData)
    } catch (error) {
      console.warn(`API call failed for order update ${id}, using mock response:`, error)

      const orderIndex = mockOrders.findIndex((o) => o.id === id)
      if (orderIndex !== -1) {
        mockOrders[orderIndex] = { ...mockOrders[orderIndex], ...orderData, updated_at: new Date().toISOString() }
        return {
          data: mockOrders[orderIndex],
          success: true,
          message: "Order updated successfully (mock data)",
        }
      }
      return {
        success: false,
        message: "Order not found for mock update",
        error: "Not Found",
      }
    }
  },

  // Delete an order
  async deleteOrder(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`/api/orders/${id}`)
    } catch (error) {
      console.warn(`API call failed for order deletion ${id}, using mock response:`, error)

      const initialLength = mockOrders.length
      mockOrders = mockOrders.filter((o) => o.id !== id)
      if (mockOrders.length < initialLength) {
        return {
          data: undefined,
          success: true,
          message: "Order deleted successfully (mock data)",
        }
      }
      return {
        success: false,
        message: "Order not found for mock deletion",
        error: "Not Found",
      }
    }
  },
}
