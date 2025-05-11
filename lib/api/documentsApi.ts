import { apiClient } from "./apiClient"
import type { Document, ApiResponse, PaginatedResponse } from "@/types/models"

// Documents API service
export const documentsApi = {
  // Get all documents with optional filtering
  async getDocuments(params?: {
    page?: number
    pageSize?: number
    type?: string
    orderId?: string
    search?: string
  }): Promise<PaginatedResponse<Document[]>> {
    try {
      return await apiClient.get<PaginatedResponse<Document[]>>("/documents", params)
    } catch (error) {
      console.error("Error fetching documents:", error)
      throw error
    }
  },

  // Get a single document by ID
  async getDocument(id: string): Promise<ApiResponse<Document>> {
    try {
      return await apiClient.get<ApiResponse<Document>>(`/documents/${id}`)
    } catch (error) {
      console.error(`Error fetching document ${id}:`, error)
      throw error
    }
  },

  // Upload a document
  async uploadDocument(
    file: File,
    metadata: {
      orderId: string
      type: string
      name?: string
    },
  ): Promise<ApiResponse<Document>> {
    try {
      return await apiClient.uploadFile<ApiResponse<Document>>("/documents/upload", file, metadata)
    } catch (error) {
      console.error("Error uploading document:", error)
      throw error
    }
  },

  // Delete a document
  async deleteDocument(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<ApiResponse<void>>(`/documents/${id}`)
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error)
      throw error
    }
  },

  // Get client pack documents for an order
  async getClientPackDocuments(orderId: string, freightType?: string): Promise<ApiResponse<Document[]>> {
    try {
      const params: Record<string, string> = {}
      if (freightType) {
        params.freightType = freightType
      }

      return await apiClient.get<ApiResponse<Document[]>>(`/documents/client-pack/${orderId}`, params)
    } catch (error) {
      console.error(`Error fetching client pack documents for order ${orderId}:`, error)
      throw error
    }
  },

  // Process document (OCR, data extraction)
  async processDocument(documentId: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.post<ApiResponse<any>>(`/documents/${documentId}/process`)
    } catch (error) {
      console.error(`Error processing document ${documentId}:`, error)
      throw error
    }
  },
}
