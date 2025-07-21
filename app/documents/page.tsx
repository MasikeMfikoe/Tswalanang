"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { DocumentUpload } from "@/components/DocumentUpload"
import { DocumentManagement } from "@/components/DocumentManagement"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([
    {
      id: "doc1",
      name: "Bill of Lading ORD001",
      type: "Bill of Lading",
      uploadDate: "2024-07-10",
      status: "Processed",
      url: "/placeholder.pdf",
    },
    {
      id: "doc2",
      name: "Commercial Invoice ORD002",
      type: "Commercial Invoice",
      uploadDate: "2024-07-12",
      status: "Pending",
      url: "/placeholder.pdf",
    },
    {
      id: "doc3",
      name: "Packing List ORD003",
      type: "Packing List",
      uploadDate: "2024-07-15",
      status: "Processed",
      url: "/placeholder.pdf",
    },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const handleDocumentUpload = (newDoc: { id: string; name: string; type: string; url: string }) => {
    setDocuments((prevDocs) => [
      ...prevDocs,
      { ...newDoc, uploadDate: new Date().toISOString().split("T")[0], status: "Pending" },
    ])
    toast({
      title: "Document Uploaded",
      description: `${newDoc.name} has been uploaded. It will be processed shortly.`,
    })
  }

  const handleDocumentDelete = (idToDelete: string) => {
    setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== idToDelete))
    toast({
      title: "Document Deleted",
      description: "The document has been removed.",
      variant: "destructive",
    })
  }

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Document Management</h1>
        <DocumentUpload onUploadSuccess={handleDocumentUpload} />
      </header>
      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
            <CardDescription>Manage all uploaded shipment documents.</CardDescription>
            <div className="relative w-full max-w-sm">
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <DocumentManagement documents={filteredDocuments} onDelete={handleDocumentDelete} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
