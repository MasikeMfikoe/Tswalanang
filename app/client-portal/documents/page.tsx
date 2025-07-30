"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText, Search, Filter, Download } from "lucide-react"

import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabaseClient" // Import supabase

// Define types for better clarity
interface Document {
  id: string
  document_type: string
  file_name: string
  url: string
  created_at: string
  order_id: string
  po_number?: string // Added po_number for display
  client_accessible: boolean
}

// ─────────────────────────────────────────────────────────────────────────
//  MOCK DATA (for demonstration if API fails or user is not logged in)
// ─────────────────────────────────────────────────────────────────────────
const mockClientDocuments: Document[] = [
  {
    id: "DOC-001",
    document_type: "Bill of Lading",
    file_name: "BL_PO-ABC-001.pdf",
    url: "/placeholder.svg?height=24&width=24",
    created_at: "2024-01-16T11:00:00Z",
    order_id: "ORD-2024-001",
    po_number: "PO-ABC-001",
    client_accessible: true,
  },
  {
    id: "DOC-002",
    document_type: "Commercial Invoice",
    file_name: "CI_PO-ABC-002.pdf",
    url: "/placeholder.svg?height=24&width=24",
    created_at: "2024-01-17T12:00:00Z",
    order_id: "ORD-2024-002",
    po_number: "PO-ABC-002",
    client_accessible: true,
  },
  {
    id: "DOC-003",
    document_type: "Packing List",
    file_name: "PL_PO-ABC-001.pdf",
    url: "/placeholder.svg?height=24&width=24",
    created_at: "2024-01-18T13:00:00Z",
    order_id: "ORD-2024-001",
    po_number: "PO-ABC-001",
    client_accessible: true,
  },
]

// ─────────────────────────────────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────────────────────────────────
const getDocumentStatusColor = (status: string) => {
  // Assuming documents might have a status, though not explicitly in mock data
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch (e) {
    return "Invalid Date"
  }
}

// ─────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────
export default function ClientPortalDocumentsPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = async () => {
    if (!user?.id) {
      setDocuments(mockClientDocuments)
      setFilteredDocuments(mockClientDocuments)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/client-portal/documents?clientId=${user.id}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.statusText}`)
      }
      const data = await response.json()
      if (data.success && data.data.documents) {
        // Ensure documents have po_number if linked via order_id
        const docsWithPo = await Promise.all(
          data.data.documents.map(async (doc: any) => {
            if (doc.order_id && !doc.po_number) {
              // Fetch order details to get PO number if not directly available
              const orderResponse = await fetch(`/api/client-portal/orders/${doc.order_id}?clientId=${user.id}`)
              if (orderResponse.ok) {
                const orderData = await orderResponse.json()
                if (orderData.success && orderData.data.order) {
                  return { ...doc, po_number: orderData.data.order.po_number }
                }
              }
            }
            return doc
          }),
        )
        setDocuments(docsWithPo.filter((doc: Document) => doc.client_accessible))
      } else {
        console.warn("API returned success: false for documents, using mock data.", data.error)
        setDocuments(mockClientDocuments)
      }
    } catch (err: any) {
      console.error("Error fetching documents:", err)
      setError(err.message || "Failed to load documents.")
      setDocuments(mockClientDocuments) // Fallback to mock data on error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()

    // Set up Realtime subscription
    const documentsChannel = supabase
      .channel("client_documents_list_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "documents" }, (payload) => {
        console.log("Realtime document change:", payload)
        fetchDocuments() // Re-fetch data on any document change
      })
      .subscribe()

    return () => {
      supabase.removeChannel(documentsChannel)
    }
  }, [user?.id]) // Re-run effect if user ID changes

  // ─── Filtering logic ────────────────────────────────────────────────
  useEffect(() => {
    let next = documents

    if (searchTerm) {
      next = next.filter(
        (doc) =>
          doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.po_number?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    if (typeFilter !== "all") {
      next = next.filter((doc) => doc.document_type.toLowerCase() === typeFilter)
    }
    setFilteredDocuments(next)
  }, [searchTerm, typeFilter, documents])

  const isAdmin = user?.role === "admin"

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading documents...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
          <p className="font-semibold">Error loading data:</p>
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={fetchDocuments}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin banner */}
      {isAdmin && (
        <div className="bg-blue-600 text-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Admin View – Client Documents</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isAdmin ? "Admin View – Client Documents" : `${user?.department || "Company"} Documents`}
            </h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? "Admin viewing client documents" : "Access and download your shipment documents"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/client-portal")}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portal
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" /> Filter Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search file name or PO number…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Document Types</SelectItem>
                  <SelectItem value="bill of lading">Bill of Lading</SelectItem>
                  <SelectItem value="commercial invoice">Commercial Invoice</SelectItem>
                  <SelectItem value="packing list">Packing List</SelectItem>
                  <SelectItem value="certificate of origin">Certificate of Origin</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents table */}
        <Card>
          <CardHeader>
            <CardTitle>Documents List</CardTitle>
            <CardDescription>
              {filteredDocuments.length} of {documents.length} documents shown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">No documents found</h3>
                <p className="text-gray-600">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Type</TableHead>
                      <TableHead>PO Number</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Uploaded On</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.document_type}</TableCell>{" "}
                        {/* Fix: First TableCell on same line as TableRow */}
                        <TableCell>{doc.po_number || "N/A"}</TableCell>
                        <TableCell>{doc.file_name}</TableCell>
                        <TableCell>{formatDate(doc.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" /> Download
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
