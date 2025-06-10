"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Search, FileText, Download, Eye, Filter, Upload, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock documents data - in real app, this would come from API filtered by client
const mockClientDocuments = [
  {
    id: "DOC-001",
    name: "Commercial Invoice - PO-ABC-001",
    type: "Commercial Invoice",
    orderId: "ORD-2024-001",
    poNumber: "PO-ABC-001",
    size: "245 KB",
    uploadedAt: "2024-01-15",
    status: "Approved",
    downloadUrl: "#",
  },
  {
    id: "DOC-002",
    name: "Bill of Lading - PO-ABC-001",
    type: "Bill of Lading",
    orderId: "ORD-2024-001",
    poNumber: "PO-ABC-001",
    size: "189 KB",
    uploadedAt: "2024-01-16",
    status: "Approved",
    downloadUrl: "#",
  },
  {
    id: "DOC-003",
    name: "Packing List - PO-ABC-002",
    type: "Packing List",
    orderId: "ORD-2024-002",
    poNumber: "PO-ABC-002",
    size: "156 KB",
    uploadedAt: "2024-01-12",
    status: "Approved",
    downloadUrl: "#",
  },
  {
    id: "DOC-004",
    name: "Certificate of Origin - PO-ABC-003",
    type: "Certificate of Origin",
    orderId: "ORD-2024-003",
    poNumber: "PO-ABC-003",
    size: "198 KB",
    uploadedAt: "2024-01-22",
    status: "Pending Review",
    downloadUrl: "#",
  },
  {
    id: "DOC-005",
    name: "Insurance Certificate - PO-ABC-001",
    type: "Insurance Certificate",
    orderId: "ORD-2024-001",
    poNumber: "PO-ABC-001",
    size: "167 KB",
    uploadedAt: "2024-01-17",
    status: "Approved",
    downloadUrl: "#",
  },
]

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
  const [documents, setDocuments] = useState(mockClientDocuments)
  const [filteredDocuments, setFilteredDocuments] = useState(mockClientDocuments)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filter documents based on search and filters
  useEffect(() => {
    let filtered = documents

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.poNumber.toLowerCase().includes(searchTerm.toLowerCase()),
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

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
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
            <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
            <p className="text-gray-600 mt-1">
              {isAdmin ? "Admin viewing client documents" : `Welcome ${user?.name}, here are your documents`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{filteredDocuments.length}</div>
            <div className="text-sm text-gray-600">Total Documents</div>
          </div>
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
                    {documents.filter((d) => new Date(d.uploadedAt).getMonth() === new Date().getMonth()).length}
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
                      <TableHead>Document Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((document) => (
                      <TableRow key={document.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDocumentTypeIcon(document.type)}
                            <span className="font-medium">{document.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{document.type}</TableCell>
                        <TableCell>
                          <Link
                            href={`/client-portal/orders/${document.orderId}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {document.poNumber}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(document.status)}>{document.status}</Badge>
                        </TableCell>
                        <TableCell>{document.size}</TableCell>
                        <TableCell>{new Date(document.uploadedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
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

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Upload additional documents for your orders</p>
              <Button className="w-full" disabled>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
              <p className="text-xs text-gray-500 mt-2">Contact support to upload documents</p>
            </CardContent>
          </Card>

          <Card>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Bulk Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Download multiple documents at once</p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" size="sm" disabled>
                  Download All Approved
                </Button>
                <Button variant="outline" className="w-full" size="sm" disabled>
                  Download by Order
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Contact support for bulk downloads</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
