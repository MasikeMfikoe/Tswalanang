"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, UploadCloud, FileText, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface PODDocument {
  id: string
  name: string
  file: File
  status: "pending" | "uploading" | "uploaded" | "failed"
  progress: number
}

interface PODManagementProps {
  orderId: string
}

export function PODManagement({ orderId }: PODManagementProps) {
  const [podDocuments, setPodDocuments] = useState<PODDocument[]>([])
  const [notes, setNotes] = useState("")
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
      setPodDocuments((prev) => [...prev, ...newFiles])
    }
  }

  const handleRemoveDocument = (id: string) => {
    setPodDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  const handleSubmitPOD = async () => {
    if (podDocuments.length === 0) {
      toast({
        title: "No Documents",
        description: "Please upload at least one Proof of Delivery document.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    let allSuccess = true

    for (const doc of podDocuments) {
      if (doc.status === "uploaded") continue

      setPodDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: "uploading", progress: 0 } : d)))

      try {
        // Simulate file upload to an API endpoint
        // In a real application, you'd use FormData and a fetch/axios call
        // const formData = new FormData();
        // formData.append('file', doc.file);
        // formData.append('orderId', orderId);
        // formData.append('notes', notes);
        // const response = await fetch('/api/upload-pod', { method: 'POST', body: formData });
        // if (!response.ok) throw new Error('POD upload failed');

        // Simulate progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          setPodDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, progress: i } : d)))
        }

        setPodDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: "uploaded", progress: 100 } : d)))
        toast({
          title: "Upload Success",
          description: `${doc.name} uploaded for POD.`,
          variant: "success",
        })
      } catch (error) {
        console.error("POD upload error for", doc.name, error)
        setPodDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: "failed", progress: 0 } : d)))
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${doc.name} for POD.`,
          variant: "destructive",
        })
        allSuccess = false
      }
    }

    setUploading(false)
    if (allSuccess) {
      toast({
        title: "POD Submitted",
        description: `Proof of Delivery for Order ${orderId} submitted successfully.`,
        variant: "success",
      })
      setPodDocuments([]) // Clear documents after successful submission
      setNotes("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proof of Delivery (POD) Management for Order {orderId}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="pod-document-upload">Upload POD Documents</Label>
          <Input
            id="pod-document-upload"
            type="file"
            multiple
            onChange={handleFileChange}
            className="file:text-blue-600 file:bg-blue-50 file:border-blue-200"
          />
          <p className="text-sm text-muted-foreground">Max file size: 10MB. Supported formats: PDF, JPG, PNG.</p>
        </div>

        {podDocuments.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Uploaded Documents:</h3>
            <div className="grid gap-3">
              {podDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      {doc.status === "uploading" && (
                        <p className="text-sm text-blue-600">Uploading... {doc.progress}%</p>
                      )}
                      {doc.status === "uploaded" && (
                        <p className="text-sm text-green-600 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" /> Uploaded
                        </p>
                      )}
                      {doc.status === "failed" && (
                        <p className="text-sm text-red-600 flex items-center">
                          <XCircle className="h-4 w-4 mr-1" /> Failed
                        </p>
                      )}
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
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="pod-notes">Notes (Optional)</Label>
          <Textarea
            id="pod-notes"
            placeholder="Add any relevant notes for the Proof of Delivery"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          onClick={handleSubmitPOD}
          disabled={uploading || podDocuments.length === 0 || podDocuments.some((d) => d.status === "failed")}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting POD...
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" /> Submit Proof of Delivery
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
