"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { documentsApi } from "@/lib/api/documentsApi"
import { useToast } from "@/components/ui/use-toast"

// Query keys
export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (filters: any) => [...documentKeys.lists(), filters] as const,
  details: () => [...documentKeys.all, "detail"] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  clientPack: (orderId: string) => [...documentKeys.all, "client-pack", orderId] as const,
}

// Get all documents
export function useDocuments(params?: {
  page?: number
  pageSize?: number
  type?: string
  orderId?: string
  search?: string
}) {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => documentsApi.getDocuments(params),
  })
}

// Get a single document
export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentsApi.getDocument(id),
    enabled: !!id,
  })
}

// Get client pack documents
export function useClientPackDocuments(orderId: string, freightType?: string) {
  return useQuery({
    queryKey: documentKeys.clientPack(orderId),
    queryFn: () => documentsApi.getClientPackDocuments(orderId, freightType),
    enabled: !!orderId,
  })
}

// Upload document mutation
export function useUploadDocument() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ file, metadata }: { file: File; metadata: { orderId: string; type: string; name?: string } }) =>
      documentsApi.uploadDocument(file, metadata),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.list({ orderId: variables.metadata.orderId }) })
      queryClient.invalidateQueries({ queryKey: documentKeys.clientPack(variables.metadata.orderId) })
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      })
    },
  })
}

// Delete document mutation
export function useDeleteDocument() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, orderId }: { id: string; orderId: string }) => documentsApi.deleteDocument(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.list({ orderId: variables.orderId }) })
      queryClient.invalidateQueries({ queryKey: documentKeys.clientPack(variables.orderId) })
      toast({
        title: "Success",
        description: "Document deleted successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      })
    },
  })
}

// Process document mutation
export function useProcessDocument() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ documentId, orderId }: { documentId: string; orderId: string }) =>
      documentsApi.processDocument(documentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(variables.documentId) })
      toast({
        title: "Success",
        description: "Document processed successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process document",
        variant: "destructive",
      })
    },
  })
}
