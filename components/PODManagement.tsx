"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Loader2, XCircle, FilePenLineIcon as Signature, FileText } from "lucide-react"
import type { DocumentType } from "@/types/models"
import { useUploadDocumentMutation } from "@/hooks/useDocumentsQuery"
import { useToast } from "@/components/ui/use-toast"
import { formatBytes } from "@/lib/document-utils"
import SignaturePadComponent from "@/components/ui/signature-pad" // Assuming this component exists
import { useAuth } from "@/contexts/AuthContext"

interface PODManagementProps {
  orderId: string
  onPODUploaded?: (document: any) => void
}

export default function PODManagement({ orderId, onPODUploaded }: PODManagementProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const signaturePadRef = useRef<any>(null) // Ref for the signature pad component

  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null)

  const uploadDocumentMutation = useUploadDocumentMutation()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setSignatureDataUrl(null) // Clear signature if a file is uploaded
    } else {
      setFile(null)
      setPreviewUrl(null)
    }
  }

  const handleSignatureSave = (dataUrl: string) => {
    setSignatureDataUrl(dataUrl)
    setFile(null) // Clear file if signature is captured
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClearSignature = () => {
    setSignatureDataUrl(null)
    if (signaturePadRef.current) {
      signaturePadRef.current.clear()
    }
  }

  const handleUpload = async () => {
    if (!orderId) {
      toast({
        title: "Missing Order ID",
        description: "Order ID is required to upload Proof of Delivery.",
        variant: "destructive",
      })
      return
    }

    if (!file && !signatureDataUrl) {
      toast({
        title: "Missing Content",
        description: "Please upload a file or capture a signature for Proof of Delivery.",
        variant: "destructive",
      })
      return
    }

    const documentType: DocumentType = "Proof of Delivery"
    const uploadedBy = user?.name && user?.surname ? `${user.name} ${user.surname}` : "Delivery Agent"

    let fileToUpload: File | null = null
    let fileName = ""

    if (file) {
      fileToUpload = file
      fileName = file.name
    } else if (signatureDataUrl) {
      // Convert data URL to Blob and then to File
      const blob = await (await fetch(signatureDataUrl)).blob()
      fileName = `signature_pod_${orderId}_${Date.now()}.png`
      fileToUpload = new File([blob], fileName, { type: "image/png" })
    }

    if (!fileToUpload) {
      toast({
        title: "Error",
        description: "Could not prepare file for upload.",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await uploadDocumentMutation.mutateAsync({
        file: fileToUpload,
        orderId,
        documentType,
        uploadedBy,
        notes,
      })
      toast({
        title: "Success",
        description: "Proof of Delivery uploaded successfully!",
      })
      // Reset form
      setFile(null)
      setNotes("")
      setPreviewUrl(null)
      setSignatureDataUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      if (signaturePadRef.current) {
        signaturePadRef.current.clear()
      }
      if (onPODUploaded) {
        onPODUploaded(result)
      }
    } catch (error) {
      console.error("Error uploading POD:", error)
      toast({
        title: "Upload Failed",
        description: `Failed to upload Proof of Delivery: ${(error as Error).message}`,
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="p-4">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Signature className="h-5 w-5" />
          Proof of Delivery (POD)
        </CardTitle>
        <CardDescription>Upload a POD document or capture a digital signature.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-6">
        {/* File Upload Section */}
        <div className="space-y-2">
          <Label htmlFor="file">Upload POD File (e.g., PDF, Image)</Label>
          <Input id="file" type="file" onChange={handleFileChange} ref={fileInputRef} accept=".pdf,.jpg,.jpeg,.png" />
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
          {previewUrl && (
            <div className="mt-2">
              <h4 className="text-sm font-medium mb-1">File Preview:</h4>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="File Preview"
                className="max-w-full h-48 object-contain border rounded-md"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-center text-muted-foreground">
          <span className="px-2 bg-white">OR</span>
        </div>

        {/* Signature Capture Section */}
        <div className="space-y-2">
          <Label>Capture Digital Signature</Label>
          <SignaturePadComponent ref={signaturePadRef} onSave={handleSignatureSave} />
          {signatureDataUrl && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Signature captured.</span>
              <Button variant="ghost" size="sm" onClick={handleClearSignature}>
                <XCircle className="h-4 w-4 text-red-500" /> Clear Signature
              </Button>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>

        <Button onClick={handleUpload} disabled={uploadDocumentMutation.isPending || (!file && !signatureDataUrl)}>
          {uploadDocumentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Upload className="mr-2 h-4 w-4" />
          Upload POD
        </Button>
      </CardContent>
    </Card>
  )
}
