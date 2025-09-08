"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"

interface FileUploadOptions {
  maxSizeInMB?: number
  acceptedFileTypes?: string[]
  maxFiles?: number
  onSuccess?: (files: File[]) => void
  onError?: (error: string) => void
}

export function useFileUpload({
  maxSizeInMB = 5,
  acceptedFileTypes = [],
  maxFiles = 1,
  onSuccess,
  onError,
}: FileUploadOptions = {}) {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const { toast } = useToast()

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxSizeInMB * 1024 * 1024) {
        return `File size must be less than ${maxSizeInMB}MB`
      }

      // Check file type if specified
      if (acceptedFileTypes.length > 0) {
        const fileType = file.type.toLowerCase()
        const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""

        const isValidType = acceptedFileTypes.some((type) => {
          // Check if it's a MIME type or an extension
          return type.includes("/")
            ? fileType === type.toLowerCase()
            : fileExtension === type.toLowerCase().replace(".", "")
        })

        if (!isValidType) {
          return `File type not accepted. Accepted types: ${acceptedFileTypes.join(", ")}`
        }
      }

      return null
    },
    [maxSizeInMB, acceptedFileTypes],
  )

  const handleFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      if (newFiles.length === 0) return

      // Check if adding these files would exceed the max files limit
      if (files.length + newFiles.length > maxFiles) {
        const error = `Maximum ${maxFiles} file${maxFiles === 1 ? "" : "s"} allowed`
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        onError?.(error)
        return
      }

      const validFiles: File[] = []
      const errors: string[] = []

      // Validate each file
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i]
        const error = validateFile(file)

        if (error) {
          errors.push(`${file.name}: ${error}`)
        } else {
          validFiles.push(file)
        }
      }

      // Show errors if any
      if (errors.length > 0) {
        const errorMessage = errors.join("\n")
        toast({
          title: "File validation error",
          description: errorMessage,
          variant: "destructive",
        })
        onError?.(errorMessage)
        return
      }

      // If all files are valid, update state
      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles])
        onSuccess?.(validFiles)
      }
    },
    [files, maxFiles, validateFile, toast, onSuccess, onError],
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files)
      }
    },
    [handleFiles],
  )

  const uploadFiles = useCallback(
    async (uploadFn: (file: File) => Promise<any>) => {
      if (files.length === 0) return

      setIsUploading(true)
      setUploadProgress(0)

      try {
        // Process files sequentially to track progress
        for (let i = 0; i < files.length; i++) {
          const file = files[i]

          // Update progress based on file index
          const progressPerFile = files && files.length > 0 ? 100 / files.length : 0
          const baseProgress = i * progressPerFile

          // Simulate progress within each file upload
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
              const newProgress = Math.min(baseProgress + progressPerFile * 0.9, prev + 2)
              return newProgress
            })
          }, 200)

          // Upload the file
          await uploadFn(file)

          // Clear interval and set progress for this file to complete
          clearInterval(progressInterval)
          setUploadProgress(baseProgress + progressPerFile)
        }

        // All files uploaded successfully
        setUploadProgress(100)
        toast({
          title: "Success",
          description: `${files.length} file${files.length === 1 ? "" : "s"} uploaded successfully`,
        })

        // Clear files after successful upload
        setFiles([])
      } catch (error) {
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "An error occurred during upload",
          variant: "destructive",
        })
        onError?.(error instanceof Error ? error.message : "Upload failed")
      } finally {
        setIsUploading(false)
      }
    },
    [files, toast, onError],
  )

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const clearFiles = useCallback(() => {
    setFiles([])
  }, [])

  return {
    files,
    isUploading,
    uploadProgress,
    dragActive,
    handleDrag,
    handleDrop,
    handleFileChange,
    uploadFiles,
    removeFile,
    clearFiles,
  }
}
