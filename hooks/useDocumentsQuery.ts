import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { documentsApi } from "@/lib/api/documentsApi"
import type { Document, DocumentType, PaginatedResponse } from "@/types/models"

interface UseDocumentsQueryParams {
  page?: number
  pageSize?: number
  search?: string
  orderId?: string
  documentType?: DocumentType
  enabled?: boolean
}

export function useDocumentsQuery(params: UseDocumentsQueryParams = {}) {
  const { page = 1, pageSize = 10, search = "", orderId = "", documentType, enabled = true } = params

  return useQuery<PaginatedResponse<Document[]>, Error>({
    queryKey: ["documents", { page, pageSize, search, orderId, documentType }],
    queryFn: () => documentsApi.getAllDocuments({ page, pageSize, search, orderId, documentType }),
    placeholderData: (previousData) => previousData,
    enabled: enabled,
  })
}

export function useClientDocumentsQuery(clientId: string | null) {
  return useQuery<{ customerName: string; documents: Document[] }, Error>({
    queryKey: ["clientDocuments", clientId],
    queryFn: () =>
      documentsApi.getClientDocuments(clientId!).then((res) => {
        if (!res.success || !res.data) throw new Error(res.message || "Failed to fetch client documents")
        return res.data
      }),
    enabled: !!clientId,
  })
}

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient()
  return useMutation<
    Document,
    Error,
    { file: File; orderId: string; documentType: DocumentType; uploadedBy: string; notes?: string }
  >({
    mutationFn: ({ file, orderId, documentType, uploadedBy, notes }) =>
      documentsApi.uploadDocument(file, orderId, documentType, uploadedBy, notes).then((res) => {
        if (!res.success || !res.data) throw new Error(res.message || "Failed to upload document")
        return res.data
      }),
    onSuccess: (newDocument) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] }) // Invalidate all documents
      queryClient.invalidateQueries({ queryKey: ["order", newDocument.order_id] }) // Invalidate specific order to refresh its documents
      queryClient.invalidateQueries({ queryKey: ["clientDocuments"] }) // Invalidate client documents
    },
  })
}

export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, { documentId: string; filePath?: string }>({
    mutationFn: ({ documentId, filePath }) =>
      documentsApi.deleteDocument(documentId, filePath).then((res) => {
        if (!res.success) throw new Error(res.message || "Failed to delete document")
        return
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] }) // Invalidate all documents
      queryClient.invalidateQueries({ queryKey: ["order"] }) // Invalidate any order that might have this document
      queryClient.invalidateQueries({ queryKey: ["clientDocuments"] }) // Invalidate client documents
    },
  })
}
