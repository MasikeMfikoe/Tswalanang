"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, CheckCircle2, AlertCircle } from "lucide-react"
import mockStorage from "@/lib/mock-storage"

const CLIENT_PACK_DOCUMENT_TYPES = [
  "ANF",
  "Cargo Dues",
  "Customs Worksheet",
  "Delivery Instruction",
  "EDI",
  "Commercial Invoice",
  "Packing List", // Added Packing List to document types
  "Bill of Lading",
  "Release Letter",
  "SAD500",
  "SARS POP",
  "Shipping Invoice",
  "Shipping POP",
]

interface ClientPackDocument {
  id: string
  name: string
  type: string
  url: string
  order_id: string
  created_at: string
  required: boolean
  uploaded: boolean // Add uploaded status
}

interface ClientPackDocumentsProps {
  orderId: string
  freightType?: string
}

export default function ClientPackDocuments({ orderId, freightType }: ClientPackDocumentsProps) {
  const [documents, setDocuments] = useState<ClientPackDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDocuments() {
      try {
        setLoading(true)

        const uploadedResult = await mockStorage.getDocuments(orderId)
        const uploadedDocs = uploadedResult.data || []

        const clientPackDocs: ClientPackDocument[] = CLIENT_PACK_DOCUMENT_TYPES.map((docType) => {
          // Check if this document type has been uploaded
          const uploadedDoc = uploadedDocs.find((doc: any) => {
            // Handle Release Letter special case
            if (docType === "Release Letter" && (doc.type === "Release Letter" || doc.type === "Release Letter/DRO")) {
              return true
            }
            return doc.type === docType
          })

          return {
            id: uploadedDoc?.id || `required-${docType.toLowerCase().replace(/\s+/g, "-")}`,
            name: uploadedDoc?.name || `${docType}.pdf`,
            type: docType,
            url: uploadedDoc?.url || "#",
            order_id: orderId,
            created_at: uploadedDoc?.created_at || new Date().toISOString(),
            required: true,
            uploaded: !!uploadedDoc, // Set uploaded status based on whether document exists
          }
        })

        setDocuments(clientPackDocs)
        setError(null)
      } catch (err) {
        console.error("Error fetching client pack documents:", err)
        setError("Failed to load documents")
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [orderId, freightType])

  const handleViewDocument = (document: ClientPackDocument) => {
    if (!document.uploaded) {
      alert("This document has not been uploaded yet.")
      return
    }
    if (typeof window !== "undefined") {
      window.open(document.url, "_blank")
    }
  }

  const handleDownloadDocument = (doc: ClientPackDocument) => {
    if (!doc.uploaded) {
      alert("This document has not been uploaded yet.")
      return
    }

    if (typeof window !== "undefined") {
      const link = window.document.createElement("a")
      link.href = doc.url
      link.download = doc.name
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
    }
  }

  const handleDownloadAll = () => {
    const uploadedDocs = documents.filter((doc) => doc.uploaded)
    if (uploadedDocs.length === 0) {
      alert("No documents have been uploaded yet.")
      return
    }

    uploadedDocs.forEach((doc, index) => {
      setTimeout(() => handleDownloadDocument(doc), index * 300)
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const uploadedCount = documents.filter((doc) => doc.uploaded).length

  return (
    <Card>
      <CardContent className="p-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {uploadedCount > 0 && (
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleDownloadAll}
              className="bg-black text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download All ({uploadedCount})
            </Button>
          </div>
        )}

        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium">Document Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr key={doc.id || index} className="border-b">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {doc.uploaded ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      {doc.name}
                    </div>
                  </td>
                  <td className="p-4">{doc.type}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        doc.uploaded
                          ? "bg-green-100 text-green-700 ring-1 ring-inset ring-green-600/20"
                          : "bg-red-100 text-red-700 ring-1 ring-inset ring-red-600/20"
                      }`}
                    >
                      {doc.uploaded ? "Uploaded" : "Required"}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`mr-2 ${doc.uploaded ? "bg-transparent" : "opacity-50 cursor-not-allowed"}`}
                      onClick={() => handleViewDocument(doc)}
                      disabled={!doc.uploaded}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadDocument(doc)}
                      disabled={!doc.uploaded}
                      className={doc.uploaded ? "" : "opacity-50 cursor-not-allowed"}
                    >
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
