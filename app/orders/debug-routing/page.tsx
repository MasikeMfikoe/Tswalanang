"use client"

import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DebugRoutingPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Debug Routing"
        description="Test various routing scenarios and ensure navigation works as expected."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Internal Links</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full bg-transparent">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="outline" className="w-full bg-transparent">
                Go to Orders List
              </Button>
            </Link>
            <Link href="/customers">
              <Button variant="outline" className="w-full bg-transparent">
                Go to Customers List
              </Button>
            </Link>
            <Link href="/estimates/new">
              <Button variant="outline" className="w-full bg-transparent">
                Create New Estimate
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dynamic Routes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/orders/ORD001">
              <Button variant="outline" className="w-full bg-transparent">
                View Order ORD001
              </Button>
            </Link>
            <Link href="/customers/CUST001">
              <Button variant="outline" className="w-full bg-transparent">
                View Customer CUST001
              </Button>
            </Link>
            <Link href="/estimates/EST001">
              <Button variant="outline" className="w-full bg-transparent">
                View Estimate EST001
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error & Not Found</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/non-existent-page">
              <Button variant="outline" className="w-full bg-transparent">
                Go to Non-Existent Page
              </Button>
            </Link>
            {/* This would typically be triggered by an error within a component */}
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => {
                throw new Error("Simulated client error")
              }}
            >
              Simulate Client Error
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Routes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={async () => {
                const res = await fetch("/api/orders")
                const data = await res.json()
                console.log("API /api/orders response:", data)
                alert("Check console for API response!")
              }}
            >
              Fetch /api/orders
            </Button>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={async () => {
                const res = await fetch("/api/tracking-status?trackingNumber=TEST12345")
                const data = await res.json()
                console.log("API /api/tracking-status response:", data)
                alert("Check console for API response!")
              }}
            >
              Fetch /api/tracking-status
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
