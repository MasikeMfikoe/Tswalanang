"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/lib/toast"
import { ArrowLeft, Edit, Trash2, FileText, Send } from "lucide-react"
import { getEstimateById, deleteEstimate, updateEstimate } from "@/lib/api/estimatesApi"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function EstimateDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [estimate, setEstimate] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteEstimate(estimate.id)
      toast({
        title: "Estimate deleted",
        description: "The estimate has been deleted successfully",
      })
      router.push("/estimates")
    } catch (err) {
      console.error("Error deleting estimate:", err)
      toast({
        title: "Error",
        description: "Failed to delete estimate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateEstimate(estimate.id, { status: newStatus })
      setEstimate({ ...estimate, status: newStatus })
      toast({
        title: "Status updated",
        description: `Estimate status changed to ${newStatus}`,
      })
    } catch (err) {
      console.error("Error updating status:", err)
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      })
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
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/estimates">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estimate #{estimate.id}</h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">Created on {formatDate(estimate.createdAt)}</p>
              <Badge variant="secondary" className={getStatusColor(estimate.status)}>
                {estimate.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {estimate.status === "Draft" && (
            <Button onClick={() => handleStatusChange("Sent")} className="bg-blue-500 hover:bg-blue-600">
              <Send className="mr-2 h-4 w-4" />
              Send to Customer
            </Button>
          )}
          <Link href={`/estimates/${estimate.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            className="text-red-500 hover:text-red-600 bg-transparent"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Estimate Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Customer</h3>
                <p className="text-lg font-medium">{estimate.customerName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p className="text-lg font-medium">{estimate.customerEmail}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Freight Type</h3>
                <p className="text-lg font-medium">{estimate.freightType}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Commercial Value</h3>
                <p className="text-lg font-medium">{formatCurrency(Number.parseFloat(estimate.commercialValue))}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Costs Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Customs Duties</span>
                  <span>{formatCurrency(Number.parseFloat(estimate.customsDuties))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customs VAT (15%)</span>
                  <span>{formatCurrency(estimate.customsVAT)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Handling Fees</span>
                  <span>{formatCurrency(Number.parseFloat(estimate.handlingFees))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Cost</span>
                  <span>{formatCurrency(Number.parseFloat(estimate.shippingCost))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Documentation Fee</span>
                  <span>{formatCurrency(Number.parseFloat(estimate.documentationFee))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Communication Fee</span>
                  <span>{formatCurrency(Number.parseFloat(estimate.communicationFee))}</span>
                </div>
              </div>
            </div>

            {estimate.notes && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Notes</h3>
                <p className="text-muted-foreground">{estimate.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span>Total Disbursements</span>
              <span className="font-medium">{formatCurrency(estimate.totalDisbursements)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Facility Fee (2.5%)</span>
              <span className="font-medium">{formatCurrency(estimate.facilityFee)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Agency Fee (3.5%)</span>
              <span className="font-medium">{formatCurrency(estimate.agencyFee)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Subtotal</span>
              <span className="font-medium">{formatCurrency(estimate.subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>VAT (15%)</span>
              <span className="font-medium">{formatCurrency(estimate.vat)}</span>
            </div>
            <div className="flex justify-between py-2 font-bold">
              <span>Total</span>
              <span className="text-xl">{formatCurrency(estimate.totalAmount)}</span>
            </div>

            {estimate.status === "Draft" && (
              <Button onClick={() => handleStatusChange("Sent")} className="w-full bg-blue-500 hover:bg-blue-600 mt-4">
                <Send className="mr-2 h-4 w-4" />
                Send to Customer
              </Button>
            )}
            {estimate.status === "Sent" && (
              <div className="space-y-2 mt-4">
                <Button
                  onClick={() => handleStatusChange("Accepted")}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  Accept Estimate
                </Button>
                <Button onClick={() => handleStatusChange("Rejected")} className="w-full bg-red-500 hover:bg-red-600">
                  Reject Estimate
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this estimate. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-500 hover:bg-red-600">
              {isDeleting ? <Spinner className="mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
