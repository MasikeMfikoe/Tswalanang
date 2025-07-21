import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewOrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-950 p-6">
      <header className="bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-between mb-6 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">New Order Section (Layout)</h1>
        <Link href="/orders" passHref>
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </header>
      <main className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle>New Order Workflow</CardTitle>
            <CardDescription>This content is part of the layout for new order creation.</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </main>
    </div>
  )
}
