"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SimpleNewOrderPage() {
  const router = useRouter()

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Order</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This is a simplified new order page for testing navigation.</p>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/orders")}>
              Back to Orders
            </Button>
            <Button>Create Order</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
