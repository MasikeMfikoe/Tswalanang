"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface DocumentType {
  id: string
  name: string
}

export function NewOrderDocumentUpload() {
  const { toast } = useToast()
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedType, setSelectedType] = useState<string>("")
  const [newDocumentName, setNewDocumentName] = useState("")

  const [documentTypes] = useState<DocumentType[]>([
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
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
    if (!selectedType) {
      toast({
        title: "Error",
        description: "Please select a document type before uploading",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
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
      let interval: NodeJS.Timeout | null = null
      if (typeof window !== "undefined") {
        // Simulate upload progress
        interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              if (interval) clearInterval(interval)
              return 90
            }
            return prev + 10
          })
        }, 500)
      }

      // In a real application, you would upload to your server here
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", selectedType)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Clear interval and set progress to 100
      if (interval) clearInterval(interval)
      setUploadProgress(100)

      setSelectedType("")

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const addNewDocumentType = () => {
    if (newDocumentName.trim()) {
      setNewDocumentName("")
    }
  }

  return (
    <div className="grid grid-cols-5 gap-8 px-8 py-4">
      <div className="space-y-2 col-span-3">
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
            "relative rounded-lg border-2 border-dashed p-12 text-center",
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
                <div className="text-xs text-muted-foreground">PDF, PNG, JPG (MAX. 5MB)</div>
              </>
            )}
          </div>
        </div>

        {/* Required Documents Checklist */}
        <div className="bg-white rounded-lg p-4 border col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Required Documents Checklist</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
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
          </div>
          <div className="space-y-4">
            {documentTypes.map((type) => (
              <div key={type.id} className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </Button>
                <span className="text-sm">{type.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-8 border col-span-2">
        <h4 className="text-lg font-semibold mb-6 text-center">Uploaded Documents</h4>
        <div className="text-center text-muted-foreground py-8">No documents uploaded yet</div>
      </div>
    </div>
  )
}
