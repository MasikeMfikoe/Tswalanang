"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Trash2, Eye, Download, Loader2, XCircle } from "lucide-react"
import type { Document, DocumentType } from "@/types/models"
import { useUploadDocumentMutation, useDeleteDocumentMutation, useDocumentsQuery } from "@/hooks/useDocumentsQuery"
import { useToast } from "@/components/ui/use-toast"
import {
  getDocumentTypeOptions,
  isImageFile,
  isPdfFile,
  formatBytes,
  getDocumentStatusVariant,
} from "@/lib/document-utils"
import { useAuth } from "@/contexts/AuthContext"

interface DocumentManagementProps {
  orderId?: string // Optional: if managing documents for a specific order
  initialDocuments?: Document[] // Optional: initial documents if fetched from parent
  showOrderIdColumn?: boolean // Optional: to show order ID column in table
}

export default function DocumentManagement({
  orderId,
  initialDocuments,
  showOrderIdColumn = false,
}: DocumentManagementProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<DocumentType | "">("")
  const [notes, setNotes] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const {
    data: paginatedDocuments,
    isLoading: isLoadingDocuments,
    isError: isDocumentsError,
    error: documentsError,
    refetch: refetchDocuments,
  } = useDocumentsQuery({
    orderId: orderId, // Filter by orderId if provided
    enabled: !initialDocuments, // Only fetch if initialDocuments are not provided
  })

  const documents = initialDocuments || paginatedDocuments?.data || []

  const uploadDocumentMutation = useUploadDocumentMutation()
  const deleteDocumentMutation = useDeleteDocumentMutation()

  useEffect(() => {
    // Clean up preview URL when component unmounts or file changes
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    } else {
      setFile(null)
      setPreviewUrl(null)
    }
  }

  const handleUpload = async () => {
    if (!file || !documentType || !user?.name || !user?.surname) {
      toast({
        title: "Missing Information",
        description: "Please select a file, choose a document type, and ensure user info is available.",
        variant: "destructive",
      })
      return
    }
    if (!orderId) {
      toast({
        title: "Missing Order ID",
        description: "Order ID is required to upload documents. Please select an order first.",
        variant: "destructive",
      })
      return
    }

    try {
      await uploadDocumentMutation.mutateAsync({
        file,
        orderId,
        documentType,
        uploadedBy: `${user.name} ${user.surname}`,
        notes,
      })
      toast({
        title: "Success",
        description: "Document uploaded successfully!",
      })
      // Reset form
      setFile(null)
      setDocumentType("")
      setNotes("")
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      if (!initialDocuments) {
        refetchDocuments() // Refetch if not using initialDocuments prop
      }
    } catch (error) {
      console.error("Error uploading document:", error)
      toast({
        title: "Upload Failed",
        description: `Failed to upload document: ${(error as Error).message}`,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (doc: Document) => {
    if (confirm(`Are you sure you want to delete "${doc.file_name}"?`)) {
      try {
        // Extract path from file_url for Supabase Storage deletion
        const filePath = doc.file_url.split("/storage/v1/object/public/documents/")[1]

        await deleteDocumentMutation.mutateAsync({ documentId: doc.id, filePath: filePath })
        toast({
          title: "Success",
          description: `Document "${doc.file_name}" deleted.`,
        })
        if (!initialDocuments) {
          refetchDocuments() // Refetch if not using initialDocuments prop
        }
      } catch (error) {
        console.error("Error deleting document:", error)
        toast({
          title: "Deletion Failed",
          description: `Failed to delete document: ${(error as Error).message}`,
          variant: "destructive",
        })
      }
    }
  }

  const handleDownload = (fileUrl: string, fileName: string) => {
    // For Supabase public URLs, direct download works.
    // For placeholder.svg, it will open in a new tab.
    window.open(fileUrl, "_blank")
  }

  const handleView = (fileUrl: string) => {
    window.open(fileUrl, "_blank")
  }

  if (isDocumentsError && !initialDocuments) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error loading documents: {documentsError?.message}</p>
        <Button onClick={() => refetchDocuments()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Document Upload Section */}
      <Card className="p-4">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-lg">Upload New Document</CardTitle>
          <CardDescription>Attach relevant files to this order.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="file">File *</Label>
              <Input id="file" type="file" onChange={handleFileChange} ref={fileInputRef} />
              {file && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>
                    {file.name} ({formatBytes(file.size)})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null)
                      setPreviewUrl(null)
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }}
                  >
                    <XCircle className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type *</Label>
              <Select value={documentType} onValueChange={(value) => setDocumentType(value as DocumentType)}>
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {getDocumentTypeOptions().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          {previewUrl && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">File Preview:</h4>
              {isImageFile(file?.name || "") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="File Preview"
                  className="max-w-full h-48 object-contain border rounded-md"
                />
              ) : isPdfFile(file?.name || "") ? (
                <iframe src={previewUrl} className="w-full h-64 border rounded-md" title="PDF Preview"></iframe>
              ) : (
                <p className="text-muted-foreground text-sm">No preview available for this file type.</p>
              )}
            </div>
          )}
          <Button
            onClick={handleUpload}
            disabled={uploadDocumentMutation.isPending || !file || !documentType || !orderId}
          >
            {uploadDocumentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </CardContent>
      </Card>

      {/* Document List Section */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
          <CardDescription>
            All documents associated with {orderId ? `order ${orderId}` : "your account"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDocuments && !initialDocuments ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No documents uploaded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    {showOrderIdColumn && <TableHead>Order ID</TableHead>}
                    <TableHead>Type</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Uploaded At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.file_name}
                      </TableCell>
                      {showOrderIdColumn && <TableCell>{doc.order_id}</TableCell>}
                      <TableCell>{doc.document_type}</TableCell>
                      <TableCell>{doc.uploaded_by}</TableCell>
                      <TableCell>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={getDocumentStatusVariant(doc.status)}>{doc.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(doc.file_url)}
                            title="View Document"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(doc.file_url, doc.file_name)}
                            title="Download Document"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(doc)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete Document"
                            disabled={deleteDocumentMutation.isPending}
                          >
                            {deleteDocumentMutation.isPending &&
                            deleteDocumentMutation.variables?.documentId === doc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
