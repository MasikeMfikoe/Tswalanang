"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import mockStorage from "@/lib/mock-storage" // Import mock storage instead of sample data

export default function DocumentsPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [documents, setDocuments] = useState<any[]>([]) // State for real documents
  const [loading, setLoading] = useState(true) // Loading state

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const result = await mockStorage.getAllDocuments()
        setDocuments(result.data || [])
      } catch (error) {
        console.error("Error fetching documents:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [])

  const filteredDocuments = documents.filter((doc) => {
    return (
      (typeFilter === "All" || doc.type === typeFilter) &&
      (doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.po_number?.toLowerCase().includes(search.toLowerCase()))
    )
  })

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Documents</h1>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Return to Dashboard
            </Button>
          </div>
          <div className="text-center py-8">Loading documents...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Documents</h1>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>

        <div className="flex space-x-4 mb-6">
          <Input
            placeholder="Search by Document Name or PO Number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/2"
          />
          <Select onValueChange={setTypeFilter} value={typeFilter}>
            <SelectTrigger className="w-1/3">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Invoice">Invoice</SelectItem>
              <SelectItem value="Shipping Document">Shipping Document</SelectItem>
              <SelectItem value="Customs Form">Customs Form</SelectItem>
              <SelectItem value="Bill of Lading">Bill of Lading</SelectItem>
              <SelectItem value="Packing List">Packing List</SelectItem>
              <SelectItem value="Certificate of Origin">Certificate of Origin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {documents.length === 0
                ? "No documents have been uploaded yet. Upload documents from the order pages to see them here."
                : "No documents match your search criteria."}
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div key={doc.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{doc.name}</p>
                  <p className="text-sm text-gray-600">Type: {doc.type}</p>
                  <p className="text-sm text-gray-500">Upload Date: {new Date(doc.created_at).toLocaleDateString()}</p>
                  <Link href={`/orders/${doc.order_id}`} className="text-blue-600 hover:underline">
                    PO Number: {doc.po_number}
                  </Link>
                </div>
                <Button
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = doc.url
                    link.download = doc.name
                    link.click()
                  }}
                >
                  Download
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
