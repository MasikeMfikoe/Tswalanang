"use client"

import { useState } from "react"
import { DocumentUpload } from "@/components/DocumentUpload"

export default function DocumentManagement({ orderId, isEditing }: { orderId: string; isEditing: boolean }) {
  const [documents, setDocuments] = useState([
    { id: 1, name: "Invoice.pdf", type: "Invoice" },
    { id: 2, name: "ShippingDoc.pdf", type: "Shipping Document" },
  ])

  return (
    <div className="space-y-6">
      <DocumentUpload isEditing={isEditing} orderId={orderId} />
    </div>
  )
}
