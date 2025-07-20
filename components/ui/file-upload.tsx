"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { UploadCloud, FileText, XCircle, CheckCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onUploadComplete?: (fileUrls: string[]) => void
  maxFiles?: number
  maxFileSizeMb?: number
  acceptedFileTypes?: string[] // e.g., ["image/jpeg", "application/pdf"]
  disabled?: boolean
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "pending" | "uploading" | "uploaded" | "failed"
  progress: number
  url?: string // URL after successful upload
  error?: string
}

export function FileUpload({
  onUploadComplete,
  maxFiles = 5,
  maxFileSizeMb = 10,
  acceptedFileTypes = ["image/*", "application/pdf"],
  disabled = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        const newFiles = Array.from(event.target.files)
        const currentFileCount = files.filter((f) => f.status !== "failed").length

        if (currentFileCount + newFiles.length > maxFiles) {
          toast({
            title: "Too Many Files",
            description: `You can only upload a maximum of ${maxFiles} files.`,
            variant: "destructive",
          })
          return
        }

        const validFiles: UploadedFile[] = []
        newFiles.forEach((file) => {
          if (file.size > maxFileSizeMb * 1024 * 1024) {
            toast({
              title: "File Too Large",
              description: `${file.name} exceeds the maximum size of ${maxFileSizeMb}MB.`,
              variant: "destructive",
            })
            return
          }
          if (!acceptedFileTypes.some((type) => file.type.startsWith(type.replace("*", "")) || type === file.type)) {
            toast({
              title: "Invalid File Type",
              description: `${file.name} is not a supported file type.`,
              variant: "destructive",
            })
            return
          }
          validFiles.push({
            id: `${file.name}-${Date.now()}`, // Unique ID for keying
            name: file.name,
            size: file.size,
            type: file.type,
            status: "pending",
            progress: 0,
          })
        })

        setFiles((prev) => [...prev, ...validFiles])
        // Clear the input value to allow re-uploading the same file if needed
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    },
    [files, maxFiles, maxFileSizeMb, acceptedFileTypes, toast],
  )

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }, [])

  const handleUpload = useCallback(async () => {
    setIsUploading(true)
    const uploadedUrls: string[] = []
    let allSuccessful = true

    for (let i = 0; i < files.length; i++) {
      const fileToUpload = files[i]
      if (fileToUpload.status === "uploaded") {
        if (fileToUpload.url) uploadedUrls.push(fileToUpload.url)
        continue // Skip already uploaded files
      }

      setFiles((prev) => prev.map((f) => (f.id === fileToUpload.id ? { ...f, status: "uploading", progress: 0 } : f)))

      try {
        // Simulate API call for file upload
        // In a real application, you would send fileToUpload.file to your backend
        // const formData = new FormData();
        // formData.append('file', fileToUpload.file);
        // const response = await fetch('/api/upload', { method: 'POST', body: formData });
        // if (!response.ok) throw new Error('Upload failed');
        // const result = await response.json(); // Assuming API returns { url: "..." }

        // Simulate progress and success
        for (let p = 0; p <= 100; p += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          setFiles((prev) => prev.map((f) => (f.id === fileToUpload.id ? { ...f, progress: p } : f)))
        }

        const simulatedUrl = `/uploads/${fileToUpload.name}` // Placeholder URL
        uploadedUrls.push(simulatedUrl)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileToUpload.id ? { ...f, status: "uploaded", progress: 100, url: simulatedUrl } : f,
          ),
        )
        toast({
          title: "Upload Successful",
          description: `${fileToUpload.name} uploaded.`,
          variant: "success",
        })
      } catch (error: any) {
        console.error("Upload error:", error)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileToUpload.id
              ? { ...f, status: "failed", error: error.message || "Upload failed", progress: 0 }
              : f,
          ),
        )
        toast({
          title: "Upload Failed",
          description: `${fileToUpload.name}: ${error.message || "An unknown error occurred."}`,
          variant: "destructive",
        })
        allSuccessful = false
      }
    }

    setIsUploading(false)
    if (onUploadComplete && allSuccessful) {
      onUploadComplete(uploadedUrls)
    }
  }, [files, onUploadComplete, toast])

  const pendingUploads = files.filter((f) => f.status === "pending" || f.status === "failed").length > 0

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label htmlFor="file-upload">Upload Files</Label>
        <Input
          id="file-upload"
          type="file"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          disabled={disabled || isUploading || files.filter((f) => f.status !== "failed").length >= maxFiles}
          className="file:text-blue-600 file:bg-blue-50 file:border-blue-200"
        />
        <p className="text-sm text-muted-foreground">
          Max {maxFiles} files, up to {maxFileSizeMb}MB each. Supported: {acceptedFileTypes.join(", ")}.
        </p>
      </div>

      {files.length > 0 && (
        <div className="grid gap-3">
          {files.map((file) => (
            <div
              key={file.id}
              className={cn(
                "flex items-center justify-between rounded-md border p-3",
                file.status === "failed" && "border-red-400 bg-red-50",
                file.status === "uploaded" && "border-green-400 bg-green-50",
              )}
            >
              <div className="flex items-center gap-3">
                {file.status === "uploading" ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                ) : file.status === "uploaded" ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : file.status === "failed" ? (
                  <XCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <FileText className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  {file.status === "uploading" && <Progress value={file.progress} className="w-[100px] h-2 mt-1" />}
                  {file.status === "failed" && <p className="text-xs text-red-500">{file.error || "Upload failed"}</p>}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveFile(file.id)}
                disabled={isUploading}
                aria-label={`Remove ${file.name}`}
              >
                <XCircle className="h-5 w-5 text-gray-500 hover:text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && pendingUploads && (
        <Button onClick={handleUpload} disabled={isUploading || disabled}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" /> Upload All
            </>
          )}
        </Button>
      )}
    </div>
  )
}
