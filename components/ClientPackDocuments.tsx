"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Eye, Download, Loader2 } from "lucide-react"
import { useClientDocumentsQuery } from "@/hooks/useDocumentsQuery"
import { useToast } from "@/components/ui/use-toast"
import { getDocumentStatusVariant } from "@/lib/document-utils"
import { useAuth } from "@/contexts/AuthContext"

export default function ClientPackDocuments() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")

  const {
    data: clientDocumentsData,
    isLoading: isLoadingDocuments,
    isError: isDocumentsError,
    error: documentsError,
  } = useClientDocumentsQuery(user?.id || null)

  const documents = clientDocumentsData?.documents || []
  const customerName = clientDocumentsData?.customerName || "Your Company"

  const handleDownload = (fileUrl: string, fileName: string) => {
    window.open(fileUrl, "_blank")
  }

  const handleView = (fileUrl: string) => {
    window.open(fileUrl, "_blank")
  }

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.po_number?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isAuthLoading || isLoadingDocuments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Documents</CardTitle>
          <CardDescription>Loading your documents...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isDocumentsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Documents</CardTitle>
          <CardDescription>Error loading documents.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <p>Error: {documentsError?.message || "An unexpected error occurred."}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Documents</CardTitle>
        <CardDescription>Access all documents related to your orders with {customerName}.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search documents..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No documents found.</p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchTerm
                ? "Try adjusting your search."
                : "Documents will appear here once uploaded by your logistics provider."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Order PO</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {doc.file_name}
                    </TableCell>
                    <TableCell>{(doc as any).po_number || doc.order_id}</TableCell> {/* Use po_number if available */}
                    <TableCell>{doc.document_type}</TableCell>
                    <TableCell>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getDocumentStatusVariant(doc.status)}>{doc.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(doc.file_url)}
                          title="View Document"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc.file_url, doc.file_name)}
                          title="Download Document"
                        >
                          <Download className="h-4 w-4" />
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
  )
}
