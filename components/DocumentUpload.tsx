"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, Loader2, X, Eye, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import mockStorage from "@/lib/mock-storage"

interface DocumentType {
  id: string
  name: string
}

interface UploadedDocument {
  id: string
  name: string
  type: string
  url: string
  size: number
  uploadedAt: string
  order_id?: string
}

export function DocumentUpload({
  isEditing,
  orderId,
  poNumber,
}: { isEditing: boolean; orderId: string; poNumber?: string }) {
  const { toast } = useToast()
  const [dragActive, setDragActive] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<UploadedDocument | null>(null)
  const [checklistKey, setChecklistKey] = useState(0)

  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([
    { id: "ANF", name: "ANF" },
    { id: "cargo", name: "Cargo Dues" },
    { id: "customs", name: "Customs Worksheet" },
    { id: "delivery-instruction", name: "Delivery Instruction" },
    { id: "edi", name: "EDI" },
    { id: "invoice", name: "Commercial Invoice" },
    { id: "lading", name: "Bill of Lading" },
    { id: "release-letter", name: "Release Letter" },
    { id: "sad500", name: "SAD500" },
    { id: "sars", name: "SARS POP" },
    { id: "shipping-invoice", name: "Shipping Invoice" },
    { id: "shipping-pop", name: "Shipping POP" },
  ])

  const [selectedType, setSelectedType] = useState<string>("")
  const [newDocumentName, setNewDocumentName] = useState("")
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Debug: Log component props
  useEffect(() => {
    console.log("[v0] DocumentUpload component loaded with:", { isEditing, orderId, poNumber })
  }, [isEditing, orderId, poNumber])

  useEffect(() => {
    if (orderId) {
      fetchDocuments()
    }
  }, [orderId])

  const fetchDocuments = async () => {
    try {
      setIsLoading(true)
      console.log("[v0] Fetching documents for order:", orderId)

      const result = await mockStorage.getDocuments(orderId)
      console.log("[v0] Fetched documents from mock storage:", result.data)

      const formattedDocs: UploadedDocument[] = (result.data || []).map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        url: doc.url,
        size: doc.size || 0,
        uploadedAt: doc.created_at,
        order_id: doc.order_id,
      }))

      setUploadedDocuments(formattedDocs)
      console.log("[v0] Updated uploaded documents state:", formattedDocs)

      // Force checklist to re-render
      setChecklistKey((prev) => prev + 1)
    } catch (error) {
      console.error("[v0] Exception fetching documents:", error)
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(true)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleMultipleFileUpload(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleMultipleFileUpload(Array.from(e.target.files))
    }
  }

  const handleMultipleFileUpload = async (files: File[]) => {
    if (!selectedType) {
      console.log("[v0] No document type selected")
      toast({
        title: "Error",
        description: "Please select a document type before uploading",
        variant: "destructive",
      })
      return
    }

    if (!orderId) {
      console.log("[v0] No order ID provided")
      toast({
        title: "Error",
        description: "Order ID is required to upload documents",
        variant: "destructive",
      })
      return
    }

    // Check file sizes
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast({
        title: "Error",
        description: `${oversizedFiles.length} file(s) exceed the 5MB limit`,
        variant: "destructive",
      })
      return
    }

    console.log(`[v0] Starting upload of ${files.length} files`)
    setIsUploading(true)
    setUploadProgress(0)

    const successfulUploads: UploadedDocument[] = []
    const failedUploads: string[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        console.log(`[v0] Uploading file ${i + 1}/${files.length}: ${file.name}`)

        try {
          // Create unique filename
          const fileExt = file.name.split(".").pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
          const filePath = `documents/${fileName}`

          const documentType = documentTypes.find((type) => type.id === selectedType)?.name || selectedType
          const uploadResult = await mockStorage.upload(file, filePath, orderId, documentType, poNumber)

          if (uploadResult.data) {
            const newDoc: UploadedDocument = {
              id: uploadResult.data.id,
              name: uploadResult.data.name,
              type: uploadResult.data.type,
              url: uploadResult.data.url,
              size: file.size,
              uploadedAt: uploadResult.data.created_at,
              order_id: uploadResult.data.order_id,
            }
            successfulUploads.push(newDoc)
            console.log(`[v0] Successfully uploaded: ${file.name}`)
          }
        } catch (error) {
          console.error(`[v0] Failed to upload ${file.name}:`, error)
          failedUploads.push(file.name)
        }

        // Update progress
        setUploadProgress(Math.round(((i + 1) / files.length) * 100))
      }

      // Update local state with successful uploads
      if (successfulUploads.length > 0) {
        setUploadedDocuments((prev) => [...successfulUploads, ...prev])
        console.log(`[v0] Added ${successfulUploads.length} documents to local state`)
      }

      // Show results
      if (successfulUploads.length === files.length) {
        toast({
          title: "Success",
          description: `All ${files.length} document(s) uploaded successfully`,
        })
      } else if (successfulUploads.length > 0) {
        toast({
          title: "Partial Success",
          description: `${successfulUploads.length} of ${files.length} documents uploaded successfully`,
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to upload any documents",
          variant: "destructive",
        })
      }

      if (failedUploads.length > 0) {
        console.log("[v0] Failed uploads:", failedUploads)
      }

      setSelectedType("")
      setChecklistKey((prev) => prev + 1)
    } catch (error: any) {
      console.error("[v0] Multiple upload error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload documents. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDeleteDocument = async (document: UploadedDocument) => {
    try {
      console.log("[v0] Starting deletion process for document:", document.id)

      // Show loading state
      toast({
        title: "Deleting document...",
        description: `Removing ${document.name}`,
      })

      await mockStorage.delete(document.id)
      console.log("[v0] Document deleted from mock storage")

      // Update local state immediately
      setUploadedDocuments((prev) => {
        const newDocs = prev.filter((doc) => doc.id !== document.id)
        console.log("[v0] Updated documents state after deletion:", newDocs.length, "documents remaining")
        return newDocs
      })

      // Force checklist to re-render
      setChecklistKey((prev) => prev + 1)

      toast({
        title: "Success",
        description: "Document deleted successfully",
      })

      console.log("[v0] Document deletion completed successfully")
    } catch (error: any) {
      console.error("[v0] Delete error:", error)

      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete document. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "Unknown size"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const addNewDocumentType = () => {
    if (newDocumentName.trim()) {
      const newId = newDocumentName.toLowerCase().replace(/\s+/g, "-")
      setDocumentTypes([...documentTypes, { id: newId, name: newDocumentName }])
      setNewDocumentName("")
    }
  }

  const isDocumentTypeUploaded = (typeName: string) => {
    console.log("[v0] Checking if document type is uploaded:", typeName, "Current docs:", uploadedDocuments.length)

    const isUploaded = uploadedDocuments.some((doc) => {
      if (typeName === "Release Letter" && (doc.type === "Release Letter" || doc.type === "Release Letter/DRO")) {
        return true
      }
      return doc.type === typeName
    })

    console.log("[v0] Document type", typeName, "is uploaded:", isUploaded)
    return isUploaded
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading documents...</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-12 mt-8">
      {isEditing && (
        <div className="col-span-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Document</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon" disabled={isUploading}>
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            className={cn(
              "relative rounded-lg border-2 border-dashed p-12 text-center mt-4",
              dragActive ? "border-primary" : "border-muted-foreground/25",
              isUploading && "opacity-50",
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              id="file-upload"
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              disabled={isUploading}
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              multiple
            />
            <div className="flex flex-col items-center gap-2">
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="text-sm">Uploading... {uploadProgress}%</div>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                  </div>
                  <div className="text-xs text-muted-foreground">PDF, PNG, JPG, DOC (MAX. 5MB each)</div>
                  <div className="text-xs text-muted-foreground font-medium">
                    Select multiple files to upload them all at once
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div key={checklistKey} className="bg-white rounded-lg p-4 border col-span-2 h-[500px] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Required Documents Checklist</h3>
          {isEditing && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs bg-black text-white hover:bg-black/90">
                  Add New Document Type
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Document Type</DialogTitle>
                </DialogHeader>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter document name"
                    value={newDocumentName}
                    onChange={(e) => setNewDocumentName(e.target.value)}
                  />
                  <Button onClick={addNewDocumentType}>Add</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="space-y-4">
          {documentTypes.map((type) => {
            const isUploaded = isDocumentTypeUploaded(type.name)
            console.log(`[v0] Checklist render - ${type.name}: ${isUploaded ? "GREEN" : "RED"}`)
            return (
              <div key={type.id} className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {isUploaded ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </Button>
                <span className="text-sm">{type.name === "Release Letter" ? "Release Letter/DRO" : type.name}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border col-span-2 h-[500px] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-lg font-semibold">Uploaded Documents ({uploadedDocuments.length})</h4>
          <Button variant="outline" size="sm" onClick={fetchDocuments}>
            Refresh
          </Button>
        </div>
        <div className="space-y-4">
          {uploadedDocuments.length > 0 ? (
            uploadedDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-md group">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm whitespace-normal break-words pr-4">{doc.name}</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">({formatFileSize(doc.size)})</span>
                    </div>
                    <span className="text-xs text-gray-500">{doc.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => window.open(doc.url, "_blank")}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      onClick={() => {
                        setDocumentToDelete(doc)
                        setShowDeleteDialog(true)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No documents uploaded yet</p>
              <p className="text-sm">Upload documents using the form above</p>
            </div>
          )}
        </div>
      </div>
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p>Are you sure you want to delete this document?</p>
            <p className="font-medium mt-2">{documentToDelete?.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{documentToDelete?.type}</p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (documentToDelete) {
                  handleDeleteDocument(documentToDelete)
                  setShowDeleteDialog(false)
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
