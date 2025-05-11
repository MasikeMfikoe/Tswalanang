"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { EstimateForm } from "@/components/EstimateForm"
import { estimates } from "@/lib/sample-data"
import { ArrowLeft } from "lucide-react"

export default function EditEstimatePage() {
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

      <EstimateForm initialData={estimate} isEditing={true} />
    </div>
  )
}
