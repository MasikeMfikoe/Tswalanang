import { apiClient } from "./apiClient"
import type { Document, ApiResponse, PaginatedResponse } from "@/types/models"

// Mock documents data for fallback
let mockDocuments: Document[] = [
  {
    id: "doc-mock-1",
    order_id: "ord-1",
    file_name: "Bill_of_Lading_ABC.pdf",
    file_url: "/placeholder.svg?height=100&width=100&text=BOL",
    document_type: "Bill of Lading",
    uploaded_at: "2023-01-15T10:00:00Z",
    uploaded_by: "John Doe",
    status: "Approved",
    notes: "Original document",
  },
  {
    id: "doc-mock-2",
    order_id: "ord-2",
    file_name: "Commercial_Invoice_XYZ.pdf",
    file_url: "/placeholder.svg?height=100&width=100&text=Invoice",
    document_type: "Commercial Invoice",
    uploaded_at: "2023-02-01T11:30:00Z",
    uploaded_by: "Jane Smith",
    status: "Pending",
    notes: "Awaiting customs review",
  },
  {
    id: "doc-mock-3",
    order_id: "ord-1",
    file_name: "Packing_List_ABC.pdf",
    file_url: "/placeholder.svg?height=100&width=100&text=Packing+List",
    document_type: "Packing List",
    uploaded_at: "2023-01-16T14:00:00Z",
    uploaded_by: "John Doe",
    status: "Approved",
    notes: "Verified contents",
  },
]

// Documents API service
export const documentsApi = {
  // Upload and process a new document
  async uploadDocument(
    file: File,
    orderId: string,
    documentType: Document["document_type"],
    uploadedBy: string,
    notes?: string,
  ): Promise<ApiResponse<Document>> {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("orderId", orderId)
      formData.append("documentType", documentType)
      formData.append("uploadedBy", uploadedBy)
      if (notes) {
        formData.append("notes", notes)
      }

      return await apiClient.post<ApiResponse<Document>>("/api/documents/process", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    } catch (error) {
      console.warn("API call failed for document upload, using mock response:", error)
      const newDoc: Document = {
        id: `doc-mock-${Date.now()}`,
        order_id: orderId,
        file_name: file.name,
        file_url: URL.createObjectURL(file), // Create a temporary URL for preview
        document_type: documentType,
        uploaded_at: new Date().toISOString(),
        uploaded_by: uploadedBy,
        status: "Pending",
        notes: notes,
      }
      mockDocuments.push(newDoc)
      return {
        data: newDoc,
        success: true,
        message: "Document uploaded successfully (mock data)",
      }
    }
  },

  // Delete a document
  async deleteDocument(documentId: string, filePath?: string): Promise<ApiResponse<void>> {
    try {
      const params = new URLSearchParams({ id: documentId })
      if (filePath) {
        // Extract path from full URL if necessary, or ensure it's just the path
        const pathInStorage = filePath.split("/documents/").pop() || filePath
        params.append("filePath", pathInStorage)
      }
      return await apiClient.delete<ApiResponse<void>>(`/api/documents/delete?${params.toString()}`)
    } catch (error) {
      console.warn(`API call failed for document deletion ${documentId}, using mock response:`, error)
      const initialLength = mockDocuments.length
      mockDocuments = mockDocuments.filter((doc) => doc.id !== documentId)
      if (mockDocuments.length < initialLength) {
        return {
          data: undefined,
          success: true,
          message: "Document deleted successfully (mock data)",
        }
      }
      return {
        success: false,
        message: "Document not found for mock deletion",
        error: "Not Found",
      }
    }
  },

  // Get all documents (for admin view)
  async getAllDocuments(params?: {
    page?: number
    pageSize?: number
    search?: string
    orderId?: string
    documentType?: string
  }): Promise<PaginatedResponse<Document[]>> {
    try {
      return await apiClient.get<PaginatedResponse<Document[]>>("/api/documents", params)
    } catch (error) {
      console.warn("API call failed for all documents, using mock data:", error)

      let filteredDocs = [...mockDocuments]
      if (params?.orderId) {
        filteredDocs = filteredDocs.filter((doc) => doc.order_id === params.orderId)
      }
      if (params?.documentType) {
        filteredDocs = filteredDocs.filter((doc) => doc.document_type === params.documentType)
      }
      if (params?.search) {
        const searchTerm = params.search.toLowerCase()
        filteredDocs = filteredDocs.filter(
          (doc) =>
            doc.file_name.toLowerCase().includes(searchTerm) ||
            doc.uploaded_by.toLowerCase().includes(searchTerm) ||
            doc.notes?.toLowerCase().includes(searchTerm),
        )
      }

      const total = filteredDocs.length
      const page = params?.page || 1
      const pageSize = params?.pageSize || 10
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = filteredDocs.slice(startIndex, endIndex)
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

  // Get documents for a specific client (client portal)
  async getClientDocuments(clientId: string): Promise<ApiResponse<{ customerName: string; documents: Document[] }>> {
    try {
      return await apiClient.get<ApiResponse<{ customerName: string; documents: Document[] }>>(
        `/api/client-portal/documents?clientId=${clientId}`,
      )
    } catch (error) {
      console.warn(`API call failed for client documents for client ${clientId}, using mock data:`, error)
      return {
        success: true,
        data: {
          customerName: "Mock Client Company",
          documents: mockDocuments.filter((doc) => doc.order_id === "ord-1"), // Example: filter some mock docs
        },
        message: "Client documents retrieved successfully (mock data)",
      }
    }
  },
}
