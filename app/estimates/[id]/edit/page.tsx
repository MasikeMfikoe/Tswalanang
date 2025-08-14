"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { EstimateForm } from "@/components/EstimateForm"
import { ArrowLeft } from "lucide-react"
import { getEstimateById } from "@/lib/api/estimatesApi"
import { toast } from "@/lib/toast"

export default function EditEstimatePage() {
  const router = useRouter()
  const params = useParams()
  const [estimate, setEstimate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        setLoading(true)
        setError(null)
        const id = params.id as string
        const response = await getEstimateById(id)
        setEstimate(response.data)
      } catch (err) {
        console.error("Error fetching estimate:", err)
        setError("Failed to load estimate details. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load estimate details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEstimate()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
        <span className="ml-2">Loading estimate details...</span>
      </div>
    )
  }

  if (error || !estimate) {
    return (
      <div className="container mx-auto py-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Estimate Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The estimate you're looking for doesn't exist or couldn't be loaded.
          </p>
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/estimates/${estimate.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Estimate #{estimate.id}</h1>
          <p className="text-muted-foreground">Update estimate details</p>
        </div>
      </div>

      <EstimateForm
        initialData={{
          customerId: estimate.customer_id,
          customerEmail: estimate.customer_email,
          freightType: estimate.freight_type,
          commercialValue: estimate.commercial_value.toString(),
          customsDuties: estimate.customs_duties.toString(),
          handlingFees: estimate.handling_fees.toString(),
          shippingCost: estimate.shipping_cost.toString(),
          documentationFee: estimate.documentation_fee.toString(),
          communicationFee: estimate.communication_fee.toString(),
          notes: estimate.notes || "",
        }}
        isEditing={true}
        estimateId={estimate.id}
      />
    </div>
  )
}
