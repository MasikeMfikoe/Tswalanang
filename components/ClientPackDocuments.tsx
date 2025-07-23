"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, FileText, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Document {
  id: string
  name: string
  type: string
  url: string
  status: "Processed" | "Pending" | "Failed"
}

interface ClientPackDocumentsProps {
  orderId: string
  documents: Document[]
}

export function ClientPackDocuments({ orderId, documents }: ClientPackDocumentsProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleCheckboxChange = (docId: string, checked: boolean) => {
    setSelectedDocuments((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(docId)
      } else {
        newSet.delete(docId)
      }
      return newSet
    })
  }

  const handleGenerateClientPack = async () => {
    if (selectedDocuments.size === 0) {
      toast({
        title: "No Documents Selected",
        description: "Please select at least one document to include in the client pack.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    toast({
      title: "Generating Client Pack",
      description: "Your client pack is being prepared...",
      duration: 3000,
    })

    try {
      // Simulate API call to generate client pack
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const selectedDocDetails = documents.filter((doc) => selectedDocuments.has(doc.id))
      console.log(`Generating client pack for order ${orderId} with documents:`, selectedDocDetails)

      // In a real application, this would trigger a backend process
      // that combines documents and returns a downloadable URL.
      const mockDownloadUrl = `/api/client-pack/download?orderId=${orderId}&docs=${Array.from(selectedDocuments).join(
        ",",
      )}`

      toast({
        title: "Client Pack Ready!",
        description: "Your client pack has been successfully generated.",
        action: (
          <Button asChild variant="outline">
            <a href={mockDownloadUrl} download>
              <Download className="mr-2 h-4 w-4" /> Download
            </a>
          </Button>
        ),
        duration: 5000,
      })
    } catch (error) {
      console.error("Error generating client pack:", error)
      toast({
        title: "Generation Failed",
        description: "There was an error generating the client pack. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const processedDocuments = documents.filter((doc) => doc.status === "Processed")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Pack Documents</CardTitle>
        <CardDescription>Select documents to include in the client-facing pack.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {processedDocuments.length === 0 ? (
          <p className="text-center text-gray-500">No processed documents available for this order.</p>
        ) : (
          <ScrollArea className="h-48 border rounded-md p-4">
            <div className="space-y-3">
              {processedDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`doc-${doc.id}`}
                      checked={selectedDocuments.has(doc.id)}
                      onCheckedChange={(checked) => handleCheckboxChange(doc.id, checked as boolean)}
                    />
                    <Label htmlFor={`doc-${doc.id}`} className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span>{doc.name}</span>
                      <Badge variant="secondary">{doc.type}</Badge>
                    </Label>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <Button
          onClick={handleGenerateClientPack}
          className="w-full"
          disabled={isGenerating || processedDocuments.length === 0}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" /> Generate Client Pack
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export default ClientPackDocuments
