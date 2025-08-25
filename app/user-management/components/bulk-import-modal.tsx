"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, Users } from "lucide-react"

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (users: any[]) => void
}

export function BulkImportModal({ isOpen, onClose, onImport }: BulkImportModalProps) {
  const [csvData, setCsvData] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUsers, setPreviewUsers] = useState<any[]>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/csv") {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setCsvData(text)
        parseCSVPreview(text)
      }
      reader.readAsText(file)
    }
  }

  const parseCSVPreview = (csvText: string) => {
    const lines = csvText.trim().split("\n")
    const firstLine = lines[0]
    const separator = firstLine.includes(";") ? ";" : ","
    const headers = firstLine.split(separator).map((h) => h.trim().replace(/"/g, ""))

    const users = lines.slice(1, 6).map((line) => {
      // Preview first 5 users
      const values = line.split(separator).map((v) => v.trim().replace(/"/g, ""))
      const user: any = {}
      headers.forEach((header, index) => {
        user[header] = values[index] || ""
      })
      return user
    })

    setPreviewUsers(users)
  }

  const handleImport = async () => {
    if (!csvData) return

    setIsProcessing(true)
    try {
      const lines = csvData.trim().split("\n")
      const firstLine = lines[0]
      const separator = firstLine.includes(";") ? ";" : ","
      const headers = firstLine.split(separator).map((h) => h.trim().replace(/"/g, ""))

      const users = lines.slice(1).map((line) => {
        const values = line.split(separator).map((v) => v.trim().replace(/"/g, ""))
        const user: any = {}
        headers.forEach((header, index) => {
          user[header] = values[index] || ""
        })

        return {
          username: user.username || user.email?.split("@")[0] || "",
          email: user.email || "",
          role: user.role || "employee",
          name: user.full_name || user.name || user.first_name || "",
          surname: user.surname || "",
          department: user.department || "",
        }
      })

      await onImport(users)
      onClose()
      setCsvData("")
      setPreviewUsers([])
    } catch (error) {
      console.error("Error importing users:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Import Users
          </DialogTitle>
          <DialogDescription>Upload a CSV file or paste CSV data to import multiple users at once.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <Input id="csv-file" type="file" accept=".csv" onChange={handleFileUpload} className="mt-1" />
          </div>

          <div>
            <Label htmlFor="csv-data">Or Paste CSV Data</Label>
            <Textarea
              id="csv-data"
              placeholder="username,email,role,name,surname,department&#10;john.doe,john@example.com,employee,John,Doe,IT&#10;jane.smith,jane@example.com,manager,Jane,Smith,Operations"
              value={csvData}
              onChange={(e) => {
                setCsvData(e.target.value)
                parseCSVPreview(e.target.value)
              }}
              rows={6}
              className="mt-1 font-mono text-sm"
            />
          </div>

          {previewUsers.length > 0 && (
            <div>
              <Label>Preview (First 5 users)</Label>
              <div className="mt-2 border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(previewUsers[0]).map((header) => (
                        <th key={header} className="px-3 py-2 text-left font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewUsers.map((user, index) => (
                      <tr key={index} className="border-t">
                        {Object.values(user).map((value: any, i) => (
                          <td key={i} className="px-3 py-2">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!csvData || isProcessing} className="flex items-center gap-2">
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import Users
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
