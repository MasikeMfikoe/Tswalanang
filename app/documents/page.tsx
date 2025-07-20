"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { documents } from "@/lib/sample-data"
import { PageHeader } from "@/components/ui/page-header"
import { DocumentManagement } from "@/components/DocumentManagement"

export default function DocumentsPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")

  const filteredDocuments = documents.filter((doc) => {
    return (
      (typeFilter === "All" || doc.type === typeFilter) &&
      (doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.poNumber.toLowerCase().includes(search.toLowerCase()))
    )
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Document Management" description="Upload, view, and manage all shipment-related documents." />
      <DocumentManagement />
      <div className="h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Documents</h1>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Return to Dashboard
            </Button>
          </div>

          <div className="flex space-x-4 mb-6">
            <Input
              placeholder="Search by Document Name or PO Number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-1/2"
            />
            <Select onValueChange={setTypeFilter} value={typeFilter}>
              <SelectTrigger className="w-1/3">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Invoice">Invoice</SelectItem>
                <SelectItem value="Shipping Document">Shipping Document</SelectItem>
                <SelectItem value="Customs Form">Customs Form</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{doc.name}</p>
                  <p className="text-sm text-gray-600">Type: {doc.type}</p>
                  <p className="text-sm text-gray-500">Upload Date: {doc.uploadDate}</p>
                  <Link href={`/orders/${doc.poNumber}`} className="text-blue-600 hover:underline">
                    PO Number: {doc.poNumber}
                  </Link>
                </div>
                <Button onClick={() => router.push(`/documents/${doc.id}`)}>View Document</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
