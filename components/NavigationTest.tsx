"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function NavigationTest() {
  const router = useRouter()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Next.js Link Component</CardTitle>
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
          <CardTitle>Next.js useRouter Hook</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/dashboard")}>
            Push to Dashboard
          </Button>
          <Button variant="outline" className="w-full bg-transparent" onClick={() => router.replace("/orders")}>
            Replace to Orders List
          </Button>
          <Button variant="outline" className="w-full bg-transparent" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button variant="outline" className="w-full bg-transparent" onClick={() => router.forward()}>
            Go Forward
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dynamic Routes & External Links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Link href="/orders/ORD123" passHref>
            <Button variant="outline" className="w-full bg-transparent">
              View Dynamic Order
            </Button>
          </Link>
          <Link href="https://vercel.com" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full bg-transparent">
              Open Vercel (External)
            </Button>
          </Link>
          <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/non-existent-page")}>
            Go to 404 Page
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
