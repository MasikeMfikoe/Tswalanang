"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface EstimateFormProps {
  initialData?: any
  isEditing?: boolean
  estimateId?: any
}

export function EstimateForm({ initialData, isEditing = false, estimateId }: EstimateFormProps) {
  const router = useRouter()
  const [customerName, setCustomerName] = useState(initialData?.customerName || "")
  const [customerEmail, setCustomerEmail] = useState(initialData?.customerEmail || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          freight_type: "Air Freight",
          commercial_value: 0,
          customs_duties: 0,
          customs_vat: 0,
          handling_fees: 0,
          shipping_cost: 0,
          documentation_fee: 0,
          communication_fee: 0,
          total_disbursements: 0,
          facility_fee: 0,
          agency_fee: 0,
          subtotal: 0,
          vat: 0,
          total_amount: 0,
          notes: "",
          status: "Draft",
        }),
      })

      if (response.ok) {
        router.push("/estimates")
      } else {
        console.error("Failed to create estimate")
      }
    } catch (error) {
      console.error("Error creating estimate:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Estimate</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Customer Name</label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Customer Email</label>
            <Input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Enter customer email"
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/estimates")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Estimate"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
