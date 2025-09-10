"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getClientPackDocuments, getMockClientPackDocuments, type ClientPackDocument } from "@/lib/client-pack-utils"
import { Download, FileText } from "lucide-react"

interface ClientPackDocumentsProps {
  orderId: string
  freightType?: string
}

export default function ClientPackDocuments({ orderId, freightType }: ClientPackDocumentsProps) {
  const [documents, setDocuments] = useState<ClientPackDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)

  useEffect(() => {
    async function fetchDocuments() {
      try {
        setLoading(true)
        const docs = await getClientPackDocuments(orderId, freightType)

        // If no documents are found, use mock data for demonstration
        if (docs.length === 0) {
          setUseMockData(true)
          setDocuments(getMockClientPackDocuments(orderId, freightType))
        } else {
          setDocuments(docs)
        }

        setError(null)
      } catch (err) {
        console.error("Error fetching client pack documents:", err)
        setError("Failed to load documents")
        setUseMockData(true)
        setDocuments(getMockClientPackDocuments(orderId, freightType))
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [orderId, freightType])

  const handleViewDocument = (document: ClientPackDocument) => {
    if (useMockData) {
      alert("This is a mock document. In a real application, this would open the document.")
      return
    }
    if (typeof window !== "undefined") {
      window.open(document.url, "_blank")
    }
  }

  const handleDownloadDocument = (document: ClientPackDocument) => {
    if (useMockData) {
      alert("This is a mock document. In a real application, this would download the document.")
      return
    }

    if (typeof document !== "undefined" && typeof window !== "undefined") {
      const link = document.createElement("a")
      link.href = document.url
      link.download = document.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDownloadAll = () => {
    if (useMockData) {
      alert("These are mock documents. In a real application, this would download all documents.")
      return
    }

    documents.forEach((doc, index) => {
      // Add a small delay between downloads to prevent browser issues
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

  return (
    <Card>
      <CardContent className="p-6">
        {useMockData && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">Demo Mode</p>
            <p className="text-sm">Showing mock documents for demonstration purposes.</p>
          </div>
        )}

        {error && !useMockData && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        )}

        {documents.length > 0 && (
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleDownloadAll}
              className="bg-black text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download All
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
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground">
                    <div className="flex flex-col items-center py-6">
                      <FileText className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">No client pack documents available for this order.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                documents.map((doc, index) => (
                  <tr key={doc.id || index} className="border-b">
                    <td className="p-4">{doc.name}</td>
                    <td className="p-4">{doc.type}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          doc.required
                            ? "bg-red-100 text-red-700 ring-1 ring-inset ring-red-600/20"
                            : "bg-yellow-100 text-yellow-700 ring-1 ring-inset ring-yellow-600/20"
                        }`}
                      >
                        {doc.required ? "Required" : "Optional"}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2 bg-transparent"
                        onClick={() => handleViewDocument(doc)}
                      >
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadDocument(doc)}>
                        Download
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
