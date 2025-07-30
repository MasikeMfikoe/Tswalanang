"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { FileText, Search, Filter, ChevronDown, RefreshCcw, Download } from "lucide-react"

import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { supabase } from "@/lib/supabaseClient"

// ─────────────────────────────────────────────────────────────────────────
//  MOCK DATA (for demonstration if API fails or user is not logged in)
// ─────────────────────────────────────────────────────────────────────────
const mockDocuments = [
  {
    id: "DOC-001",
    name: "Bill of Lading - ORD-2024-001",
    type: "PDF",
    order_id: "ORD-2024-001",
    uploaded_at: "2024-01-20T11:00:00Z",
    url: "/placeholder.pdf",
    customer_id: "client-user-1",
  },
  {
    id: "DOC-002",
    name: "Commercial Invoice - ORD-2024-001",
    type: "PDF",
    order_id: "ORD-2024-001",
    uploaded_at: "2024-01-22T09:00:00Z",
    url: "/placeholder.pdf",
    customer_id: "client-user-1",
  },
  {
    id: "DOC-003",
    name: "Packing List - ORD-2024-002",
    type: "PDF",
    order_id: "ORD-2024-002",
    uploaded_at: "2024-01-25T14:00:00Z",
    url: "/placeholder.pdf",
    customer_id: "client-user-1",
  },
  {
    id: "DOC-004",
    name: "Certificate of Origin - ORD-2024-003",
    type: "PDF",
    order_id: "ORD-2024-003",
    uploaded_at: "2024-01-28T10:00:00Z",
    url: "/placeholder.pdf",
    customer_id: "client-user-1",
  },
  {
    id: "DOC-005",
    name: "Customs Declaration - ORD-2024-004",
    type: "PDF",
    order_id: "ORD-2024-004",
    uploaded_at: "2024-02-01T16:00:00Z",
    url: "/placeholder.pdf",
    customer_id: "client-user-2",
  },
]

// ─────────────────────────────────────────────────────────────────────────
//  UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────
const getFileTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf":
      return "bg-red-100 text-red-800"
    case "doc":
    case "docx":
      return "bg-blue-100 text-blue-800"
    case "xls":
    case "xlsx":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// ─────────────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────
export default function ClientPortalDocumentsPage() {
  const { user, isLoading: isUserLoading } = useAuth()
  const router = useRouter()

  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10) // You can make this configurable

  const fetchDocuments = async () => {
    if (!user?.id) {
      setDocuments(mockDocuments.filter((doc) => doc.customer_id === "client-user-1")) // Filter mock documents for a specific client
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/client-portal/documents?clientId=${user.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch documents")
      }
      const data = await response.json()
      if (data.success) {
        setDocuments(data.data.documents || [])
      } else {
        console.warn("API returned success: false, using mock data.", data.error)
        setDocuments(mockDocuments.filter((doc) => doc.customer_id === "client-user-1"))
      }
    } catch (err: any) {
      console.error("Error fetching documents:", err)
      setError(err.message || "Failed to load documents.")
      setDocuments(mockDocuments.filter((doc) => doc.customer_id === "client-user-1")) // Fallback to mock data on error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()

    // Set up Realtime subscriptions
    const documentsChannel = supabase
      .channel("client_portal_documents_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "documents" }, (payload) => {
        console.log("Realtime document change received for client portal documents page!", payload)
        fetchDocuments() // Re-fetch data on any document change
      })
      .subscribe()

    return () => {
      supabase.removeChannel(documentsChannel)
    }
  }, [user?.id]) // Re-run effect if user ID changes

  const filteredDocuments = useMemo(() => {
    let filtered = documents

    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.order_id?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterType) {
      filtered = filtered.filter((doc) => doc.type.toLowerCase() === filterType.toLowerCase())
    }

    return filtered
  }, [documents, searchTerm, filterType])

  // Pagination logic
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage)
  const currentDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredDocuments.slice(startIndex, endIndex)
  }, [filteredDocuments, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (isUserLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading documents...</p>
        </div>
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

  // Redirect if not a client or guest user
  if (!user || (user.role !== "client" && user.role !== "guest" && user.role !== "admin")) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">You don't have permission to access this page.</p>
            <Button className="w-full mt-4" onClick={() => router.push("/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" /> Your Documents
            </CardTitle>
            <CardDescription>View and download all your associated logistics documents.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by document name or order ID..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                      <Filter className="h-4 w-4" />
                      {filterType ? `Type: ${filterType.toUpperCase()}` : "Filter by Type"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter Document Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilterType(null)}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType("pdf")}>PDF</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType("doc")}>DOC/DOCX</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType("xls")}>XLS/XLSX</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={fetchDocuments} variant="outline" size="icon" title="Refresh Documents">
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {currentDocuments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No documents found matching your criteria.
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterType(null)
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Uploaded At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.name}</TableCell>
                          <TableCell>
                            <Badge className={getFileTypeColor(doc.type)}>{doc.type.toUpperCase()}</Badge>
                          </TableCell>
                          <TableCell>{doc.order_id || "N/A"}</TableCell>
                          <TableCell>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" /> Download
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage > 1) handlePageChange(currentPage - 1)
                        }}
                        aria-disabled={currentPage === 1}
                        tabIndex={currentPage === 1 ? -1 : undefined}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === currentPage}
                          onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(page)
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage < totalPages) handlePageChange(currentPage + 1)
                        }}
                        aria-disabled={currentPage === totalPages}
                        tabIndex={currentPage === totalPages ? -1 : undefined}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
