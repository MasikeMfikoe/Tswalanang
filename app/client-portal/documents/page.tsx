"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Search, FileText, Download, Eye, Filter, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient" // Import supabase

// Mock documents data - in real app, this would come from API filtered by client
const mockClientDocuments = [
  {
    id: "DOC-001",
    name: "Commercial Invoice - PO-ABC-001",
    type: "Commercial Invoice",
    order_id: "ORD-2024-001", // Changed to order_id to match DB schema
    po_number: "PO-ABC-001", // Changed to po_number
    size: "245 KB",
    created_at: "2024-01-15", // Changed to created_at
    status: "Approved",
    url: "#", // Changed to url
    client_accessible: true,
  },
  {
    id: "DOC-002",
    name: "Bill of Lading - PO-ABC-001",
    type: "Bill of Lading",
    order_id: "ORD-2024-001",
    po_number: "PO-ABC-001",
    size: "189 KB",
    created_at: "2024-01-16",
    status: "Approved",
    url: "#",
    client_accessible: true,
  },
  {
    id: "DOC-003",
    name: "Packing List - PO-ABC-002",
    type: "Packing List",
    order_id: "ORD-2024-002",
    po_number: "PO-ABC-002",
    size: "156 KB",
    created_at: "2024-01-12",
    status: "Approved",
    url: "#",
    client_accessible: true,
  },
  {
    id: "DOC-004",
    name: "Certificate of Origin - PO-ABC-003",
    type: "Certificate of Origin",
    order_id: "ORD-2024-003",
    po_number: "PO-ABC-003",
    size: "198 KB",
    created_at: "2024-01-22",
    status: "Pending Review",
    url: "#",
    client_accessible: true,
  },
  {
    id: "DOC-005",
    name: "Insurance Certificate - PO-ABC-001",
    type: "Insurance Certificate",
    order_id: "ORD-2024-001",
    po_number: "PO-ABC-001",
    size: "167 KB",
    created_at: "2024-01-17",
    status: "Approved",
    url: "#",
    client_accessible: true,
  },
]

interface Document {
  id: string
  name: string
  type: string
  order_id: string
  po_number: string // Added po_number
  size: string
  created_at: string // Changed to created_at
  status: string
  url: string // Changed to url
  client_accessible: boolean
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-800"
    case "pending review":
      return "bg-yellow-100 text-yellow-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const getDocumentTypeIcon = (type: string) => {
  return <FileText className="h-4 w-4" />
}

export default function ClientPortalDocumentsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>(mockClientDocuments)
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>(mockClientDocuments)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])

  // ─── Data Fetching and Realtime Subscription ─────────────────────────
  useEffect(() => {
    if (!user?.id) {
      // If no user, use mock data and return
      setDocuments(mockClientDocuments)
      setFilteredDocuments(mockClientDocuments)
      return
    }

    const fetchDocuments = async () => {
      try {
        const documentsResponse = await fetch(`/api/client-portal/documents?clientId=${user.id}`)
        if (documentsResponse.ok) {
          const documentsData = await documentsResponse.json()
          if (documentsData.success) {
            // Map the fetched documents to match the local Document interface
            const fetchedDocs: Document[] = documentsData.data.documents.map((doc: any) => ({
              id: doc.id,
              name: doc.name,
              type: doc.type,
              order_id: doc.order_id,
              po_number: doc.order?.po_number || "N/A", // Access po_number from nested order object
              size: doc.size,
              created_at: doc.created_at,
              status: doc.status,
              url: doc.url,
              client_accessible: doc.client_accessible,
            }))
            setDocuments(fetchedDocs)
          } else {
            console.warn("Failed to fetch documents, using fallback data:", documentsData.error)
            setDocuments(mockClientDocuments)
          }
        } else {
          console.warn("Failed to fetch documents, using fallback data (HTTP error):", documentsResponse.status)
          setDocuments(mockClientDocuments)
        }
      } catch (error) {
        console.error("Error fetching documents:", error)
        setDocuments(mockClientDocuments)
      }
    }

    fetchDocuments() // Initial fetch

    // Set up Realtime subscription
    const documentsChannel = supabase
      .channel("client_documents_list_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "documents" }, (payload) => {
        console.log("Document change received for list!", payload)
        // Re-fetch documents when a change occurs
        fetchDocuments()
      })
      .subscribe()

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(documentsChannel)
    }
  }, [user?.id]) // Re-run effect if user ID changes

  // Filter documents based on search and filters
  useEffect(() => {
    let filtered = documents

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.po_number.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((doc) => doc.type.toLowerCase() === typeFilter.toLowerCase())
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((doc) => doc.status.toLowerCase() === statusFilter.toLowerCase())
    }

    setFilteredDocuments(filtered)
  }, [searchTerm, typeFilter, statusFilter, documents])

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId) ? prev.filter((id) => id !== documentId) : [...prev, documentId],
    )
  }

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([])
    } else {
      setSelectedDocuments(filteredDocuments.map((doc) => doc.id))
    }
  }

  const handleDownloadSelected = () => {
    if (selectedDocuments.length === 0) return

    // In a real app, this would trigger actual downloads
    alert(`Downloading ${selectedDocuments.length} selected documents`)
    console.log("Selected documents for download:", selectedDocuments)
  }

  const isAdmin = user?.role === "admin"

  const documentTypes = [...new Set(documents.map((doc) => doc.type))]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Banner */}
      {isAdmin && (
        <div className="bg-blue-600 text-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="font-medium">Admin View - Client Portal Documents</span>
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isAdmin ? "Admin View - Client Portal Documents" : `${user?.department || "Company"} Documents`}
            </h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? "Admin viewing client documents" : `Welcome ${user?.department || "Company"}`}
            </p>
            <p className="text-gray-600 text-sm mt-1">
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
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
        </div>

        {/* Additional Message for Documents Page */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm">All these documents are linked to your current orders.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {documents.filter((d) => d.status === "Approved").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {documents.filter((d) => d.status === "Pending Review").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {documents.filter((d) => new Date(d.created_at).getMonth() === new Date().getMonth()).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, type, or PO number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Document Types</SelectItem>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase()}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending review">Pending Review</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Document Types - Moved above Documents List */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documentTypes.slice(0, 4).map((type) => (
                <div key={type} className="flex justify-between text-sm">
                  <span>{type}</span>
                  <span className="text-gray-500">{documents.filter((d) => d.type === type).length}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Documents List</CardTitle>
            <CardDescription>
              {filteredDocuments.length} of {documents.length} documents shown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={
                            selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0
                          }
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>
                        <div className="flex items-center justify-between">
                          <span>Actions</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadSelected}
                            disabled={selectedDocuments.length === 0}
                            className="ml-2 bg-transparent"
                          >
                            Download Selected ({selectedDocuments.length})
                          </Button>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((document) => (
                      <TableRow key={document.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedDocuments.includes(document.id)}
                            onChange={() => handleDocumentSelect(document.id)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDocumentTypeIcon(document.type)}
                            <span className="font-medium">{document.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{document.type}</TableCell>
                        <TableCell>
                          <Link
                            href={`/client-portal/orders/${document.order_id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {document.po_number}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(document.status)}>{document.status}</Badge>
                        </TableCell>
                        <TableCell>{document.size}</TableCell>
                        <TableCell>{new Date(document.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => window.open(document.url, "_blank")}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => window.open(document.url, "_blank")}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
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
