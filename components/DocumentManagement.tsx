"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Trash2, Download, Loader2, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Document {
  id: string
  name: string
  type: string
  uploadDate: string
  status: "Processed" | "Pending" | "Failed"
  url: string
}

interface DocumentManagementProps {
  documents: Document[]
  onDelete: (id: string) => void
}

export function DocumentManagement({ documents, onDelete }: DocumentManagementProps) {
  const [processingDocId, setProcessingDocId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleProcessDocument = async (documentId: string, imageUrl: string) => {
    setProcessingDocId(documentId)
    toast({
      title: "Processing Document",
      description: "Document is being processed by OCR. This may take a moment...",
      duration: 5000,
    })
    try {
      const response = await fetch("/api/documents/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documentId, imageUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to process document")
      }

      const result = await response.json()
      console.log("Document processed:", result)
      toast({
        title: "Document Processed",
        description: `Document ${documentId} has been successfully processed.`,
      })
      // In a real app, you'd update the document status in your state/database
      // For this mock, we'll just show the toast.
    } catch (error: any) {
      console.error("Error processing document:", error)
      toast({
        title: "Processing Failed",
        description: error.message || `Failed to process document ${documentId}.`,
        variant: "destructive",
      })
    } finally {
      setProcessingDocId(null)
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Upload Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-gray-500 py-4">
              No documents found.
            </TableCell>
          </TableRow>
        ) : (
          documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium">{doc.name}</TableCell>
              <TableCell>{doc.type}</TableCell>
              <TableCell>{doc.uploadDate}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    doc.status === "Processed" ? "success" : doc.status === "Pending" ? "secondary" : "destructive"
                  }
                >
                  {doc.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${doc.name}`}>
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={doc.url} download aria-label={`Download ${doc.name}`}>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  {doc.status === "Pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleProcessDocument(doc.id, doc.url)}
                      disabled={processingDocId === doc.id}
                      aria-label={`Process ${doc.name}`}
                    >
                      {processingDocId === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(doc.id)}
                    aria-label={`Delete ${doc.name}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

export default DocumentManagement
