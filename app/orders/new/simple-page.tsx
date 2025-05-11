"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function SimpleNewOrderPage() {
  const router = useRouter()
  const [poNumber, setPoNumber] = useState("")

  function generatePONumber() {
    const prefix = "PO"
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `${prefix}-${timestamp}-${random}`
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Order (Simple Page)</h1>
        <Button variant="outline" onClick={() => router.push("/orders")}>
          Back to Orders
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="poNumber">PO Number</Label>
              <div className="flex gap-2">
                <Input
                  id="poNumber"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="Enter PO number or generate one"
                />
                <Button type="button" variant="outline" onClick={() => setPoNumber(generatePONumber())}>
                  Generate
                </Button>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => router.push("/orders")}>
                Cancel
              </Button>
              <Button>Create Order</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
