import { supabase } from "@/lib/supabaseClient"
import type { Estimate, ApiResponse, PaginatedResponse } from "@/types/models"

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
      // Start building the query
      let query = supabase.from("estimates").select("*", { count: "exact" })

      // Apply filters
      if (params?.search) {
        query = query.or(`customer_name.ilike.%${params.search}%,id.ilike.%${params.search}%`)
      }

      if (params?.status) {
        query = query.eq("status", params.status)
      }

      if (params?.customerId) {
        query = query.eq("customer_id", params.customerId)
      }

      // Apply sorting
      if (params?.sortBy) {
        const order = params.sortOrder || "desc"
        query = query.order(params.sortBy, { ascending: order === "asc" })
      } else {
        // Default sort by created_at desc
        query = query.order("created_at", { ascending: false })
      }

      // Apply pagination
      const page = params?.page || 1
      const pageSize = params?.pageSize || 10
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      // Execute the query
      const { data, error, count } = await query

      if (error) {
        throw new Error(`Error fetching estimates: ${error.message}`)
      }

      // Transform snake_case to camelCase
      const transformedData = data.map((item) => ({
        id: item.id,
        customerId: item.customer_id,
        customerName: item.customer_name,
        customerEmail: item.customer_email,
        status: item.status,
        freightType: item.freight_type,
        commercialValue: item.commercial_value.toString(),
        customsDuties: item.customs_duties.toString(),
        customsVAT: item.customs_vat,
        handlingFees: item.handling_fees.toString(),
        shippingCost: item.shipping_cost.toString(),
        documentationFee: item.documentation_fee.toString(),
        communicationFee: item.communication_fee.toString(),
        totalDisbursements: item.total_disbursements,
        facilityFee: item.facility_fee,
        agencyFee: item.agency_fee,
        subtotal: item.subtotal,
        vat: item.vat,
        totalAmount: item.total_amount,
        notes: item.notes || "",
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }))

      return {
        data: transformedData,
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
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
      const { data, error } = await supabase.from("estimates").select("*").eq("id", id).single()

      if (error) {
        throw new Error(`Error fetching estimate: ${error.message}`)
      }

      if (!data) {
        throw new Error("Estimate not found")
      }

      // Transform snake_case to camelCase
      const transformedData = {
        id: data.id,
        customerId: data.customer_id,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        status: data.status,
        freightType: data.freight_type,
        commercialValue: data.commercial_value.toString(),
        customsDuties: data.customs_duties.toString(),
        customsVAT: data.customs_vat,
        handlingFees: data.handling_fees.toString(),
        shippingCost: data.shipping_cost.toString(),
        documentationFee: data.documentation_fee.toString(),
        communicationFee: data.communication_fee.toString(),
        totalDisbursements: data.total_disbursements,
        facilityFee: data.facility_fee,
        agencyFee: data.agency_fee,
        subtotal: data.subtotal,
        vat: data.vat,
        totalAmount: data.total_amount,
        notes: data.notes || "",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }

      return {
        data: transformedData,
        success: true,
        message: "Estimate retrieved successfully",
      }
    } catch (error: any) {
      console.error("Error in getEstimateById:", error)
      return {
        data: null as any,
        success: false,
        message: error.message || "Failed to retrieve estimate",
      }
    }
  },

  // Create a new estimate using API route
  async createEstimate(estimateData: any): Promise<ApiResponse<Estimate>> {
    try {
      console.log("Creating estimate via API route:", estimateData)

      const response = await fetch("/api/estimates", {
        method: "POST",
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
      console.log("Estimate created successfully:", result)

      return {
        data: result.data,
        success: true,
        message: "Estimate created successfully",
      }
    } catch (error: any) {
      console.error("Error in createEstimate:", error)
      return {
        data: null as any,
        success: false,
        message: error.message || "Failed to create estimate",
      }
    }
  },

  // Update an existing estimate using API route
  async updateEstimate(id: string, estimateData: any): Promise<ApiResponse<Estimate>> {
    try {
      console.log("Updating estimate via API route:", id, estimateData)

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

      return {
        data: result.data,
        success: true,
        message: "Estimate updated successfully",
      }
    } catch (error: any) {
      console.error("Error in updateEstimate:", error)
      return {
        data: null as any,
        success: false,
        message: error.message || "Failed to update estimate",
      }
    }
  },

  // Delete an estimate
  async deleteEstimate(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.from("estimates").delete().eq("id", id)

      if (error) {
        throw new Error(`Error deleting estimate: ${error.message}`)
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
      const { error } = await supabase.from("estimates").update({ status }).eq("id", id)

      if (error) {
        throw new Error(`Error updating estimate status: ${error.message}`)
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
