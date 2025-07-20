"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, FileText, Download, Mail, Share2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Document {
  id: string
  name: string
  type: string
  url: string
}

interface ClientPackDocumentsProps {
  orderId: string
  availableDocuments: Document[]
}

export function ClientPackDocuments({ orderId, availableDocuments }: ClientPackDocumentsProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [recipientEmail, setRecipientEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleCheckboxChange = (docId: string, checked: boolean) => {
    setSelectedDocuments((prev) => (checked ? [...prev, docId] : prev.filter((id) => id !== docId)))
  }

  const handleGeneratePack = async () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "No Documents Selected",
        description: "Please select at least one document to generate the client pack.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate generating a combined document or a shareable link
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call

      const selectedDocNames = availableDocuments
        .filter((doc) => selectedDocuments.includes(doc.id))
        .map((doc) => doc.name)

      toast({
        title: "Client Pack Generated",
        description: `Pack with ${selectedDocNames.join(", ")} ready.`,
        variant: "success",
      })
      // In a real app, you'd get a URL for the generated pack
      console.log("Generated client pack for:", selectedDocNames)
    } catch (error) {
      console.error("Error generating client pack:", error)
      toast({
        title: "Error",
        description: "Failed to generate client pack.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleShareByEmail = async () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "No Documents Selected",
        description: "Please select at least one document to share.",
        variant: "destructive",
      })
      return
    }
    if (!recipientEmail.trim() || !recipientEmail.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid recipient email address.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate sending email with document links
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call

      const selectedDocNames = availableDocuments
        .filter((doc) => selectedDocuments.includes(doc.id))
        .map((doc) => doc.name)

      toast({
        title: "Documents Shared",
        description: `Selected documents sent to ${recipientEmail}.`,
        variant: "success",
      })
      console.log(`Shared ${selectedDocNames.join(", ")} with ${recipientEmail}`)
    } catch (error) {
      console.error("Error sharing documents:", error)
      toast({
        title: "Error",
        description: "Failed to share documents.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Pack & Document Sharing for Order {orderId}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div>
          <h3 className="font-semibold mb-2">Available Documents:</h3>
          {availableDocuments.length === 0 ? (
            <p className="text-muted-foreground text-sm">No documents available for this order.</p>
          ) : (
            <div className="grid gap-3">
              {availableDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`doc-${doc.id}`}
                      checked={selectedDocuments.includes(doc.id)}
                      onCheckedChange={(checked) => handleCheckboxChange(doc.id, !!checked)}
                    />
                    <Label htmlFor={`doc-${doc.id}`} className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {doc.name} ({doc.type})
                    </Label>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-1" /> View
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleGeneratePack} disabled={selectedDocuments.length === 0 || loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" /> Generate Client Pack
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipientEmail">Share via Email</Label>
          <div className="flex gap-2">
            <Input
              id="recipientEmail"
              type="email"
              placeholder="recipient@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleShareByEmail}
              disabled={selectedDocuments.length === 0 || !recipientEmail.includes("@") || loading}
            >
              <Mail className="mr-2 h-4 w-4" /> Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
