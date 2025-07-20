"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function DeliverySuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const deliveryId = searchParams.get("id")

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-green-600">Delivery Confirmed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Delivery {deliveryId && <strong>#{deliveryId}</strong>} has been successfully confirmed.
          </p>
          <p className="text-sm text-muted-foreground">Thank you for completing the delivery.</p>
          <Button onClick={() => router.push("/deliveries")}>Back to Deliveries</Button>
        </CardContent>
      </Card>
    </div>
  )
}
