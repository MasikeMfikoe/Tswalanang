import type { Estimate, ApiResponse, PaginatedResponse } from "@/types/models"

// Helper function to transform database row to frontend format
function transformEstimateFromDB(item: any): Estimate {
  if (!item) {
    throw new Error("Invalid estimate data received from database")
  }

  return {
    id: item.id || "",
    displayId: item.display_id || item.id || "",
    customerId: item.customer_id || "",
    customerName: item.customer_name || "",
    customerEmail: item.customer_email || "",
    status: item.status || "Draft",
    freightType: item.freight_type || "",
    commercialValue: item.commercial_value?.toString() || "0",
    customsDuties: item.customs_duties?.toString() || "0",
    customsVAT: item.customs_vat?.toString() || "0",
    handlingFees: item.handling_fees?.toString() || "0",
    shippingCost: item.shipping_cost?.toString() || "0",
    documentationFee: item.documentation_fee?.toString() || "0",
    communicationFee: item.communication_fee?.toString() || "0",
    totalDisbursements: item.total_disbursements?.toString() || "0",
    facilityFee: item.facility_fee?.toString() || "0",
    agencyFee: item.agency_fee?.toString() || "0",
    subtotal: item.subtotal?.toString() || "0",
    vat: item.vat?.toString() || "0",
    totalAmount: item.total_amount || 0,
    notes: item.notes || "",
    createdAt: item.created_at || new Date().toISOString(),
    updatedAt: item.updated_at,
  }
}

// Estimates API service
export const estimatesApi = {
  // Get all estimates with optional filtering
  async getEstimates(params?: {
    page?: number
    pageSize?: number
    search?: string
    status?: string
    customerId?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
  }): Promise<PaginatedResponse<Estimate[]>> {
    try {
      console.log("getEstimates called with params:", params)

      const searchParams = new URLSearchParams()

      if (params?.page) searchParams.set("page", params.page.toString())
      if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString())
      if (params?.search) searchParams.set("search", params.search)
      if (params?.status) searchParams.set("status", params.status)
      if (params?.customerId) searchParams.set("customerId", params.customerId)
      if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
      if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder)

      const response = await fetch(`/api/estimates?${searchParams.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("API response:", result)

      // Handle different response formats
      if (result.error) {
        throw new Error(result.error)
      }

      // Check if result has the expected structure
      const data = result.data || result || []
      const total = result.total || data.length || 0

      // Transform the data safely
      const transformedData = Array.isArray(data) ? data.map(transformEstimateFromDB) : []

      return {
        data: transformedData,
        total: total,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        totalPages: Math.ceil(total / (params?.pageSize || 10)),
      }
    } catch (error) {
      console.error("Error in getEstimates:", error)
      return {
        data: [],
        total: 0,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        totalPages: 0,
      }
    }
  },

  // Get a single estimate by ID
  async getEstimateById(id: string): Promise<ApiResponse<Estimate>> {
    try {
      console.log("getEstimateById called with id:", id)

      if (!id) {
        throw new Error("Estimate ID is required")
      }

      const response = await fetch(`/api/estimates/${id}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Estimate not found")
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Single estimate API response:", result)

      if (result.error) {
        throw new Error(result.error)
      }

      const data = result.data || result
      if (!data) {
        throw new Error("No estimate data received")
      }

      // Transform snake_case to camelCase
      const transformedData = transformEstimateFromDB(data)

      return {
        data: transformedData,
        success: true,
        message: "Estimate retrieved successfully",
      }
    } catch (error: any) {
      console.error("Error in getEstimateById:", error)
      return {
        data: null,
        success: false,
        message: error.message || "Failed to retrieve estimate",
      }
    }
  },

  // Create a new estimate using API route
  async createEstimate(estimateData: any): Promise<ApiResponse<Estimate>> {
    try {
      console.log("Creating estimate via API route:", estimateData)

      if (!estimateData) {
        throw new Error("Estimate data is required")
      }

      const response = await fetch("/api/estimates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(estimateData),
      })

      const result = await response.json()
      console.log("Create estimate API response:", result)

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }

      if (result.error) {
        throw new Error(result.error)
      }

      const data = result.data || result
      if (!data) {
        throw new Error("No estimate data received after creation")
      }

      // Transform the returned data to include displayId
      const transformedData = transformEstimateFromDB(data)

      return {
        data: transformedData,
        success: true,
        message: "Estimate created successfully",
      }
    } catch (error: any) {
      console.error("Error in createEstimate:", error)
      return {
        data: null,
        success: false,
        message: error.message || "Failed to create estimate",
      }
    }
  },

  // Update an existing estimate using API route
  async updateEstimate(id: string, estimateData: any): Promise<ApiResponse<Estimate>> {
    try {
      console.log("Updating estimate via API route:", id, estimateData)

      if (!id) {
        throw new Error("Estimate ID is required")
      }

      if (!estimateData) {
        throw new Error("Estimate data is required")
      }

      const response = await fetch(`/api/estimates/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(estimateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Estimate updated successfully:", result)

      if (result.error) {
        throw new Error(result.error)
      }

      const data = result.data || result
      if (!data) {
        throw new Error("No estimate data received after update")
      }

      // Transform the returned data to include displayId
      const transformedData = transformEstimateFromDB(data)

      return {
        data: transformedData,
        success: true,
        message: "Estimate updated successfully",
      }
    } catch (error: any) {
      console.error("Error in updateEstimate:", error)
      return {
        data: null,
        success: false,
        message: error.message || "Failed to update estimate",
      }
    }
  },

  // Delete an estimate
  async deleteEstimate(id: string): Promise<ApiResponse<void>> {
    try {
      if (!id) {
        throw new Error("Estimate ID is required")
      }

      const response = await fetch(`/api/estimates/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return {
        data: undefined,
        success: true,
        message: "Estimate deleted successfully",
      }
    } catch (error: any) {
      console.error("Error in deleteEstimate:", error)
      return {
        data: undefined,
        success: false,
        message: error.message || "Failed to delete estimate",
      }
    }
  },

  // Update estimate status
  async updateEstimateStatus(id: string, status: string): Promise<ApiResponse<void>> {
    try {
      if (!id) {
        throw new Error("Estimate ID is required")
      }

      if (!status) {
        throw new Error("Status is required")
      }

      const response = await fetch(`/api/estimates/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return {
        data: undefined,
        success: true,
        message: "Estimate status updated successfully",
      }
    } catch (error: any) {
      console.error("Error in updateEstimateStatus:", error)
      return {
        data: undefined,
        success: false,
        message: error.message || "Failed to update estimate status",
      }
    }
  },
}

// Export individual functions for convenience
export const getEstimates = estimatesApi.getEstimates
export const getEstimateById = estimatesApi.getEstimateById
export const createEstimate = estimatesApi.createEstimate
export const updateEstimate = estimatesApi.updateEstimate
export const deleteEstimate = estimatesApi.deleteEstimate
export const updateEstimateStatus = estimatesApi.updateEstimateStatus
