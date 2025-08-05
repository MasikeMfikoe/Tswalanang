"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Download, Search, Filter, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Document {
  id: string
  name: string
  type: string
  order: {
    po_number: string
  }
  status: string
  size: string
  created_at: string
}

interface DocumentStatistics {
  totalDocuments: number
  approvedDocuments: number
  pendingDocuments: number
  thisMonthDocuments: number
}

interface ClientDocumentsData {
  documents: Document[]
  statistics: DocumentStatistics
}

export default function ClientPortalDocumentsPage() {
  const { user } = useAuth()
  const [documentsData, setDocumentsData] = useState<ClientDocumentsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  useEffect(() => {
    if (user) {
      fetchDocuments()
    }
  }, [user])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/client-portal/documents?clientId=${user?.id}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setDocumentsData(result.data)
      } else {
        throw new Error(result.error || "Failed to fetch documents")
      }
    } catch (err) {
      console.error("Error fetching documents:", err)
      setError(err instanceof Error ? err.message : "An error occurred")

      // Fallback to mock data
      setDocumentsData({
        documents: [
          {
            id: "1",
            name: "Invoice-2023-001.pdf",
            type: "Invoice",
            order: { po_number: "PO-2023-001" },
            status: "Approved",
            size: "1.2 MB",
            created_at: "2023-06-15T10:30:00Z",
          },
          {
            id: "2",
            name: "BOL-2023-002.pdf",
            type: "Bill of Lading",
            order: { po_number: "PO-2023-002" },
            status: "Pending Review",
            size: "0.8 MB",
            created_at: "2023-06-20T14:15:00Z",
          },
          {
            id: "3",
            name: "Packing-List-2023-003.pdf",
            type: "Packing List",
            order: { po_number: "PO-2023-003" },
            status: "Approved",
            size: "0.5 MB",
            created_at: "2023-06-25T09:45:00Z",
          },
        ],
        statistics: {
          totalDocuments: 3,
          approvedDocuments: 2,
          pendingDocuments: 1,
          thisMonthDocuments: 3,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending review":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
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

  const filteredDocuments =
    documentsData?.documents.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.order.po_number.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = selectedStatus === "all" || doc.status.toLowerCase() === selectedStatus.toLowerCase()

      return matchesSearch && matchesStatus
    }) || []

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
        <p className="text-gray-600">View and manage your shipment documents</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">Error loading documents: {error}</p>
          </div>
          <p className="text-red-600 text-sm mt-1">Showing sample data instead.</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentsData?.statistics.totalDocuments || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{documentsData?.statistics.approvedDocuments || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{documentsData?.statistics.pendingDocuments || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentsData?.statistics.thisMonthDocuments || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending review">Pending Review</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>
            {filteredDocuments.length} of {documentsData?.documents.length || 0} documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Your documents will appear here once they are uploaded."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{document.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">{document.type}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">Order: {document.order.po_number}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{document.size}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{formatDate(document.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(document.status)}
                      <Badge className={getStatusColor(document.status)}>{document.status}</Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
