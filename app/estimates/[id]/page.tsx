"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft, Edit, Trash } from "lucide-react"
import { estimates } from "@/lib/sample-data"

export default function ViewEstimatePage() {
  const router = useRouter()
  const params = useParams()
  const [estimate, setEstimate] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would be an API call
    const id = params.id as string
    const foundEstimate = estimates.find((e) => e.id === id)

    if (foundEstimate) {
      setEstimate(foundEstimate)
    } else {
      // Handle not found
      router.push("/estimates")
    }

    setLoading(false)
  }, [params.id, router])

  // Format currency for display
  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === "string" ? Number.parseFloat(value) : value
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(numValue)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!estimate) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Estimate Not Found</h2>
          <p className="text-muted-foreground mb-4">The estimate you're looking for doesn't exist.</p>
          <Link href="/estimates">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Estimates
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Calculate values based on the estimate data
  const commercialValue = Number.parseFloat(estimate.commercialValue || "0")
  const customsDuties = Number.parseFloat(estimate.customsDuties || "0")
  const handlingFees = Number.parseFloat(estimate.handlingFees || "0")
  const shippingCost = Number.parseFloat(estimate.shippingCost || "0")
  const documentationFee = Number.parseFloat(estimate.documentationFee || "0")
  const communicationFee = Number.parseFloat(estimate.communicationFee || "0")

  // Calculate VAT on commercial value (15%)
  const customsVAT = commercialValue * 0.15

  // Calculate total disbursements
  const totalDisbursements =
    customsDuties + customsVAT + handlingFees + shippingCost + documentationFee + communicationFee

  // Calculate facility fee (2.5% of total disbursements)
  const facilityFee = totalDisbursements * 0.025

  // Calculate agency fee (3.5% of total disbursements)
  const agencyFee = totalDisbursements * 0.035

  // Calculate subtotal
  const subtotal = totalDisbursements + facilityFee + agencyFee

  // Calculate VAT on subtotal (15%)
  const vat = subtotal * 0.15

  // Calculate total
  const total = subtotal + vat

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/estimates">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estimate #{estimate.id}</h1>
            <p className="text-muted-foreground">View estimate details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/estimates/${estimate.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" size="sm">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
                <p className="font-medium">{estimate.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer Email</p>
                <p className="font-medium">{estimate.customerEmail}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Freight Type</p>
              <p className="font-medium">{estimate.freightType}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {estimate.freightType === "Air Freight" && "Air freight provides faster delivery with premium rates"}
                {estimate.freightType === "Sea Freight" && "Sea freight is more economical for larger shipments"}
                {estimate.freightType === "EXW" && "Ex Works - Buyer arranges collection from seller's premises"}
                {estimate.freightType === "FOB" && "Free On Board - Seller delivers goods on board the vessel"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Estimate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Commercial Value:</span>
              <span className="font-medium">{formatCurrency(commercialValue)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Customs Duties:</span>
              <span className="font-medium">{formatCurrency(customsDuties)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Customs VAT (15% of commercial value):</span>
              <span className="font-medium">{formatCurrency(customsVAT)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Handling Fees:</span>
              <span className="font-medium">{formatCurrency(handlingFees)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Shipping Cost:</span>
              <span className="font-medium">{formatCurrency(shippingCost)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">
                Documentation Fee ({estimate.freightType === "Air Freight" ? "Air" : "Sea"}):
              </span>
              <span className="font-medium">{formatCurrency(documentationFee)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">
                Communication Fee ({estimate.freightType === "Air Freight" ? "Air" : "Sea"}):
              </span>
              <span className="font-medium">{formatCurrency(communicationFee)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Total Disbursements:</span>
              <span className="font-medium">{formatCurrency(totalDisbursements)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Facility Fee (2.5%):</span>
              <span className="font-medium">{formatCurrency(facilityFee)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Agency Fee (3.5%):</span>
              <span className="font-medium">{formatCurrency(agencyFee)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm font-medium">VAT (15%):</span>
              <span className="font-medium">{formatCurrency(vat)}</span>
            </div>
            <div className="flex items-center justify-between py-2 font-bold">
              <span>Total:</span>
              <span className="text-xl">{formatCurrency(total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {estimate.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{estimate.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
