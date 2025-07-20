"use client"

import { Input } from "@/components/ui/input"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { SignaturePad } from "@/components/ui/signature-pad" // Assuming a signature pad component
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

// Mock data for a delivery
const mockDelivery = {
  id: "DEL001",
  orderId: "ORD001",
  customerName: "Acme Corp",
  deliveryAddress: "123 Main St, Anytown, USA",
  items: ["Package A (10kg)", "Package B (5kg)"],
  status: "Out for Delivery",
}

export default function DeliveryConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const deliveryId = params.id as string

  const [delivery, setDelivery] = useState<typeof mockDelivery | null>(null)
  const [recipientName, setRecipientName] = useState("")
  const [notes, setNotes] = useState("")
  const [isDelivered, setIsDelivered] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // Simulate fetching delivery details
    setLoading(true)
    setTimeout(() => {
      if (deliveryId === mockDelivery.id) {
        setDelivery(mockDelivery)
      } else {
        setDelivery(null) // Not found
      }
      setLoading(false)
    }, 1000)
  }, [deliveryId])

  const handleSubmit = async () => {
    if (!isDelivered) {
      toast({
        title: "Error",
        description: "Please confirm delivery by checking the box.",
        variant: "destructive",
      })
      return
    }
    if (!recipientName.trim()) {
      toast({
        title: "Error",
        description: "Recipient name is required.",
        variant: "destructive",
      })
      return
    }
    if (!signature) {
      toast({
        title: "Error",
        description: "Recipient signature is required.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      // Simulate API call to confirm delivery
      console.log("Confirming delivery:", {
        deliveryId,
        recipientName,
        notes,
        signature,
        status: "Delivered",
      })
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay

      toast({
        title: "Delivery Confirmed",
        description: `Delivery ${deliveryId} successfully confirmed.`,
        variant: "success",
      })
      router.push(`/delivery-confirmation/success?id=${deliveryId}`)
    } catch (error) {
      console.error("Error confirming delivery:", error)
      toast({
        title: "Error",
        description: "Failed to confirm delivery. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2">Loading delivery details...</p>
      </div>
    )
  }

  if (!delivery) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Delivery Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The delivery with ID {deliveryId} could not be found.</p>
            <Button onClick={() => router.push("/deliveries")} className="mt-4">
              Back to Deliveries
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Confirm Delivery: {delivery.orderId}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div>
            <p>
              <strong>Customer:</strong> {delivery.customerName}
            </p>
            <p>
              <strong>Address:</strong> {delivery.deliveryAddress}
            </p>
            <p>
              <strong>Items:</strong> {delivery.items.join(", ")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientName">Recipient Name</Label>
            <Input
              id="recipientName"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Enter recipient's full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Delivery Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific notes about the delivery..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Recipient Signature</Label>
            <SignaturePad onSave={setSignature} />
            {signature && <div className="mt-2 text-sm text-gray-500">Signature captured.</div>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="isDelivered" checked={isDelivered} onCheckedChange={(checked) => setIsDelivered(!!checked)} />
            <Label htmlFor="isDelivered">Confirm delivery completed successfully</Label>
          </div>

          <Button onClick={handleSubmit} disabled={submitting || !isDelivered || !recipientName || !signature}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming...
              </>
            ) : (
              "Complete Delivery"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
