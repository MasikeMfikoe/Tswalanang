"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface NewOrderDocumentUploadProps {
  orderId: string
  onUploadSuccess: (doc: { id: string; name: string; type: string; url: string }) => void
}

export function NewOrderDocumentUpload({ orderId, onUploadSuccess }: NewOrderDocumentUploadProps) {
  const [fileName, setFileName] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
      setFileName(event.target.files[0].name)
    } else {
      setFile(null)
      setFileName("")
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!file || !fileName.trim() || !documentType) {
      toast({
        title: "Missing Information",
        description: "Please provide a file, document name, and type.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    toast({
      title: "Uploading Document",
      description: `Uploading ${fileName} for Order ${orderId}...`,
      duration: 3000,
    })

    try {
      // Simulate file upload to a storage service (e.g., Vercel Blob, S3)
      // In a real application, you'd send the file to an API route that handles storage
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate network delay

      const mockDocumentId = `doc_${Date.now()}`
      const mockDocumentUrl = `/placeholder.pdf?name=${encodeURIComponent(fileName)}` // Placeholder URL

      onUploadSuccess({
        id: mockDocumentId,
        name: fileName,
        type: documentType,
        url: mockDocumentUrl,
      })

      toast({
        title: "Upload Successful",
        description: `${fileName} has been uploaded for Order ${orderId}.`,
      })

      // Reset form
      setFileName("")
      setDocumentType("")
      setFile(null)
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold">Upload Documents for Order {orderId}</h3>
      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <Input id="file" type="file" onChange={handleFileChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fileName">Document Name</Label>
        <Input
          id="fileName"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder={`e.g., Bill of Lading for ${orderId}`}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="documentType">Document Type</Label>
        <Select value={documentType} onValueChange={setDocumentType}>
          <SelectTrigger>
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bill of Lading">Bill of Lading</SelectItem>
            <SelectItem value="Commercial Invoice">Commercial Invoice</SelectItem>
            <SelectItem value="Packing List">Packing List</SelectItem>
            <SelectItem value="Customs Declaration">Customs Declaration</SelectItem>
            <SelectItem value="Proof of Delivery">Proof of Delivery</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isUploading}>
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" /> Upload Document
          </>
        )}
      </Button>
    </form>
  )
}
