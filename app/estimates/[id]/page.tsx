"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, Download, Send } from "lucide-react"
import Link from "next/link"
import { getEstimateById } from "@/lib/api/estimatesApi"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/lib/toast"
import type { Estimate } from "@/types/models"
import html2pdf from "html2pdf.js" // Import html2pdf.js

export default function EstimateDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id === "new") {
      router.replace("/estimates/new")
      return
    }

    if (id) {
      fetchEstimate()
    }
  }, [id, router])

  const fetchEstimate = async () => {
    if (!id || id === "new") {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await getEstimateById(id)

      if (response.success && response.data) {
        setEstimate(response.data)
      } else {
        let errorMessage = response.message || "Failed to load estimate"

        if (response.message?.includes("not found in database")) {
          errorMessage = `Estimate "${id}" does not exist. It may have been deleted or the ID is incorrect.`
        } else if (response.message?.includes("No estimates found")) {
          errorMessage = "No estimates exist in the database yet. Please create an estimate first."
        } else if (response.message?.includes("Invalid estimate ID")) {
          errorMessage = "The estimate ID format is invalid. Please check the URL."
        }

        setError(errorMessage)
      }
    } catch (err: any) {
      console.error("Failed to fetch estimate:", err)
      setError("Failed to load estimate. Please check your connection and try again.")
      toast({
        title: "Error",
        description: err.message || "Failed to load estimate",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-gray-500"
      case "Sent":
        return "bg-blue-500"
      case "Accepted":
        return "bg-green-500"
      case "Rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("en-ZA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch {
      return "N/A"
    }
  }

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount
    if (typeof numAmount !== "number" || isNaN(numAmount)) return "R 0.00"
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(numAmount)
  }

  const handleDownloadPdf = () => {
    const element = document.getElementById("estimate-content")
    if (element) {
      html2pdf()
        .from(element)
        .save(`Estimate-${estimate?.displayId || estimate?.id}.pdf`)
      toast({
        title: "Downloading PDF",
        description: "Your estimate PDF is being generated.",
      })
    } else {
      toast({
        title: "Error",
        description: "Could not find content to generate PDF.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center py-8">
          <Spinner className="h-8 w-8" />
          <span className="ml-2">Loading estimate...</span>
        </div>
      </div>
    )
  }

  if (error || !estimate) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">
            <p className="text-lg font-semibold">Estimate Not Found</p>
            <p className="text-sm">{error || "Estimate not found"}</p>
          </div>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={fetchEstimate} className="bg-transparent">
              Try Again
            </Button>
            <Link href="/estimates">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Estimates
              </Button>
            </Link>
            <Link href="/estimates/new">
              <Button>Create New Estimate</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estimate {estimate.displayId || estimate.id}</h1>
          <p className="text-muted-foreground">View and manage estimate details</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/estimates/${estimate.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Link href="/estimates">
            <Button variant="outline">
              <Send className="mr-2 h-4 w-4" />
              Send to Customer
            </Button>
          </Link>
          <Link href="/estimates">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Estimates
            </Button>
          </Link>
        </div>
      </div>

      {/* Wrap the content to be printed in a div with a specific ID */}
      <div id="estimate-content" className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Estimate Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estimate ID</label>
                    <p className="font-mono">{estimate.displayId || estimate.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <Badge variant="secondary" className={getStatusColor(estimate.status)}>
                        {estimate.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer Name</label>
                    <p>{estimate.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer Email</label>
                    <p>{estimate.customerEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Freight Type</label>
                    <p>{estimate.freightType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created Date</label>
                    <p>{formatDate(estimate.createdAt)}</p>
                  </div>
                </div>
                {estimate.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notes</label>
                    <p className="mt-1 text-sm text-gray-700">{estimate.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Commercial Value</span>
                    <span>{formatCurrency(estimate.commercialValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customs Duties</span>
                    <span>{formatCurrency(estimate.customsDuties)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customs VAT</span>
                    <span>{formatCurrency(estimate.customsVAT)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Handling Fees</span>
                    <span>{formatCurrency(estimate.handlingFees)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Cost</span>
                    <span>{formatCurrency(estimate.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Documentation Fee</span>
                    <span>{formatCurrency(estimate.documentationFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Communication Fee</span>
                    <span>{formatCurrency(estimate.communicationFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Disbursements</span>
                    <span>{formatCurrency(estimate.totalDisbursements)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Facility Fee</span>
                    <span>{formatCurrency(estimate.facilityFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agency Fee</span>
                    <span>{formatCurrency(estimate.agencyFee)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(estimate.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT</span>
                    <span>{formatCurrency(estimate.vat)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>{formatCurrency(estimate.totalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/estimates/${estimate.id}/edit`}>
                  <Button className="w-full bg-transparent" variant="outline">
                    <Send className="mr-2 h-4 w-4" />
                    Send to Customer
                  </Button>
                </Link>
                <Button className="w-full bg-transparent" variant="outline" onClick={handleDownloadPdf}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Link href={`/estimates/${estimate.id}/edit`}>
                  <Button className="w-full bg-transparent" variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Estimate
                  </Button>
                </Link>
                <Button className="w-full" variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Estimate
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estimate History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Created</span>
                    <span>{formatDate(estimate.createdAt)}</span>
                  </div>
                  {estimate.updatedAt && (
                    <div className="flex justify-between">
                      <span>Last Updated</span>
                      <span>{formatDate(estimate.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
