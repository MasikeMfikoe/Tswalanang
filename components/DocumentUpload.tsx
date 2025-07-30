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
import { supabase } from "@/lib/supabase"

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

export function DocumentUpload({ isEditing, orderId }: { isEditing: boolean; orderId: string }) {
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
    console.log("DocumentUpload component loaded with:", { isEditing, orderId })
  }, [isEditing, orderId])

  // Fetch documents from Supabase on component mount and when orderId changes
  useEffect(() => {
    if (orderId) {
      fetchDocuments()
    }
  }, [orderId])

  const fetchDocuments = async () => {
    try {
      setIsLoading(true)
      console.log("🔍 Fetching documents for order:", orderId)

      const { data, error } = await supabase
        .from("uploaded_documents")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error fetching documents:", error)
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive",
        })
        return
      }

      console.log("✅ Fetched documents from Supabase:", data)

      const formattedDocs: UploadedDocument[] = (data || []).map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        url: doc.url,
        size: doc.size || 0,
        uploadedAt: doc.created_at,
        order_id: doc.order_id,
      }))

      setUploadedDocuments(formattedDocs)
      console.log("📋 Updated uploaded documents state:", formattedDocs)

      // Force checklist to re-render
      setChecklistKey((prev) => prev + 1)
    } catch (error) {
      console.error("💥 Exception fetching documents:", error)
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    console.log("🚀 Starting file upload process...")
    console.log("📁 File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
      selectedType,
      orderId,
    })

    if (!selectedType) {
      console.log("❌ No document type selected")
      toast({
        title: "Error",
        description: "Please select a document type before uploading",
        variant: "destructive",
      })
      return
    }

    if (!orderId) {
      console.log("❌ No order ID provided")
      toast({
        title: "Error",
        description: "Order ID is required to upload documents",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      console.log("❌ File too large:", file.size)
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `documents/${fileName}`

      console.log("📂 Generated file path:", filePath)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      console.log("☁️ Uploading to Supabase Storage...")

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage.from("documents").upload(filePath, file)

      if (uploadError) {
        console.error("❌ Storage upload error:", uploadError)
        throw uploadError
      }

      console.log("✅ Storage upload successful:", uploadData)

      // Get public URL
      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(filePath)

      console.log("🔗 Generated public URL:", urlData.publicUrl)

      // Save document metadata to database
      const documentType = documentTypes.find((type) => type.id === selectedType)
      const documentData = {
        name: file.name,
        type: documentType?.name || selectedType,
        url: urlData.publicUrl,
        order_id: orderId,
      }

      console.log("💾 Inserting document metadata:", documentData)

      const { data: dbData, error: dbError } = await supabase.from("uploaded_documents").insert([documentData]).select()

      if (dbError) {
        console.error("❌ Database insert error:", dbError)
        // If database insert fails, clean up the uploaded file
        console.log("🧹 Cleaning up uploaded file due to database error...")
        await supabase.storage.from("documents").remove([filePath])
        throw dbError
      }

      console.log("✅ Database insert successful:", dbData)

      // Complete progress
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Add to local state immediately
      if (dbData && dbData[0]) {
        const newDoc: UploadedDocument = {
          id: dbData[0].id,
          name: dbData[0].name,
          type: dbData[0].type,
          url: dbData[0].url,
          size: file.size,
          uploadedAt: dbData[0].created_at,
          order_id: dbData[0].order_id,
        }
        setUploadedDocuments((prev) => [newDoc, ...prev])
        console.log("📋 Added new document to local state:", newDoc)
      }

      setSelectedType("")

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })

      console.log("🎉 Upload process completed successfully!")

      // Refresh documents from database to ensure consistency
      setTimeout(() => {
        console.log("🔄 Refreshing documents from database...")
        fetchDocuments()
      }, 1000)
    } catch (error: any) {
      console.error("💥 Upload error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDeleteDocument = async (document: UploadedDocument) => {
    try {
      console.log("🗑️ Starting deletion process for document:", document.id)
      console.log("📋 Document details:", document)
      console.log("🔍 Order ID:", orderId)

      // Show loading state
      toast({
        title: "Deleting document...",
        description: `Removing ${document.name}`,
      })

      // Use API route for deletion to bypass RLS issues
      const response = await fetch("/api/documents/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: document.id,
          orderId: orderId,
          filePath: document.url,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete document")
      }

      const result = await response.json()
      console.log("✅ Document deleted via API:", result)

      // Update local state immediately
      setUploadedDocuments((prev) => {
        const newDocs = prev.filter((doc) => doc.id !== document.id)
        console.log("📋 Updated documents state after deletion:", newDocs.length, "documents remaining")
        return newDocs
      })

      // Force checklist to re-render
      setChecklistKey((prev) => prev + 1)

      toast({
        title: "Success",
        description: "Document deleted successfully",
      })

      console.log("✅ Document deletion completed successfully")

      // Refresh from database after a short delay to verify
      setTimeout(async () => {
        console.log("🔄 Performing verification refresh...")
        await fetchDocuments()
      }, 1000)
    } catch (error: any) {
      console.error("❌ Delete error:", error)

      // Show detailed error message
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete document. Please try again.",
        variant: "destructive",
      })

      // Refresh from database to show current state
      await fetchDocuments()
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
    console.log("🔍 Checking if document type is uploaded:", typeName, "Current docs:", uploadedDocuments.length)

    const isUploaded = uploadedDocuments.some((doc) => {
      if (typeName === "Release Letter" && (doc.type === "Release Letter" || doc.type === "Release Letter/DRO")) {
        return true
      }
      return doc.type === typeName
    })

    console.log("✅ Document type", typeName, "is uploaded:", isUploaded)
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
      {/* Debug Info */}
      <div className="col-span-4 mb-4 p-4 bg-gray-100 rounded-lg text-sm">
        <div className="flex justify-between items-center">
          <div>
            <strong>Debug Info:</strong> Order ID: {orderId} | Documents loaded: {uploadedDocuments.length} | Editing:{" "}
            {isEditing ? "Yes" : "No"}
          </div>
        </div>
      </div>

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
                  <div className="text-xs text-muted-foreground">PDF, PNG, JPG, DOC (MAX. 5MB)</div>
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
            console.log(`🔍 Checklist render - ${type.name}: ${isUploaded ? "GREEN" : "RED"}`)
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
