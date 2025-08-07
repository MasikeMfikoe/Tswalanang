"use client"
import { useFileUpload } from "@/hooks/useFileUpload"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Upload, X, File, Loader2 } from "lucide-react"

interface FileUploadProps {
  maxSizeInMB?: number
  acceptedFileTypes?: string[]
  maxFiles?: number
  onFilesSelected?: (files: File[]) => void
  onUploadComplete?: (files: File[]) => void
  onError?: (error: string) => void
  uploadFn?: (file: File) => Promise<any>
  className?: string
  dropzoneText?: string
  buttonText?: string
  showFileList?: boolean
}

export function FileUpload({
  maxSizeInMB = 5,
  acceptedFileTypes = [],
  maxFiles = 1,
  onFilesSelected,
  onUploadComplete,
  onError,
  uploadFn,
  className,
  dropzoneText = "Drag and drop files here, or click to browse",
  buttonText = "Select Files",
  showFileList = true,
}: FileUploadProps) {
  const {
    files,
    isUploading,
    uploadProgress,
    dragActive,
    handleDrag,
    handleDrop,
    handleFileChange,
    uploadFiles,
    removeFile,
  } = useFileUpload({
    maxSizeInMB,
    acceptedFileTypes,
    maxFiles,
    onSuccess: onFilesSelected,
    onError,
  })

  const handleUpload = async () => {
    if (!uploadFn) return

    await uploadFiles(uploadFn)
    onUploadComplete?.(files)
  }

  const acceptAttribute =
    acceptedFileTypes.length > 0
      ? acceptedFileTypes
          .filter((type) => type.includes("/")) // Only include MIME types
          .join(",")
      : undefined

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          isUploading && "opacity-50 cursor-not-allowed",
        )}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          id="file-upload"
          type="file"
          multiple={maxFiles > 1}
          accept={acceptAttribute}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileChange}
          disabled={isUploading}
          aria-label="File upload"
        />

        <div className="flex flex-col items-center justify-center text-center">
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Uploading... {Math.round(uploadProgress)}%</p>
              <Progress value={uploadProgress} className="w-full max-w-xs mt-2" />
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">{dropzoneText}</p>
              <p className="text-xs text-muted-foreground">
                {acceptedFileTypes.length > 0 && (
                  <>
                    Accepted file types: {acceptedFileTypes.join(", ")}
                    <br />
                  </>
                )}
                Maximum file size: {maxSizeInMB}MB
                {maxFiles > 1 && <>, Maximum files: {maxFiles}</>}
              </p>
            </>
          )}
        </div>
      </div>

      {showFileList && files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected Files ({files.length})</p>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center">
                  <File className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {uploadFn && files.length > 0 && (
        <Button onClick={handleUpload} disabled={isUploading || files.length === 0} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              Upload {files.length} file{files.length !== 1 && "s"}
            </>
          )}
        </Button>
      )}
    </div>
  )
}
