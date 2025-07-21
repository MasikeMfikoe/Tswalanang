"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function NavigationTest() {
  const router = useRouter()

  const navigateTo = (path: string) => {
    router.push(path)
  }

  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Navigation Test</CardTitle>
        <CardDescription>Test different navigation paths within the application.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={() => navigateTo("/dashboard")} className="w-full">
          Go to Dashboard
        </Button>
        <Button onClick={() => navigateTo("/orders")} className="w-full">
          Go to Orders
        </Button>
        <Button onClick={() => navigateTo("/customers")} className="w-full">
          Go to Customers
        </Button>
        <Button onClick={() => navigateTo("/admin/users")} className="w-full">
          Go to Admin Users
        </Button>
        <Button onClick={() => navigateTo("/non-existent-page")} className="w-full" variant="outline">
          Go to Non-Existent Page (404)
        </Button>
        <Button onClick={() => navigateTo("/dashboard/error")} className="w-full" variant="destructive">
          Trigger Dashboard Error
        </Button>
      </CardContent>
    </Card>
  )
}
