"use client"

import { useState } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import DocumentManagement from "@/components/DocumentManagement" // Ensure this is the default export
import { DocumentUpload } from "@/components/DocumentUpload" // Assuming this component handles the actual upload logic
import { useDocuments } from "@/hooks/useDocumentsQuery" // Import the hook for fetching documents
import { PageHeader } from "@/components/ui/page-header"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  // Fetch all documents for the admin view
  const { data: documentsData, isLoading, error, refetch } = useDocuments({})
  const documents = documentsData || []

  const handleUploadSuccess = async () => {
    toast({
      title: "Document Uploaded",
      description: "Your document has been successfully uploaded.",
      variant: "default",
    })
    await refetch() // Refetch documents after successful upload
  }

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <ProtectedRoute requiredPermission={{ module: "documents", action: "view" }}>
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
        <PageHeader title="Document Management" description="Manage all uploaded documents across all orders." />
        {isLoading ? (
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-4 text-lg text-muted-foreground">Loading documents...</span>
          </main>
        ) : error ? (
          <main className="flex-1 p-6 flex items-center justify-center">
            <Card className="w-full max-w-md p-6 text-center">
              <CardTitle className="text-red-500">Error Loading Documents</CardTitle>
              <CardContent>
                <p>{error.message || "Failed to load documents. Please try again."}</p>
              </CardContent>
            </Card>
          </main>
        ) : (
          <main className="flex-1 p-6">
            <DocumentManagement documents={filteredDocuments} isEditing={true} showOrderIdColumn={true} />
            {/* DocumentUpload component for general document uploads */}
            <DocumentUpload onUploadComplete={handleUploadSuccess} />
          </main>
        )}
      </div>
    </ProtectedRoute>
  )
}
