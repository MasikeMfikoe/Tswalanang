"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UploadCloud, FileText, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Document {
  id: string
  name: string
  file: File
  status: "pending" | "uploading" | "uploaded" | "failed"
  progress: number
}

export function NewOrderDocumentUpload() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map((file) => ({
        id: URL.createObjectURL(file), // Temporary ID
        name: file.name,
        file,
        status: "pending",
        progress: 0,
      }))
      setDocuments((prev) => [...prev, ...newFiles])
    }
  }

  const handleRemoveDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  const handleUploadAll = async () => {
    setUploading(true)
    let allSuccess = true

    for (const doc of documents) {
      if (doc.status === "uploaded") continue // Skip already uploaded

      setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: "uploading", progress: 0 } : d)))

      try {
        // Simulate file upload to an API endpoint
        // In a real application, you'd use FormData and a fetch/axios call
        // const formData = new FormData();
        // formData.append('file', doc.file);
        // const response = await fetch('/api/upload-document', { method: 'POST', body: formData });
        // if (!response.ok) throw new Error('Upload failed');

        // Simulate progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, progress: i } : d)))
        }

        setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: "uploaded", progress: 100 } : d)))
        toast({
          title: "Upload Success",
          description: `${doc.name} uploaded successfully.`,
          variant: "success",
        })
      } catch (error) {
        console.error("Upload error for", doc.name, error)
        setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: "failed", progress: 0 } : d)))
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${doc.name}.`,
          variant: "destructive",
        })
        allSuccess = false
      }
    }
    setUploading(false)
    if (allSuccess) {
      toast({
        title: "All Uploads Complete",
        description: "All selected documents have been uploaded.",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Upload</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="document-upload">Upload Supporting Documents</Label>
          <Input
            id="document-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            className="file:text-blue-600 file:bg-blue-50 file:border-blue-200"
          />
          <p className="text-sm text-muted-foreground">Max file size: 10MB. Supported formats: PDF, JPG, PNG.</p>
        </div>

        {documents.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Selected Documents:</h3>
            <div className="grid gap-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      {doc.status === "uploading" && (
                        <p className="text-sm text-blue-600">Uploading... {doc.progress}%</p>
                      )}
                      {doc.status === "uploaded" && <p className="text-sm text-green-600">Uploaded</p>}
                      {doc.status === "failed" && <p className="text-sm text-red-600">Upload Failed</p>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveDocument(doc.id)}
                    disabled={uploading}
                    aria-label={`Remove ${doc.name}`}
                  >
                    <XCircle className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              onClick={handleUploadAll}
              disabled={uploading || documents.every((d) => d.status === "uploaded")}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading All...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" /> Upload All
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
