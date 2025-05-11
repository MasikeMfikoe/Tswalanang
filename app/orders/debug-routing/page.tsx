"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function DebugRoutingPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Navigation Debug Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>This page helps diagnose navigation issues with the "Create New Order" button.</p>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Test Navigation Methods:</h3>

            <div className="flex flex-wrap gap-2">
              <a href="/orders/new" className="block">
                <Button variant="outline">Direct Link to New Order</Button>
              </a>

              <Link href="/orders/new">
                <Button variant="outline">Next.js Link to New Order</Button>
              </Link>

              <Button
                variant="outline"
                onClick={() => {
                  console.log("Using window.location")
                  window.location.href = "/orders/new"
                }}
              >
                window.location
              </Button>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium">Other Navigation Links:</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <Link href="/orders">
                  <Button variant="outline">Back to Orders</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
