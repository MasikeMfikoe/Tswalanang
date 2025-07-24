import type { DocumentType } from "@/types/models"

export const getDocumentTypeOptions = (): DocumentType[] => [
  "Bill of Lading",
  "Commercial Invoice",
  "Packing List",
  "Certificate of Origin",
  "Customs Declaration",
  "Proof of Delivery",
  "Other",
]

export const getFileExtension = (fileName: string): string => {
  return fileName.split(".").pop()?.toLowerCase() || ""
}

export const isImageFile = (fileName: string): boolean => {
  const ext = getFileExtension(fileName)
  return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)
}

export const isPdfFile = (fileName: string): boolean => {
  return getFileExtension(fileName) === "pdf"
}

export const getFileIcon = (fileName: string): string => {
  const ext = getFileExtension(fileName)
  switch (ext) {
    case "pdf":
      return "📄" // or a specific icon component name
    case "doc":
    case "docx":
      return "📝"
    case "xls":
    case "xlsx":
      return "📊"
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return "🖼️"
    case "zip":
    case "rar":
      return "📁"
    default:
      return "📎"
  }
}

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

export const getDocumentStatusVariant = (status: string) => {
  switch (status) {
    case "Approved":
      return "default"
    case "Pending":
      return "secondary"
    case "Rejected":
      return "destructive"
    default:
      return "outline"
  }
}
